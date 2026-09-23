import type { INodeProperties } from 'n8n-workflow';

import { dataFieldTypeOptions, periodTypeOptions } from '../../helpers/enums';
import { optionsProperty, stringProperty } from '../shared/locators.properties';

const RESOURCE = 'dataPoint';

export const dataPointOperations: INodeProperties[] = [
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
				description: 'Create a data point definition',
				action: 'Create a data point',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a data point definition',
				action: 'Delete a data point',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one data point definition by ID',
				action: 'Get a data point',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many data point definitions',
				action: 'Get many data points',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Fully replace a data point definition (PUT)',
				action: 'Update a data point',
			},
			{
				name: 'Update Partially',
				value: 'patch',
				description: 'Update only the given data point fields (PATCH)',
				action: 'Update a data point partially',
			},
		],
	},
];

const optionalFields: INodeProperties[] = [
	{
		displayName: 'Config (JSON)',
		name: 'config',
		type: 'json',
		default: '',
		description: 'Field type specific configuration, for example the options of a selection',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
		description: 'What this data point records',
	},
	{
		displayName: 'Period Type',
		name: 'periodType',
		type: 'options',
		default: 'Month',
		description: 'Period granularity the values are recorded for',
		options: periodTypeOptions,
	},
	{
		displayName: 'Short Name',
		name: 'shortName',
		type: 'string',
		default: '',
		description: 'Abbreviation shown in compact views',
	},
];

export const dataPointFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Data Point',
		name: 'dataPointId',
		resource: RESOURCE,
		operations: ['get', 'update', 'patch', 'delete'],
		loadOptionsMethod: 'getDataPoints',
		description: 'The data point definition to act on',
		required: true,
	}),

	stringProperty('Name', 'name', RESOURCE, ['create', 'update'], 'Name of the data point'),
	{
		displayName: 'Field Type',
		name: 'fieldType',
		type: 'options',
		required: true,
		default: 'Number',
		description: 'Data type the values are stored as. It cannot be changed after creation.',
		options: dataFieldTypeOptions,
		displayOptions: { show: { resource: [RESOURCE], operation: ['create'] } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create', 'update'] } },
		options: optionalFields,
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['patch'] } },
		options: [
			...optionalFields,
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name of the data point',
			},
		].sort((a, b) => a.displayName.localeCompare(b.displayName)) as INodeProperties[],
	},
];
