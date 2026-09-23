import type { INodeProperties } from 'n8n-workflow';

import { optionsProperty, stringProperty } from '../shared/locators.properties';

const RESOURCE = 'webhook';
const SCOPED = ['update', 'delete', 'test'];

export const webhookOperations: INodeProperties[] = [
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
				description: 'Create a webhook subscription',
				action: 'Create a webhook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a webhook subscription',
				action: 'Delete a webhook',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List webhook subscriptions',
				action: 'Get many webhooks',
			},
			{
				name: 'Get Many Events',
				value: 'getEvents',
				description: 'List the available webhook event names',
				action: 'Get many webhook events',
			},
			{
				name: 'Test',
				value: 'test',
				description: 'Send a test payload to a webhook subscription',
				action: 'Test a webhook',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a webhook subscription',
				action: 'Update a webhook',
			},
		],
	},
];

export const webhookFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Webhook',
		name: 'webhookId',
		resource: RESOURCE,
		operations: SCOPED,
		loadOptionsMethod: 'getWebhooks',
		description: 'The webhook subscription to act on',
		required: true,
	}),
	stringProperty(
		'URL',
		'url',
		RESOURCE,
		['create', 'update'],
		'HTTPS endpoint the events are delivered to',
		{ placeholder: 'https://example.com/chatsuite/webhook' },
	),
	optionsProperty({
		displayName: 'Events',
		name: 'events',
		resource: RESOURCE,
		operations: ['create', 'update'],
		loadOptionsMethod: 'getWebhookEvents',
		description: 'Events this subscription is notified about',
		required: true,
		multiple: true,
	}),
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'Free-form label for the subscription, at most 255 characters',
		displayOptions: { show: { resource: [RESOURCE], operation: ['create', 'update'] } },
	},
];
