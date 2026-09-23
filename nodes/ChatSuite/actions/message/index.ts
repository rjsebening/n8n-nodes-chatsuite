import type { INodeProperties } from 'n8n-workflow';

import {
	locatorProperty,
	optionsField,
	optionsProperty,
	stringProperty,
} from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'message';

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'send',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Read one message with its attachments',
				action: 'Get a message',
			},
			{
				name: 'Get Many History Entries',
				value: 'getHistory',
				description: 'Get recent message history of a customer or team member',
				action: 'Get many message history entries',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send a message to a known contact, as text or with files',
				action: 'Send a message',
			},
			{
				name: 'Send to Customer Groups',
				value: 'sendToCustomerGroups',
				description: 'Send a message to every group of a customer with a given category',
				action: 'Send a message to customer groups',
			},
			{
				name: 'Send to Group',
				value: 'sendToGroup',
				description: 'Send a text message to a WhatsApp group',
				action: 'Send a message to a group',
			},
		],
	},
];

export const messageFields: INodeProperties[] = [
	// --- send ---
	locatorProperty({
		displayName: 'Customer',
		name: 'phoneNumber',
		resource: RESOURCE,
		operations: ['send', 'sendToCustomerGroups', 'getHistory'],
		searchListMethod: 'searchCustomers',
		idLabel: 'Phone Number',
		idPlaceholder: '+4915112345678',
		description: 'Known customer or active team member phone number, matched within the tenant',
	}),
	stringProperty(
		'Message',
		'message',
		RESOURCE,
		['send', 'sendToGroup', 'sendToCustomerGroups'],
		'Text to send. With files it becomes their caption.',
		{ typeOptions: { rows: 3 }, required: false },
	),
	{
		displayName: 'Attach Files',
		name: 'attachFiles',
		type: 'boolean',
		default: false,
		description: 'Whether to send binary files from the input item along with the message',
		displayOptions: { show: { resource: [RESOURCE], operation: ['send'] } },
	},
	{
		displayName: 'Input Binary Fields',
		name: 'binaryPropertyNames',
		type: 'string',
		required: true,
		default: 'data',
		placeholder: 'data, data1',
		description:
			'Comma-separated names of the input binary fields to send. Up to 10 files per message.',
		displayOptions: {
			show: { resource: [RESOURCE], operation: ['send'], attachFiles: [true] },
		},
	},
	{
		displayName: 'Options',
		name: 'sendOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['send'] } },
		options: [
			{
				displayName: 'Is Direct Chat',
				name: 'isDirectChat',
				type: 'boolean',
				default: false,
				description: "Whether to send to the 1:1 chat instead of the customer's WhatsApp group",
			},
			{
				displayName: 'Reply to Message ID',
				name: 'replyToMessageId',
				type: 'string',
				default: '',
				description: 'Message identifier to quote in the reply',
			},
			{
				displayName: 'WhatsApp Channel ID',
				name: 'whatsAppBotId',
				type: 'string',
				default: '',
				description: 'Explicit company WhatsApp channel identity to send from',
			},
			{
				displayName: 'WhatsApp Group Name or ID',
				name: 'whatsAppGroupId',
				type: 'options',
				default: '',
				description:
					'Explicit group selector. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				typeOptions: {
					loadOptionsMethod: 'getCustomerWhatsappGroups',
					loadOptionsDependsOn: ['phoneNumber.value'],
				},
			},
		],
	},

	// --- sendToCustomerGroups ---
	optionsProperty({
		displayName: 'Group Category Names',
		name: 'groupCategoryNames',
		resource: RESOURCE,
		operations: ['sendToCustomerGroups'],
		loadOptionsMethod: 'getWhatsappGroupCategories',
		description: 'A group matches when it carries at least one of the selected categories',
		required: true,
		multiple: true,
	}),

	// --- sendToGroup ---
	optionsProperty({
		displayName: 'Channel Name',
		name: 'kanalName',
		resource: RESOURCE,
		operations: ['sendToGroup'],
		loadOptionsMethod: 'getWhatsappChannels',
		description: 'WhatsApp channel used to resolve the sending bot',
		required: true,
	}),
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		default: '',
		placeholder: '120363425784382970@g.us',
		description: 'WhatsApp group JID. Provide either the group ID or the group name.',
		displayOptions: { show: { resource: [RESOURCE], operation: ['sendToGroup'] } },
	},
	{
		displayName: 'Group Name',
		name: 'groupName',
		type: 'string',
		default: '',
		description:
			'Exact group name within the channel. Provide either the group ID or the group name.',
		displayOptions: { show: { resource: [RESOURCE], operation: ['sendToGroup'] } },
	},
	{
		displayName: 'Options',
		name: 'groupSendOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: { resource: [RESOURCE], operation: ['sendToGroup', 'sendToCustomerGroups'] },
		},
		options: [
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description: 'Sent as the Idempotency-Key header so retries do not send twice',
			},
			{
				displayName: 'Reply to Message ID',
				name: 'replyToMessageId',
				type: 'string',
				default: '',
				description: 'Message identifier to quote in the reply',
			},
		],
	},

	// --- get ---
	stringProperty('Message ID', 'messageId', RESOURCE, ['get'], 'Identifier of the message to read'),

	// --- getHistory ---
	...paginationProperties(RESOURCE, ['getHistory']),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['getHistory'] } },
		options: [
			{
				displayName: 'Is Direct Chat',
				name: 'isDirectChat',
				type: 'boolean',
				default: false,
				description: 'Whether to only return messages from the 1:1 chat',
			},
			{
				displayName: 'WhatsApp Channel ID',
				name: 'whatsAppBotId',
				type: 'string',
				default: '',
				description: 'Only return messages sent through this WhatsApp channel',
			},
			optionsField(
				'WhatsApp Group ID',
				'whatsAppGroupId',
				'getCustomerWhatsappGroups',
				'Only return messages from this WhatsApp group',
				{
					typeOptions: {
						loadOptionsMethod: 'getCustomerWhatsappGroups',
						loadOptionsDependsOn: ['phoneNumber.value'],
					},
				},
			),
		],
	},
	listOptionsProperty(RESOURCE, ['getHistory']),
];
