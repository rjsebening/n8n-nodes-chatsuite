import type { INodeProperties } from 'n8n-workflow';

const RESOURCE = 'apiCall';

export const apiCallOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'request',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Request',
				value: 'request',
				description: 'Send a request to any ChatSuite API endpoint',
				action: 'Make a custom API call',
			},
		],
	},
];

export const apiCallFields: INodeProperties[] = [
	{
		displayName: 'Method',
		name: 'method',
		type: 'options',
		default: 'GET',
		description: 'HTTP method of the request',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{ name: 'DELETE', value: 'DELETE' },
			{ name: 'GET', value: 'GET' },
			{ name: 'PATCH', value: 'PATCH' },
			{ name: 'POST', value: 'POST' },
			{ name: 'PUT', value: 'PUT' },
		],
	},
	{
		displayName: 'Path',
		name: 'path',
		type: 'string',
		required: true,
		default: '/api/v1/',
		placeholder: '/api/v1/customer',
		description:
			'Path relative to the API base URL. A missing /api/v1 prefix is added automatically.',
		displayOptions: { show: { resource: [RESOURCE] } },
	},
	{
		displayName: 'Query Parameters (JSON)',
		name: 'queryParameters',
		type: 'json',
		default: '',
		description: 'Query string parameters as a JSON object',
		displayOptions: { show: { resource: [RESOURCE] } },
	},
	{
		displayName: 'Body (JSON)',
		name: 'body',
		type: 'json',
		default: '',
		description: 'Request body as a JSON object',
		displayOptions: {
			show: { resource: [RESOURCE], method: ['POST', 'PUT', 'PATCH', 'DELETE'] },
		},
	},
];
