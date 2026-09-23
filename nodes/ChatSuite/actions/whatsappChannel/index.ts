import type { INodeProperties } from 'n8n-workflow';

import { optionsProperty } from '../shared/locators.properties';

const RESOURCE = 'whatsappChannel';

export const whatsappChannelOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get one WhatsApp channel by name',
				action: 'Get a whats app channel',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many WhatsApp channels',
				action: 'Get many whats app channels',
			},
			{
				name: 'Get QR Code',
				value: 'getQrCode',
				description: 'Get a pairing QR code for an unpaired WhatsApp channel',
				action: 'Get a whats app channel qr code',
			},
		],
	},
];

export const whatsappChannelFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Channel Name',
		name: 'kanalName',
		resource: RESOURCE,
		operations: ['get', 'getQrCode'],
		loadOptionsMethod: 'getWhatsappChannels',
		description: 'The WhatsApp channel to act on',
		required: true,
	}),
];
