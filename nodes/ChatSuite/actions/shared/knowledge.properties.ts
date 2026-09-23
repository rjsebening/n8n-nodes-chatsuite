import type { INodeProperties } from 'n8n-workflow';

import { knowledgeProcessingStatusOptions } from '../../helpers/enums';
import { optionsField } from './locators.properties';

/** Filters shared by the Information and Q&A list endpoints */
export function knowledgeListFilters(resource: string): INodeProperties {
	return {
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [resource], operation: ['getAll'] } },
		options: [
			{
				displayName: 'Is Approved',
				name: 'isApproved',
				type: 'boolean',
				default: true,
				description: 'Whether to only return approved entries',
			},
			{
				displayName: 'Processing Status',
				name: 'processingStatus',
				type: 'options',
				default: 'Completed',
				description: 'Only return entries in this processing state',
				options: knowledgeProcessingStatusOptions,
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Full text search across the entries',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Only return entries created by this source',
			},
			optionsField(
				'Ticket Category ID',
				'ticketCategoryId',
				'getTicketCategoryIds',
				'Only return entries assigned to this ticket category',
			),
		],
	};
}

/** RAG query parameters, identical for the global and the customer query */
export function knowledgeQueryProperties(
	resource: string,
	operations: string[],
): INodeProperties[] {
	return [
		{
			displayName: 'Question',
			name: 'question',
			type: 'string',
			required: true,
			typeOptions: { rows: 2 },
			default: '',
			description: 'The question to answer from the knowledge base',
			displayOptions: { show: { resource: [resource], operation: operations } },
		},
		{
			displayName: 'Options',
			name: 'queryOptions',
			type: 'collection',
			placeholder: 'Add Option',
			default: {},
			displayOptions: { show: { resource: [resource], operation: operations } },
			options: [
				{
					displayName: 'Minimum Score',
					name: 'minScore',
					type: 'number',
					typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
					default: 0,
					description: 'Discard matches below this relevance score',
				},
				{
					displayName: 'Top K',
					name: 'topK',
					type: 'number',
					typeOptions: { minValue: 1 },
					default: 5,
					description: 'How many source chunks to retrieve',
				},
			],
		},
	];
}

/** Ticket category assignment + approval flag, shared by Information / Q&A / Documents */
export const ticketCategoryIdsField: INodeProperties = {
	displayName: 'Ticket Category Names or IDs',
	name: 'ticketCategoryIds',
	type: 'multiOptions',
	default: [],
	description:
		'Ticket categories to assign to this entry. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	typeOptions: { loadOptionsMethod: 'getTicketCategoryIds' },
};

export const isApprovedField: INodeProperties = {
	displayName: 'Is Approved',
	name: 'isApproved',
	type: 'boolean',
	default: true,
	description: 'Whether the entry is immediately usable for retrieval',
};
