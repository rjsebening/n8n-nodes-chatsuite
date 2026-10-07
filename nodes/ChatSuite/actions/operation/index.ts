import type { INodeProperties } from 'n8n-workflow';

import { stringProperty } from '../shared/locators.properties';

const RESOURCE = 'operation';

export const operationOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'get',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Cancel',
				value: 'cancel',
				description:
					'Stop an operation; parts that have not started are cancelled, finished parts stay done',
				action: 'Cancel an operation',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get the current state and progress of an operation',
				action: 'Get an operation',
			},
		],
	},
];

export const operationFields: INodeProperties[] = [
	stringProperty(
		'Operation ID',
		'operationId',
		RESOURCE,
		['get', 'cancel'],
		'ID of the operation, as returned by a long-running call such as Customer → Batch Onboarding',
		{ placeholder: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
	),
];
