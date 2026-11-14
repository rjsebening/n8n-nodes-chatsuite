import type { INodeProperties } from 'n8n-workflow';

import { downloadBinaryProperty, uploadBinaryProperty } from '../shared/binary.properties';
import { locatorProperty, optionsField, stringProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'customer';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Batch Onboarding',
				value: 'batchOnboarding',
				description:
					'Start onboarding up to 50 new customers, each with a new WhatsApp group (runs as an operation)',
				action: 'Start a customer batch onboarding',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a customer',
				action: 'Create a customer',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Soft-delete a customer by phone number',
				action: 'Delete a customer',
			},
			{
				name: 'Export',
				value: 'export',
				description: 'Download all customers as a CSV file',
				action: 'Export customers',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one customer by phone number',
				action: 'Get a customer',
			},
			{
				name: 'Get by Email',
				value: 'getByEmail',
				description: 'Find customers by e-mail address',
				action: 'Get a customer by email',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List customers for the tenant',
				action: 'Get many customers',
			},
			{
				name: 'Import',
				value: 'import',
				description: 'Import customers from a CSV file',
				action: 'Import customers',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Fully replace a customer (PUT)',
				action: 'Update a customer',
			},
			{
				name: 'Update Partially',
				value: 'patch',
				description: 'Update only the given customer fields (PATCH)',
				action: 'Update a customer partially',
			},
			{
				name: 'WhatsApp Onboarding',
				value: 'whatsappOnboarding',
				description: 'Create or map a WhatsApp group for an existing customer',
				action: 'Onboard a customer to whats app',
			},
		],
	},
];

const customerLocator = locatorProperty({
	displayName: 'Customer',
	name: 'phoneNumber',
	resource: RESOURCE,
	operations: ['get', 'update', 'patch', 'delete', 'whatsappOnboarding'],
	searchListMethod: 'searchCustomers',
	idLabel: 'Phone Number',
	idPlaceholder: '+4915112345678',
	description: 'The customer, addressed by phone number',
});

/** Team member selection for a new WhatsApp group, shared by single and batch onboarding */
function teamMemberFields(): INodeProperties[] {
	return [
		{
			displayName: 'Team Member Mode',
			name: 'teamMemberMode',
			type: 'options',
			default: 'all',
			description: 'Which team members to add to the new group',
			options: [
				{ name: 'All', value: 'all', description: 'All active team members' },
				{ name: 'None', value: 'none' },
				{
					name: 'Specific',
					value: 'specific',
					description: 'Only the team members given by email or name',
				},
			],
		},
		optionsField(
			'Team Member Emails',
			'teamMemberEmails',
			'getTeamMembers',
			'Login email addresses of the team members to add, used when the mode is "Specific". Unlike a display name an email is unique.',
			{ type: 'multiOptions', default: [] },
		),
		{
			displayName: 'Team Member Names',
			name: 'teamMemberNames',
			type: 'string',
			default: '',
			placeholder: 'Anna Beispiel, Max Muster',
			description:
				'Comma-separated exact team member display names, used when the mode is "Specific"',
		},
	];
}

/** Fields of one batch onboarding position */
function batchCustomerFields(): INodeProperties[] {
	const fields: INodeProperties[] = [
		{
			displayName: 'Phone',
			name: 'phone',
			type: 'string',
			default: '',
			placeholder: '+4915112345678',
			description: 'Required. Phone number in international format with a + or 00 prefix.',
		},
		{
			displayName: 'Group Name',
			name: 'groupName',
			type: 'string',
			default: '',
			description: 'Required. The group name as it should appear in WhatsApp.',
		},
		{
			displayName: 'First Name',
			name: 'firstName',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Last Name',
			name: 'lastName',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Group Description',
			name: 'groupDescription',
			type: 'string',
			typeOptions: { rows: 2 },
			default: '',
		},
		{
			displayName: 'Product ID',
			name: 'productId',
			type: 'string',
			default: '',
			placeholder: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
			description: 'ID (UUID) of the product to assign to the customer',
		},
		{
			displayName: 'Use Default Group Picture',
			name: 'useDefaultGroupPicture',
			type: 'boolean',
			default: true,
			description: 'Whether to set the default group picture on the new group',
		},
		{
			displayName: 'Invite by SMS',
			name: 'inviteBySms',
			type: 'boolean',
			default: false,
			description: 'Whether to send the customer the group invitation by SMS',
		},
		...teamMemberFields(),
	];
	return fields.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

/** Shared writable customer fields, reused by create / update / patch */
function customerFields(mode: 'create' | 'update'): INodeProperties[] {
	const fields: INodeProperties[] = [
		{
			displayName: 'Company Name',
			name: 'companyName',
			type: 'string',
			default: '',
			description: 'Company or organization the customer belongs to',
		},
		optionsField(
			'Customer Category Names',
			'categoryNames',
			'getCustomerCategories',
			'Customer category names; missing names are created',
			{ type: 'multiOptions', default: [] },
		),
		{
			displayName: 'Emails',
			name: 'emails',
			type: 'string',
			default: '',
			placeholder: 'info@example.com, *@example.org',
			description:
				'Comma-separated e-mail addresses; domain wildcards such as *@example.org are allowed',
		},
		{
			displayName: 'First Name',
			name: 'firstName',
			type: 'string',
			default: '',
			description: 'Customer first name',
		},
		{
			displayName: 'Is Active',
			name: 'isActive',
			type: 'boolean',
			default: true,
			description: 'Whether the customer is active',
		},
		{
			displayName: 'Last Name',
			name: 'lastName',
			type: 'string',
			default: '',
			description: 'Customer last name',
		},
		{
			displayName: 'Notes',
			name: 'notes',
			type: 'string',
			typeOptions: { rows: 3 },
			default: '',
			description: 'Free-form notes about the customer',
		},
		optionsField(
			'Product Code',
			'productCode',
			'getProducts',
			'Product code from the Product API; products are not auto-created',
		),
		optionsField(
			'WhatsApp Connection Name',
			'whatsAppConnectionName',
			'getWhatsappChannels',
			'WhatsApp channel to assign to the customer',
		),
		{
			displayName: 'Time Zone',
			name: 'timeZoneId',
			type: 'string',
			default: '',
			placeholder: 'Europe/Berlin',
			description:
				'IANA time zone of the customer. Without it the customer uses the time zone of the tenant.',
		},
	];
	if (mode === 'create') {
		fields.push({
			displayName: 'Is New Client',
			name: 'isNewClient',
			type: 'boolean',
			default: false,
			description:
				'Whether to mark the customer as new. Their first WhatsApp group join then reports customer.isNewClient = true to the automation trigger "Kunde tritt Gruppe bei" and sends the customer.onboarded webhook once.',
		});
	} else {
		fields.push({
			displayName: 'Use Tenant Time Zone',
			name: 'useTenantTimeZone',
			type: 'boolean',
			default: false,
			description:
				'Whether to drop the time zone of the customer so it inherits the time zone of the tenant again. Overrides Time Zone.',
		});
	}
	return fields.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export const customerFieldProperties: INodeProperties[] = [
	customerLocator,

	// --- getAll ---
	...paginationProperties(RESOURCE, ['getAll']),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['getAll'] } },
		options: [
			optionsField(
				'Category Name',
				'categoryName',
				'getCustomerCategories',
				'Only return customers in this category',
			),
			{
				displayName: 'Is Active',
				name: 'isActive',
				type: 'boolean',
				default: true,
				description: 'Whether to only return active customers',
			},
			optionsField(
				'Product Code',
				'productCode',
				'getProducts',
				'Only return customers with this product',
			),
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Full text search across customer fields',
			},
		],
	},
	listOptionsProperty(RESOURCE, ['getAll']),

	// --- getByEmail ---
	stringProperty(
		'Email',
		'email',
		RESOURCE,
		['getByEmail'],
		'E-mail address to look the customers up by',
		{ placeholder: 'info@example.com' },
	),

	// --- create ---
	stringProperty(
		'Phone Number',
		'newPhoneNumber',
		RESOURCE,
		['create'],
		'Tenant-facing customer key in international format with a + or 00 prefix; must be unique after phone normalization',
		{ placeholder: '+4915112345678' },
	),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create'] } },
		options: customerFields('create'),
	},

	// --- update (PUT) ---
	{
		displayName: 'New Phone Number',
		name: 'newPhoneNumber',
		type: 'string',
		default: '',
		placeholder: '+4915112345678',
		description:
			'New tenant-facing customer key with a + or 00 prefix. Leave empty to keep the current phone number.',
		displayOptions: { show: { resource: [RESOURCE], operation: ['update'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['update', 'patch'] } },
		options: customerFields('update'),
	},
	{
		displayName: 'New Phone Number',
		name: 'patchPhoneNumber',
		type: 'string',
		default: '',
		placeholder: '+4915112345678',
		description: 'New phone number with a + or 00 prefix. Leave empty to keep the current one.',
		displayOptions: { show: { resource: [RESOURCE], operation: ['patch'] } },
	},

	// --- whatsappOnboarding ---
	{
		displayName: 'Onboarding Mode',
		name: 'mode',
		type: 'options',
		required: true,
		default: 'newGroup',
		description: 'Whether to create a new WhatsApp group or map an existing one',
		displayOptions: { show: { resource: [RESOURCE], operation: ['whatsappOnboarding'] } },
		options: [
			{
				name: 'Existing Group',
				value: 'existingGroup',
				description: 'Map an existing WhatsApp group by its exact name',
			},
			{
				name: 'New Group',
				value: 'newGroup',
				description: 'Create a new WhatsApp group and optionally add team members',
			},
		],
	},
	stringProperty(
		'Group Name',
		'groupName',
		RESOURCE,
		['whatsappOnboarding'],
		'Name of the new or existing WhatsApp group',
	),
	{
		displayName: 'Onboarding Options',
		name: 'onboardingOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['whatsappOnboarding'] } },
		options: [
			...teamMemberFields(),
			optionsField(
				'WhatsApp Connection Name',
				'whatsAppConnectionName',
				'getWhatsappChannels',
				'WhatsApp channel to use; defaults to the first connected channel',
			),
		],
	},

	// --- batchOnboarding ---
	{
		displayName: 'WhatsApp Channel ID',
		name: 'whatsAppChannelId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
		description:
			'ID (UUID) of the company channel that creates every group of this batch. A number may create 20 groups per rolling 24 hours, so large batches span several days.',
		displayOptions: { show: { resource: [RESOURCE], operation: ['batchOnboarding'] } },
	},
	{
		displayName: 'Idempotency Key',
		name: 'idempotencyKey',
		type: 'string',
		required: true,
		default: '={{ $execution.id }}-{{ $itemIndex }}',
		description:
			'A retry with the same key returns the same operation instead of starting it twice; the same key with a different batch is rejected. Keys stay reserved for 30 days after the operation ended.',
		displayOptions: { show: { resource: [RESOURCE], operation: ['batchOnboarding'] } },
	},
	{
		displayName: 'Input Mode',
		name: 'batchInputMode',
		type: 'options',
		noDataExpression: true,
		default: 'defineBelow',
		displayOptions: { show: { resource: [RESOURCE], operation: ['batchOnboarding'] } },
		options: [
			{
				name: 'Define Below',
				value: 'defineBelow',
				description: 'Enter the customers one by one',
			},
			{
				name: 'JSON',
				value: 'json',
				description: 'Pass the customers as a JSON array, for example mapped from earlier nodes',
			},
		],
	},
	{
		displayName: 'Customers',
		name: 'batchCustomers',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Customer',
		default: {},
		description: 'Up to 50 customers; each one gets a new WhatsApp group',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['batchOnboarding'],
				batchInputMode: ['defineBelow'],
			},
		},
		options: [
			{
				displayName: 'Customer',
				name: 'customer',
				values: batchCustomerFields(),
			},
		],
	},
	{
		displayName: 'Customers (JSON)',
		name: 'batchCustomersJson',
		type: 'json',
		required: true,
		default:
			'[\n  {\n    "phone": "+4915112345678",\n    "firstName": "Max",\n    "lastName": "Mustermann",\n    "groupName": "Max Mustermann - Coaching"\n  }\n]',
		description:
			'Array of up to 50 positions with phone, groupName, firstName, lastName, groupDescription, productId, useDefaultGroupPicture, addAllTeamMembers, teamMembers and inviteBySms',
		displayOptions: {
			show: { resource: [RESOURCE], operation: ['batchOnboarding'], batchInputMode: ['json'] },
		},
	},

	// --- import / export ---
	uploadBinaryProperty(
		RESOURCE,
		['import'],
		'Name of the input binary field that holds the CSV file to import',
	),
	downloadBinaryProperty(RESOURCE, ['export']),
];
