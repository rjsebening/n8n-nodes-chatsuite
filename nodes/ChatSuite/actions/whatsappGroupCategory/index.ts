import type { INodeProperties } from 'n8n-workflow';

import { optionsProperty } from '../shared/locators.properties';

const RESOURCE = 'whatsappGroupCategory';

export const whatsappGroupCategoryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get one WhatsApp group category by name',
				action: 'Get a group category',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many WhatsApp group categories',
				action: 'Get many group categories',
			},
		],
	},
];

export const whatsappGroupCategoryFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Category Name',
		name: 'categoryName',
		resource: RESOURCE,
		operations: ['get'],
		loadOptionsMethod: 'getWhatsappGroupCategories',
		description: 'The WhatsApp group category to fetch',
		required: true,
	}),
];
