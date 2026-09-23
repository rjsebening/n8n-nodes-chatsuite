import type { INodeProperties } from 'n8n-workflow';

export const triggerProperties: INodeProperties[] = [
	{
		displayName: 'Event Names or IDs',
		name: 'events',
		type: 'multiOptions',
		required: true,
		default: [],
		description:
			'ChatSuite events this trigger subscribes to, for example message.created or customer.onboarded. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: { loadOptionsMethod: 'getWebhookEvents' },
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: 'n8n',
		description:
			'Label stored on the ChatSuite webhook subscription, so it can be recognised in the ChatSuite UI',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			{
				displayName: 'Customer Phone Number',
				name: 'customerPhoneNumber',
				type: 'string',
				default: '',
				placeholder: '+4915112345678',
				description:
					'Only continue when the event payload belongs to this customer. ChatSuite has no server-side filter, so events for other customers are dropped after delivery.',
			},
			{
				displayName: 'Output Raw Payload',
				name: 'rawPayload',
				type: 'boolean',
				default: false,
				description:
					'Whether to always emit the webhook body as a single item, even when it is an array of events',
			},
			{
				displayName: 'WhatsApp Channel Name or ID',
				name: 'kanalName',
				type: 'options',
				default: '',
				description:
					'Only continue when the event payload comes from this WhatsApp channel. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				typeOptions: { loadOptionsMethod: 'getWhatsappChannels' },
			},
		],
	},
];
