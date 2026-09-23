import type { INodeProperties } from 'n8n-workflow';

export const resourceSelector: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	default: 'customer',
	options: [
		{
			name: 'API Call',
			value: 'apiCall',
			description: 'Make a custom request against any ChatSuite API endpoint',
		},
		{
			name: 'Automation',
			value: 'automation',
			description: 'List, inspect and execute automations',
		},
		{
			name: 'Customer',
			value: 'customer',
			description: 'Create, update, import, export and onboard customers',
		},
		{
			name: 'Customer Category',
			value: 'customerCategory',
			description: 'Manage customer categories',
		},
		{
			name: 'Customer Knowledge',
			value: 'customerKnowledge',
			description: 'Manage and query knowledge entries of a single customer',
		},
		{
			name: 'Data Collection',
			value: 'dataCollection',
			description: 'List and execute data collections',
		},
		{
			name: 'Data Point',
			value: 'dataPoint',
			description: 'Manage data point definitions',
		},
		{
			name: 'Data Point Value',
			value: 'dataPointValue',
			description: 'Read, write and delete customer data point values',
		},
		{
			name: 'Group',
			value: 'group',
			description: 'Manage WhatsApp groups, participants and ticket detection',
		},
		{
			name: 'Group Category',
			value: 'whatsappGroupCategory',
			description: 'Read WhatsApp group categories',
		},
		{
			name: 'Knowledge Document',
			value: 'knowledgeDocument',
			description: 'Upload, download and manage knowledge documents',
		},
		{
			name: 'Knowledge Information',
			value: 'knowledgeInformation',
			description: 'Manage Information entries and run RAG queries',
		},
		{
			name: 'Knowledge Q&A',
			value: 'knowledgeQa',
			description: 'Manage question and answer entries including attachments',
		},
		{
			name: 'Message',
			value: 'message',
			description: 'Send WhatsApp messages and read message history',
		},
		{
			name: 'Product',
			value: 'product',
			description: 'Manage products',
		},
		{
			name: 'Product Category',
			value: 'productCategory',
			description: 'Manage product categories',
		},
		{
			name: 'Team Member',
			value: 'teamMember',
			description: 'Manage team members and their absences',
		},
		{
			name: 'Ticket',
			value: 'ticket',
			description: 'Create, update and inspect tickets and their notes',
		},
		{
			name: 'Ticket Category',
			value: 'ticketCategory',
			description: 'Manage ticket categories',
		},
		{
			name: 'Webhook',
			value: 'webhook',
			description: 'Manage webhook subscriptions',
		},
		{
			name: 'WhatsApp Channel',
			value: 'whatsappChannel',
			description: 'Read WhatsApp channels and request pairing QR codes',
		},
	],
};
