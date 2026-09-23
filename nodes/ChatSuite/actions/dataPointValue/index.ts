import type { INodeProperties } from 'n8n-workflow';

import { locatorProperty, optionsProperty, stringProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'dataPointValue';
const ALL = ['getAll', 'write', 'delete'];

export const dataPointValueOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete one customer data point value for a period',
				action: 'Delete a data point value',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many values for one customer and data point',
				action: 'Get many data point values',
			},
			{
				name: 'Write',
				value: 'write',
				description: 'Write or update a customer data point value',
				action: 'Write a data point value',
			},
		],
	},
];

/** The period selector maps onto PublicDataPointPeriodRequest */
const periodFields: INodeProperties[] = [
	{
		displayName: 'Date',
		name: 'date',
		type: 'dateTime',
		default: '',
		description: 'Exact day of the period, used for the Day period type',
	},
	{
		displayName: 'Month',
		name: 'month',
		type: 'number',
		default: 0,
		description: 'Month number (1-12)',
	},
	{
		displayName: 'Quarter',
		name: 'quarter',
		type: 'number',
		default: 0,
		description: 'Quarter number (1-4)',
	},
	{
		displayName: 'Week',
		name: 'week',
		type: 'number',
		default: 0,
		description: 'ISO week number',
	},
	{
		displayName: 'Year',
		name: 'year',
		type: 'number',
		default: 0,
		description: 'Calendar year of the period',
	},
];

export const dataPointValueFields: INodeProperties[] = [
	locatorProperty({
		displayName: 'Customer',
		name: 'phoneNumber',
		resource: RESOURCE,
		operations: ALL,
		searchListMethod: 'searchCustomers',
		idLabel: 'Phone Number',
		idPlaceholder: '+4915112345678',
		description: 'The customer the value belongs to',
	}),
	optionsProperty({
		displayName: 'Data Point',
		name: 'dataPointId',
		resource: RESOURCE,
		operations: ALL,
		loadOptionsMethod: 'getDataPoints',
		description: 'The data point definition the value belongs to',
		required: true,
	}),

	stringProperty('Value', 'value', RESOURCE, ['write'], 'The value to store, as text'),
	{
		displayName: 'Period',
		name: 'period',
		type: 'collection',
		placeholder: 'Add Period Field',
		default: {},
		description:
			"Identifies the period the value belongs to. Fill the fields matching the data point's period type.",
		displayOptions: { show: { resource: [RESOURCE], operation: ['write', 'delete'] } },
		options: periodFields,
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['write'] } },
		options: [
			{
				displayName: 'Recorded At',
				name: 'recordedAt',
				type: 'dateTime',
				default: '',
				description: 'When the value was recorded',
			},
			{
				displayName: 'Source Identifier',
				name: 'sourceIdentifier',
				type: 'string',
				default: '',
				description: 'Identifier of the system that produced the value',
			},
		],
	},

	...paginationProperties(RESOURCE, ['getAll']),
	listOptionsProperty(RESOURCE, ['getAll']),
];
