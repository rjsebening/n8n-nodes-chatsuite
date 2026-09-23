import type { INodeProperties } from 'n8n-workflow';

import { knowledgeQueryProperties } from '../shared/knowledge.properties';
import { locatorProperty, stringProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'customerKnowledge';
const ALL = ['getAll', 'create', 'query', 'get', 'patch', 'delete', 'approve'];
const SCOPED = ['get', 'patch', 'delete', 'approve'];

export const customerKnowledgeOperations: INodeProperties[] = [
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
				description: 'Approve a customer knowledge entry',
				action: 'Approve a customer knowledge entry',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a customer knowledge entry',
				action: 'Create a customer knowledge entry',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a customer knowledge entry',
				action: 'Delete a customer knowledge entry',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one customer knowledge entry',
				action: 'Get a customer knowledge entry',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List customer knowledge entries',
				action: 'Get many customer knowledge entries',
			},
			{
				name: 'Query',
				value: 'query',
				description: 'Ask a RAG-backed question against the customer knowledge',
				action: 'Query the customer knowledge',
			},
			{
				name: 'Update Partially',
				value: 'patch',
				description: 'Update only the given fields of a customer knowledge entry',
				action: 'Update a customer knowledge entry partially',
			},
		],
	},
];

export const customerKnowledgeFields: INodeProperties[] = [
	locatorProperty({
		displayName: 'Customer',
		name: 'phoneNumber',
		resource: RESOURCE,
		operations: ALL,
		searchListMethod: 'searchCustomers',
		idLabel: 'Phone Number',
		idPlaceholder: '+4915112345678',
		description: 'The customer whose knowledge is addressed',
	}),
	{
		displayName: 'Knowledge Entry Name or ID',
		name: 'knowledgeId',
		type: 'options',
		required: true,
		default: '',
		description:
			'The customer knowledge entry to act on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getCustomerKnowledge',
			loadOptionsDependsOn: ['phoneNumber.value'],
		},
		displayOptions: { show: { resource: [RESOURCE], operation: SCOPED } },
	},

	stringProperty('Content', 'content', RESOURCE, ['create'], 'Text content of the entry', {
		typeOptions: { rows: 4 },
	}),
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
			{
				displayName: 'Is Approved',
				name: 'isApproved',
				type: 'boolean',
				default: true,
				description: 'Whether the entry is usable for retrieval',
			},
		],
	},

	...knowledgeQueryProperties(RESOURCE, ['query']),

	{
		displayName: 'WhatsApp Group Name or ID',
		name: 'whatsAppGroupId',
		type: 'options',
		default: '',
		description:
			'Scope the entry to one WhatsApp group of the customer. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getCustomerWhatsappGroups',
			loadOptionsDependsOn: ['phoneNumber.value'],
		},
		displayOptions: { show: { resource: [RESOURCE], operation: ALL } },
	},

	...paginationProperties(RESOURCE, ['getAll']),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['getAll'] } },
		options: [
			{
				displayName: 'Is Approved',
				name: 'isApproved',
				type: 'boolean',
				default: true,
				description: 'Whether to only return approved entries',
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
		],
	},
	listOptionsProperty(RESOURCE, ['getAll']),
];
