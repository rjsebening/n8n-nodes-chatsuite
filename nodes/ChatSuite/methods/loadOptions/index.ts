import type { IDataObject, ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

import { csGetWebhookEvents, csRequest } from '../../helpers/apiclient';
import { seg } from '../../helpers/params';
import { currentParam, fetchOptions, fetchOptionsAll, toOptions } from './common';

// --- Automations -----------------------------------------------------------

export async function getAutomations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchOptionsAll(this, '/api/v1/automation', ['name'], ['automationId']);
}

export async function getAutomationExecutions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const automationId = currentParam(this, 'automationId');
	if (!automationId) return [];

	const rows = await csRequest<unknown>(
		this,
		'GET',
		`/api/v1/automation/${seg(automationId)}/execution`,
		{ qs: { $top: 100, $orderby: 'startedAt desc' } },
	);
	const list = Array.isArray(rows) ? rows : (((rows as IDataObject)?.data as IDataObject[]) ?? []);

	return list.map((row) => ({
		name: `${String(row.status ?? 'Execution')} - ${String(
			row.startedAt ?? row.createdAt ?? row.executionId ?? '',
		)}`,
		value: String(row.executionId ?? row.id ?? ''),
	}));
}

export async function getAutomationVersions(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const automationId = currentParam(this, 'automationId');
	if (!automationId) return [];

	const rows = await csRequest<unknown>(
		this,
		'GET',
		`/api/v1/automation/${seg(automationId)}/version`,
		{ qs: { $top: 100 } },
	);
	const list = Array.isArray(rows) ? rows : (((rows as IDataObject)?.data as IDataObject[]) ?? []);

	return list.map((row) => ({
		name: `Version ${String(row.versionNumber ?? row.version ?? '')}`,
		value: String(row.versionNumber ?? row.version ?? ''),
	}));
}

// --- Data collections & data points ---------------------------------------

export async function getDataCollections(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptionsAll(
		this,
		'/api/v1/data-collection',
		['name', 'title'],
		['dataCollectionId', 'id'],
	);
}

export async function getDataPoints(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchOptions(
		this,
		'/api/v1/data-point',
		['name', 'shortName'],
		['dataPointId'],
		{},
		(row) => (row.description ? String(row.description) : undefined),
	);
}

// --- Categories ------------------------------------------------------------

export async function getCustomerCategories(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptions(this, '/api/v1/customer-category', ['name'], ['name']);
}

export async function getProductCategories(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptions(this, '/api/v1/product-category', ['name'], ['name']);
}

export async function getTicketCategories(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptions(this, '/api/v1/ticket-category', ['name'], ['name']);
}

/** Same list as getTicketCategories, but keyed by id for knowledge assignments */
export async function getTicketCategoryIds(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptions(this, '/api/v1/ticket-category', ['name'], ['id']);
}

export async function getWhatsappGroupCategories(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptions(this, '/api/v1/whatsapp-group-category', ['name'], ['name']);
}

// --- Tickets ---------------------------------------------------------------

export async function getTicketStates(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptions(this, '/api/v1/ticket/states', ['name'], ['name']);
}

// --- WhatsApp channels & groups -------------------------------------------

export async function getWhatsappChannels(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptions(
		this,
		'/api/v1/whatsapp-channel',
		['kanalName'],
		['kanalName'],
		{},
		(row) => (row.status ? `Status: ${String(row.status)}` : undefined),
	);
}

/** WhatsApp groups of the customer selected in the sibling parameter */
export async function getCustomerWhatsappGroups(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const phoneNumber = currentParam(this, 'phoneNumber');
	if (!phoneNumber) return [];

	const customer = await csRequest<IDataObject>(
		this,
		'GET',
		`/api/v1/customer/${seg(phoneNumber)}`,
	);
	const groups = (customer?.whatsAppGroups as IDataObject[]) ?? [];

	return toOptions(groups, ['groupName', 'whatsAppGroupName', 'name'], ['whatsAppGroupId', 'id'], (row) =>
		row.isPrimary === true ? 'Primary group' : undefined,
	);
}

export async function getGroupParticipants(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const kanalName = currentParam(this, 'kanalName');
	const groupId = currentParam(this, 'groupId');
	const groupName = currentParam(this, 'groupName');
	if (!kanalName || (!groupId && !groupName)) return [];

	const response = await csRequest<IDataObject>(this, 'GET', '/api/v1/group/participants', {
		qs: { kanalName, groupId, groupName },
	});
	const participants = (response?.participants as IDataObject[]) ?? [];

	return toOptions(participants, ['name', 'pushName', 'phoneNumber'], ['phoneNumber']);
}

// --- Knowledge -------------------------------------------------------------

export async function getKnowledgeDocuments(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptionsAll(
		this,
		'/api/v1/knowledge/documents',
		['title', 'fileName', 'name'],
		['documentId', 'id'],
	);
}

export async function getKnowledgeInformation(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	return await fetchOptionsAll(
		this,
		'/api/v1/knowledge',
		['title', 'content'],
		['knowledgeId', 'id'],
	);
}

export async function getKnowledgeQa(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchOptionsAll(
		this,
		'/api/v1/knowledge/qa',
		['question', 'title'],
		['knowledgeId', 'id'],
	);
}

export async function getCustomerKnowledge(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const phoneNumber = currentParam(this, 'phoneNumber');
	if (!phoneNumber) return [];

	return await fetchOptionsAll(
		this,
		`/api/v1/customer/${seg(phoneNumber)}/knowledge`,
		['title', 'content'],
		['knowledgeId', 'id'],
	);
}

// --- Team members ----------------------------------------------------------

export async function getTeamMembers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const response = await csRequest<unknown>(this, 'GET', '/api/v1/team-member');
	const rows = Array.isArray(response)
		? (response as IDataObject[])
		: (((response as IDataObject)?.data as IDataObject[]) ?? []);

	return rows
		.map((row) => {
			const name = [row.firstName, row.lastName].filter(Boolean).join(' ').trim();
			return {
				name: name ? `${name} (${String(row.email ?? '')})` : String(row.email ?? ''),
				value: String(row.email ?? ''),
			};
		})
		.filter((option) => option.value !== '')
		.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getTeamMemberAbsences(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const email = currentParam(this, 'email');
	if (!email) return [];

	const response = await csRequest<unknown>(
		this,
		'GET',
		`/api/v1/team-member/${seg(email)}/absence`,
	);
	const rows = Array.isArray(response)
		? (response as IDataObject[])
		: (((response as IDataObject)?.data as IDataObject[]) ?? []);

	return rows.map((row) => ({
		name: `${String(row.startDate ?? row.from ?? '')} - ${String(row.endDate ?? row.to ?? '')}`,
		value: String(row.absenceId ?? row.id ?? ''),
	}));
}

// --- Products --------------------------------------------------------------

export async function getProducts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchOptionsAll(this, '/api/v1/product', ['name'], ['productCode']);
}

// --- Webhooks --------------------------------------------------------------

export async function getWebhooks(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	return await fetchOptions(this, '/api/v1/webhook', ['description', 'url'], ['id'], {}, (row) =>
		row.url ? String(row.url) : undefined,
	);
}

export async function getWebhookEvents(
	this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
	const events = await csGetWebhookEvents(this);
	return events
		.map((event) => ({ name: event, value: event }))
		.sort((a, b) => a.name.localeCompare(b.name));
}
