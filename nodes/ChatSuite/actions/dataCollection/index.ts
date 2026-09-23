import type { INodeProperties } from 'n8n-workflow';

import { dataCollectionScopeOptions } from '../../helpers/enums';
import { optionsField, optionsProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'dataCollection';

export const dataCollectionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Execute',
				value: 'execute',
				description: 'Execute a data collection manually',
				action: 'Execute a data collection',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List data collection overviews',
				action: 'Get many data collections',
			},
		],
	},
];

export const dataCollectionFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Data Collection',
		name: 'dataCollectionId',
		resource: RESOURCE,
		operations: ['execute'],
		loadOptionsMethod: 'getDataCollections',
		description: 'The data collection to execute',
		required: true,
	}),
	{
		displayName: 'Scope',
		name: 'scope',
		type: 'options',
		default: 'AllTargets',
		description: 'Whether to run for every target or for one customer only',
		options: dataCollectionScopeOptions,
		displayOptions: { show: { resource: [RESOURCE], operation: ['execute'] } },
	},
	{
		displayName: 'Execute Options',
		name: 'executeOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['execute'] } },
		options: [
			optionsField(
				'Group Category Names',
				'groupCategoryNames',
				'getWhatsappGroupCategories',
				'Limit a customer-scoped group collection to these group categories',
				{ type: 'multiOptions', default: [] },
			),
			{
				displayName: 'Phone Number',
				name: 'phoneNumber',
				type: 'string',
				default: '',
				placeholder: '+4915112345678',
				description: 'Customer to run the collection for, required for the Customer scope',
			},
			{
				displayName: 'WhatsApp Channel ID',
				name: 'whatsAppBotId',
				type: 'string',
				default: '',
				description: 'Exact WhatsApp channel for a direct-chat collection',
			},
			{
				displayName: 'WhatsApp Group ID',
				name: 'whatsAppGroupId',
				type: 'string',
				default: '',
				description: 'Exact group for a group-channel collection',
			},
		],
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
			optionsField(
				'Category Name',
				'categoryName',
				'getCustomerCategories',
				'Only return collections targeting this customer category',
			),
			optionsField(
				'Channel',
				'channel',
				'getWhatsappChannels',
				'Only return collections on this WhatsApp channel',
			),
			optionsField(
				'Product Code',
				'productCode',
				'getProducts',
				'Only return collections targeting this product',
			),
			{
				displayName: 'Schedule Type',
				name: 'scheduleType',
				type: 'string',
				default: '',
				description: 'Only return collections with this schedule type',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				description: 'Only return collections in this status',
			},
		],
	},
	listOptionsProperty(RESOURCE, ['getAll']),
];
