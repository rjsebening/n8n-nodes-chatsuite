import type { INodeProperties } from 'n8n-workflow';

import { locatorProperty, optionsField, stringProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'ticket';

export const ticketOperations: INodeProperties[] = [
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
				description: 'Create a ticket',
				action: 'Create a ticket',
			},
			{
				name: 'Create Note',
				value: 'createNote',
				description: 'Add an internal note to a ticket',
				action: 'Create a ticket note',
			},
			{
				name: 'Get',
				value: 'get',
				description: "Get one ticket's base data by ticket number",
				action: 'Get a ticket',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List tickets with filters and pagination',
				action: 'Get many tickets',
			},
			{
				name: 'Get Many History Entries',
				value: 'getHistory',
				description: 'Get the audit trail of a ticket',
				action: 'Get many ticket history entries',
			},
			{
				name: 'Get Many Messages',
				value: 'getMessages',
				description: "Get a ticket's chat messages",
				action: 'Get many ticket messages',
			},
			{
				name: 'Get Many Notes',
				value: 'getNotes',
				description: "List a ticket's internal notes",
				action: 'Get many ticket notes',
			},
			{
				name: 'Get Many States',
				value: 'getStates',
				description: "List the tenant's ticket workflow states",
				action: 'Get many ticket states',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a ticket message, state, category, assignment or priority',
				action: 'Update a ticket',
			},
		],
	},
];

export const ticketFields: INodeProperties[] = [
	locatorProperty({
		displayName: 'Ticket',
		name: 'ticketNumber',
		resource: RESOURCE,
		operations: ['get', 'update', 'getHistory', 'getMessages', 'getNotes', 'createNote'],
		searchListMethod: 'searchTickets',
		idLabel: 'Ticket Number',
		idPlaceholder: '1042',
		description: 'The ticket, addressed by its tenant-unique ticket number',
	}),

	// --- getAll / getMessages ---
	...paginationProperties(RESOURCE, ['getAll', 'getMessages']),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['getAll'] } },
		options: [
			optionsField(
				'Assigned to Email',
				'assignedToEmail',
				'getTeamMembers',
				'Only return tickets assigned to this team member',
			),
			optionsField(
				'Category Name',
				'categoryName',
				'getTicketCategories',
				'Only return tickets in this category',
			),
			{
				displayName: 'Created After',
				name: 'createdAfter',
				type: 'dateTime',
				default: '',
				description: 'Only return tickets created after this moment',
			},
			{
				displayName: 'Created Before',
				name: 'createdBefore',
				type: 'dateTime',
				default: '',
				description: 'Only return tickets created before this moment',
			},
			{
				displayName: 'Customer Phone Number',
				name: 'customerPhoneNumber',
				type: 'string',
				default: '',
				placeholder: '+4915112345678',
				description: 'Only return tickets of this customer',
			},
			{
				displayName: 'Is Direct Chat',
				name: 'isDirectChat',
				type: 'boolean',
				default: false,
				description: 'Whether to only return tickets from 1:1 chats',
			},
			{
				displayName: 'Is Priority',
				name: 'isPriority',
				type: 'boolean',
				default: false,
				description: 'Whether to only return priority tickets',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Full text search across ticket fields',
			},
			optionsField(
				'State Name',
				'stateName',
				'getTicketStates',
				'Only return tickets in this workflow state',
			),
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'open',
				description: 'Whether to return open, closed or all tickets',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Closed', value: 'closed' },
					{ name: 'Open', value: 'open' },
				],
			},
		],
	},
	listOptionsProperty(RESOURCE, ['getAll', 'getMessages']),

	// --- create ---
	stringProperty(
		'Customer Phone Number',
		'customerPhoneNumber',
		RESOURCE,
		['create'],
		"The customer's phone number",
		{ placeholder: '+4915112345678' },
	),
	stringProperty(
		'Message',
		'message',
		RESOURCE,
		['create'],
		"The ticket's subject or description",
		{ typeOptions: { rows: 3 } },
	),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create'] } },
		options: [
			optionsField(
				'Assigned to Email',
				'assignedToEmail',
				'getTeamMembers',
				'Team member to assign the ticket to',
			),
			optionsField(
				'Category Name',
				'categoryName',
				'getTicketCategories',
				'Ticket category to file the ticket under',
			),
			{
				displayName: 'Created by Name',
				name: 'createdByName',
				type: 'string',
				default: '',
				description: 'Shown as the actor in the ticket history; defaults to "API"',
			},
			{
				displayName: 'Is Direct Chat',
				name: 'isDirectChat',
				type: 'boolean',
				default: false,
				description: 'Whether the ticket belongs to a 1:1 chat instead of a group',
			},
			{
				displayName: 'Is Priority',
				name: 'isPriority',
				type: 'boolean',
				default: false,
				description: 'Whether the ticket is a priority ticket',
			},
			{
				displayName: 'Post to Customer Chat',
				name: 'postToCustomerChat',
				type: 'boolean',
				default: false,
				description: "Whether to also post the ticket message into the customer's WhatsApp chat",
			},
			{
				displayName: 'WhatsApp Channel ID',
				name: 'whatsAppBotId',
				type: 'string',
				default: '',
				description: 'Exact WhatsApp channel for a direct-chat ticket',
			},
			{
				displayName: 'WhatsApp Group ID',
				name: 'whatsAppGroupId',
				type: 'string',
				default: '',
				description: 'Exact group for a group ticket',
			},
		],
	},

	// --- update ---
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['update'] } },
		options: [
			optionsField(
				'Assigned to Email',
				'assignedToEmail',
				'getTeamMembers',
				'Team member to assign; an empty value unassigns',
			),
			optionsField(
				'Category Name',
				'categoryName',
				'getTicketCategories',
				'Ticket category; an empty value clears it',
			),
			{
				displayName: 'Is Closed',
				name: 'isClosed',
				type: 'boolean',
				default: false,
				description: 'Whether to close or reopen the ticket. Mutually exclusive with State Name.',
			},
			{
				displayName: 'Is Priority',
				name: 'isPriority',
				type: 'boolean',
				default: false,
				description: 'Whether the ticket is a priority ticket',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'New subject or description',
			},
			optionsField(
				'State Name',
				'stateName',
				'getTicketStates',
				'Move the ticket into this workflow state',
			),
			{
				displayName: 'Updated by Name',
				name: 'updatedByName',
				type: 'string',
				default: '',
				description: 'Shown as the actor in the ticket history; defaults to "API"',
			},
		],
	},

	// --- createNote ---
	stringProperty('Content', 'content', RESOURCE, ['createNote'], 'Text of the internal note', {
		typeOptions: { rows: 3 },
	}),
	{
		displayName: 'Author Name',
		name: 'authorName',
		type: 'string',
		default: '',
		description: 'Shown as the note\'s author; defaults to "API"',
		displayOptions: { show: { resource: [RESOURCE], operation: ['createNote'] } },
	},
];
