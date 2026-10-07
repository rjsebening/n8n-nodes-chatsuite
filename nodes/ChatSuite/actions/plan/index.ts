import type { INodeProperties } from 'n8n-workflow';

const RESOURCE = 'plan';

export const planOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getUsage',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Get Usage',
				value: 'getUsage',
				description: 'Get the current plan usage per resource (used, limit, remaining, unlimited)',
				action: 'Get plan usage',
			},
		],
	},
];

export const planFields: INodeProperties[] = [];
