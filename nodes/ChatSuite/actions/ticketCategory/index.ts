import type { INodeProperties } from 'n8n-workflow';

import { topicDistributionModeOptions } from '../../helpers/enums';
import { optionsProperty, stringProperty } from '../shared/locators.properties';

const RESOURCE = 'ticketCategory';

export const ticketCategoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a ticket category',
				action: 'Create a ticket category',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a ticket category',
				action: 'Delete a ticket category',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one ticket category by name',
				action: 'Get a ticket category',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many ticket categories',
				action: 'Get many ticket categories',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Fully replace a ticket category (PUT)',
				action: 'Update a ticket category',
			},
		],
	},
];

const writableFields: INodeProperties[] = [
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'What this category covers',
	},
	{
		displayName: 'Distribution Mode',
		name: 'distributionMode',
		type: 'options',
		default: 'FairDistribution',
		description: 'How tickets of this category are spread across the assigned members',
		options: topicDistributionModeOptions,
	},
	{
		displayName: 'Examples',
		name: 'examples',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'Example requests that belong into this category',
	},
	{
		displayName: 'Handling Suggestion',
		name: 'handlingSuggestion',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'Guidance on how tickets of this category should be handled',
	},
	{
		displayName: 'Is Active',
		name: 'isActive',
		type: 'boolean',
		default: true,
		description: 'Whether the category is active',
	},
	{
		displayName: 'Member User IDs',
		name: 'memberUserIds',
		type: 'string',
		default: '',
		description:
			'Comma-separated team member user IDs assigned to this topic. An empty list clears the assignment.',
	},
	{
		displayName: 'Ordered Member User IDs',
		name: 'orderedMemberUserIds',
		type: 'string',
		default: '',
		description:
			'Comma-separated ordered member IDs for PrimaryAndBackup; takes precedence over Member User IDs',
	},
	{
		displayName: 'Sort Order',
		name: 'sortOrder',
		type: 'number',
		default: 0,
		description: 'Position of the category in the ChatSuite UI',
	},
	{
		displayName: 'Topic Group ID',
		name: 'topicGroupId',
		type: 'string',
		default: '',
		description: 'Optional topic area or sub-area; empty keeps the topic at root level',
	},
];

export const ticketCategoryFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Category Name',
		name: 'categoryName',
		resource: RESOURCE,
		operations: ['get', 'update', 'delete'],
		loadOptionsMethod: 'getTicketCategories',
		description: 'The ticket category to act on',
		required: true,
	}),

	stringProperty('Name', 'name', RESOURCE, ['create', 'update'], 'Ticket category name'),
	stringProperty('Color', 'color', RESOURCE, ['create', 'update'], 'UI color token or hex color', {
		placeholder: '#1F6FEB',
	}),
	stringProperty(
		'Icon',
		'icon',
		RESOURCE,
		['create', 'update'],
		'Icon identifier for the category',
		{
			placeholder: 'ticket',
		},
	),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create', 'update'] } },
		options: writableFields,
	},
];
