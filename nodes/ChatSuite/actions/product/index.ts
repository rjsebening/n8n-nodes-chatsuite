import type { INodeProperties } from 'n8n-workflow';

import { locatorProperty, optionsField, stringProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'product';

export const productOperations: INodeProperties[] = [
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
				description: 'Create a product',
				action: 'Create a product',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a product',
				action: 'Delete a product',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one product by product code',
				action: 'Get a product',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many products',
				action: 'Get many products',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Fully replace a product (PUT)',
				action: 'Update a product',
			},
			{
				name: 'Update Partially',
				value: 'patch',
				description: 'Update only the given product fields (PATCH)',
				action: 'Update a product partially',
			},
		],
	},
];

const sharedFields: INodeProperties[] = [
	{
		displayName: 'Color',
		name: 'color',
		type: 'color',
		default: '',
		placeholder: '#1F6FEB',
		description: 'UI color token or hex color',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'Optional product description',
	},
	optionsField(
		'Product Category Names',
		'productCategoryNames',
		'getProductCategories',
		'Product category names to assign; missing names are created',
		{ type: 'multiOptions', default: [] },
	),
];

export const productFields: INodeProperties[] = [
	locatorProperty({
		displayName: 'Product',
		name: 'productCode',
		resource: RESOURCE,
		operations: ['get', 'update', 'patch', 'delete'],
		searchListMethod: 'searchProducts',
		idLabel: 'Product Code',
		idPlaceholder: 'MC',
		description: 'The product, addressed by its product code',
	}),

	...paginationProperties(RESOURCE, ['getAll']),
	listOptionsProperty(RESOURCE, ['getAll']),

	stringProperty(
		'Product Code',
		'newProductCode',
		RESOURCE,
		['create', 'update'],
		'Product code used by tenant integrations, unique per tenant',
		{ placeholder: 'MC' },
	),
	stringProperty(
		'Name',
		'name',
		RESOURCE,
		['create', 'update'],
		'Human-readable product name shown in ChatSuite',
	),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create', 'update'] } },
		options: sharedFields,
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['patch'] } },
		options: [
			...sharedFields,
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New human-readable product name',
			},
			{
				displayName: 'Product Code',
				name: 'productCode',
				type: 'string',
				default: '',
				description: 'New product code; must stay unique per tenant',
			},
		].sort((a, b) => a.displayName.localeCompare(b.displayName)) as INodeProperties[],
	},
];
