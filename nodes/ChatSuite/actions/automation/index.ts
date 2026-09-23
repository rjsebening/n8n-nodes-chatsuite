import type { INodeProperties } from 'n8n-workflow';

import { automationStatusOptions } from '../../helpers/enums';
import { optionsProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'automation';
const SCOPED = ['get', 'execute', 'getExecutions', 'getExecution', 'getVersions'];

export const automationOperations: INodeProperties[] = [
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
				description: 'Execute an automation manually',
				action: 'Execute an automation',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one automation overview by ID',
				action: 'Get an automation',
			},
			{
				name: 'Get Execution',
				value: 'getExecution',
				description: 'Get execution details including the step history',
				action: 'Get an automation execution',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List automation overviews',
				action: 'Get many automations',
			},
			{
				name: 'Get Many Executions',
				value: 'getExecutions',
				description: 'List executions of an automation',
				action: 'Get many automation executions',
			},
			{
				name: 'Get Many Versions',
				value: 'getVersions',
				description: 'List saved versions of an automation',
				action: 'Get many automation versions',
			},
		],
	},
];

export const automationFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Automation',
		name: 'automationId',
		resource: RESOURCE,
		operations: SCOPED,
		loadOptionsMethod: 'getAutomations',
		description: 'The automation to act on',
		required: true,
	}),
	{
		displayName: 'Execution Name or ID',
		name: 'executionId',
		type: 'options',
		required: true,
		default: '',
		description:
			'The execution to fetch. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getAutomationExecutions',
			loadOptionsDependsOn: ['automationId'],
		},
		displayOptions: { show: { resource: [RESOURCE], operation: ['getExecution'] } },
	},

	...paginationProperties(RESOURCE, ['getAll', 'getExecutions', 'getVersions']),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['getAll'] } },
		options: [
			{
				displayName: 'Has Manual Trigger',
				name: 'hasManualTrigger',
				type: 'boolean',
				default: true,
				description: 'Whether to only return automations that can be triggered manually',
			},
			{
				displayName: 'Is Active',
				name: 'isActive',
				type: 'boolean',
				default: true,
				description: 'Whether to only return active automations',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Full text search across automation names',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'Active',
				description: 'Only return automations in this status',
				options: automationStatusOptions,
			},
		],
	},
	listOptionsProperty(RESOURCE, ['getAll', 'getExecutions', 'getVersions']),
];
