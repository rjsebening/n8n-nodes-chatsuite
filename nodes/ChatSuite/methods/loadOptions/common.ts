import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { csRequest, csRequestAllItems, unwrapList } from '../../helpers/apiclient';

/** First non-empty value among the given keys of a row */
function pick(row: IDataObject, keys: string[]): string {
	for (const key of keys) {
		const value = row[key];
		if (value !== undefined && value !== null && String(value).trim() !== '') {
			return String(value);
		}
	}
	return '';
}

/**
 * Knowledge entries are labelled by their free text (`content`, `question`),
 * which can run to many lines. Collapse it to one readable line so a dropdown
 * stays usable; the value is never touched.
 */
const MAX_LABEL_LENGTH = 80;

function toLabel(value: string): string {
	const singleLine = value.replace(/\s+/g, ' ').trim();
	return singleLine.length > MAX_LABEL_LENGTH
		? `${singleLine.slice(0, MAX_LABEL_LENGTH - 1).trimEnd()}…`
		: singleLine;
}

/** Maps API rows to sorted, de-duplicated dropdown options */
export function toOptions(
	rows: IDataObject[],
	labelKeys: string[],
	valueKeys: string[],
	describe?: (row: IDataObject) => string | undefined,
): INodePropertyOptions[] {
	const seen = new Set<string>();
	const options: INodePropertyOptions[] = [];

	for (const row of rows) {
		const value = pick(row, valueKeys);
		if (!value || seen.has(value)) continue;
		seen.add(value);

		const description = describe?.(row);
		options.push({
			name: toLabel(pick(row, labelKeys)) || value,
			value,
			...(description ? { description } : {}),
		});
	}

	return options.sort((a, b) => a.name.localeCompare(b.name));
}

/** Single-request loader for endpoints that answer with a bare array */
export async function fetchOptions(
	ctx: ILoadOptionsFunctions,
	path: string,
	labelKeys: string[],
	valueKeys: string[],
	qs: IDataObject = {},
	describe?: (row: IDataObject) => string | undefined,
): Promise<INodePropertyOptions[]> {
	const response = await csRequest(ctx, 'GET', path, { qs });
	return toOptions(unwrapList(response), labelKeys, valueKeys, describe);
}

/** Paged loader, capped so a dropdown never pulls an unbounded list */
export async function fetchOptionsAll(
	ctx: ILoadOptionsFunctions,
	path: string,
	labelKeys: string[],
	valueKeys: string[],
	qs: IDataObject = {},
	describe?: (row: IDataObject) => string | undefined,
	limit = 500,
): Promise<INodePropertyOptions[]> {
	const rows = await csRequestAllItems<IDataObject>(ctx, path, { qs, limit });
	return toOptions(rows, labelKeys, valueKeys, describe);
}

/**
 * Reads the value of another parameter a dependent dropdown relies on.
 * Handles both plain values and resourceLocator objects.
 */
export function currentParam(ctx: ILoadOptionsFunctions, name: string): string {
	const raw = ctx.getCurrentNodeParameter(name) as
		| string
		| number
		| { value?: string | number }
		| undefined
		| null;
	if (raw === undefined || raw === null) return '';
	if (typeof raw === 'object') return String(raw.value ?? '').trim();
	return String(raw).trim();
}
