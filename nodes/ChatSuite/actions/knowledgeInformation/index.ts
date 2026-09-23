import type { INodeProperties } from 'n8n-workflow';

import { optionsProperty, stringProperty } from '../shared/locators.properties';
import {
	isApprovedField,
	knowledgeListFilters,
	knowledgeQueryProperties,
	ticketCategoryIdsField,
} from '../shared/knowledge.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'knowledgeInformation';
const SCOPED = ['get', 'patch', 'delete', 'approve', 'reprocess'];

export const knowledgeInformationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Approve',
				value: 'approve',
				description: 'Idempotently approve an Information entry',
				action: 'Approve an information entry',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create an Information entry',
				action: 'Create an information entry',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Soft-delete an Information entry and remove it from retrieval',
				action: 'Delete an information entry',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one Information entry',
				action: 'Get an information entry',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List Information entries',
				action: 'Get many information entries',
			},
			{
				name: 'Query',
				value: 'query',
				description: 'Ask a RAG-backed question across Information, Q&A and Documents',
				action: 'Query the knowledge base',
			},
			{
				name: 'Reprocess',
				value: 'reprocess',
				description: 'Re-queue a failed or pending entry for reformulation',
				action: 'Reprocess an information entry',
			},
			{
				name: 'Update Partially',
				value: 'patch',
				description: 'Update only the given fields of an Information entry',
				action: 'Update an information entry partially',
			},
		],
	},
];

export const knowledgeInformationFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Information Entry',
		name: 'knowledgeId',
		resource: RESOURCE,
		operations: SCOPED,
		loadOptionsMethod: 'getKnowledgeInformation',
		description: 'The Information entry to act on',
		required: true,
	}),

	stringProperty('Content', 'content', RESOURCE, ['create'], 'Text content of the entry', {
		typeOptions: { rows: 4 },
	}),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create'] } },
		options: [isApprovedField, ticketCategoryIdsField],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['patch'] } },
		options: [
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'New text content of the entry',
			},
			isApprovedField,
			ticketCategoryIdsField,
		],
	},

	...knowledgeQueryProperties(RESOURCE, ['query']),

	...paginationProperties(RESOURCE, ['getAll']),
	knowledgeListFilters(RESOURCE),
	listOptionsProperty(RESOURCE, ['getAll']),
];
