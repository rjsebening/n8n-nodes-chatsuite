import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchItems,
	INodeListSearchResult,
} from 'n8n-workflow';

import { csRequest, unwrapList, type ListResponse } from '../../helpers/apiclient';

const PAGE_SIZE = 100;

/** One page of an OData list endpoint, mapped into resourceLocator entries */
async function searchPage(
	ctx: ILoadOptionsFunctions,
	path: string,
	qs: IDataObject,
	paginationToken: string | undefined,
	map: (row: IDataObject) => INodeListSearchItems | undefined,
): Promise<INodeListSearchResult> {
	const response = await csRequest<ListResponse | IDataObject[]>(ctx, 'GET', path, {
		qs: { ...qs, $top: PAGE_SIZE, $skiptoken: paginationToken },
	});

	const rows = unwrapList(response);
	const results = rows
		.map(map)
		.filter((entry): entry is INodeListSearchItems => entry !== undefined);

	const page = Array.isArray(response) ? undefined : (response as ListResponse).page;
	const nextToken = page?.hasMore ? (page.nextSkipToken ?? undefined) : undefined;

	return { results, paginationToken: nextToken };
}

/** Client side filter for endpoints without a `search` query parameter */
function matches(filter: string | undefined, ...values: unknown[]): boolean {
	if (!filter) return true;
	const needle = filter.toLowerCase();
	return values.some((value) =>
		String(value ?? '')
			.toLowerCase()
			.includes(needle),
	);
}

export async function searchCustomers(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchPage(this, '/api/v1/customer', { search: filter }, paginationToken, (row) => {
		const phoneNumber = String(row.phoneNumber ?? '');
		if (!phoneNumber) return undefined;
		const label = String(row.name ?? row.companyName ?? phoneNumber);
		return { name: `${label} (${phoneNumber})`, value: phoneNumber };
	});
}

export async function searchTickets(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	return await searchPage(
		this,
		'/api/v1/ticket',
		{ search: filter, $orderby: 'createdAt desc' },
		paginationToken,
		(row) => {
			const ticketNumber = row.ticketNumber;
			if (ticketNumber === undefined || ticketNumber === null) return undefined;
			const key = String(row.ticketKey ?? `#${ticketNumber}`);
			// `requesterName` is nullable in the API - fall back to the customer
			// so an entry never degrades to a bare key with a dangling dash
			const requester = String(row.requesterName ?? row.customerName ?? '').trim();
			return { name: requester ? `${key} - ${requester}` : key, value: String(ticketNumber) };
		},
	);
}

export async function searchProducts(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	// The product list endpoint has no `search` parameter - filter locally.
	const page = await searchPage(this, '/api/v1/product', {}, paginationToken, (row) => {
		const productCode = String(row.productCode ?? '');
		if (!productCode) return undefined;
		if (!matches(filter, row.name, productCode)) return undefined;
		return { name: `${String(row.name ?? productCode)} (${productCode})`, value: productCode };
	});
	return page;
}

export async function searchTeamMembers(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const response = await csRequest<IDataObject[] | ListResponse>(
		this,
		'GET',
		'/api/v1/team-member',
	);
	const rows = unwrapList(response);

	const results: INodeListSearchItems[] = [];
	for (const row of rows) {
		const email = String(row.email ?? '');
		if (!email) continue;
		const name = [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
		if (!matches(filter, name, email)) continue;
		results.push({ name: name ? `${name} (${email})` : email, value: email });
	}

	return { results };
}
