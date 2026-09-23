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

/** Shared writable customer fields, reused by create / update / patch */
function customerFields(): INodeProperties[] {
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
	];
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
		'Tenant-facing customer key; must be unique after phone normalization',
		{ placeholder: '+4915112345678' },
	),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create'] } },
		options: customerFields(),
	},

	// --- update (PUT) ---
	{
		displayName: 'New Phone Number',
		name: 'newPhoneNumber',
		type: 'string',
		default: '',
		description: 'New tenant-facing customer key. Leave empty to keep the current phone number.',
		displayOptions: { show: { resource: [RESOURCE], operation: ['update'] } },
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['update', 'patch'] } },
		options: customerFields(),
	},
	{
		displayName: 'New Phone Number',
		name: 'patchPhoneNumber',
		type: 'string',
		default: '',
		description: 'New phone number. Leave empty to keep the current one.',
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
			{
				displayName: 'Team Member Mode',
				name: 'teamMemberMode',
				type: 'options',
				default: 'all',
				description: 'Which team members to add to the new group',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'None', value: 'none' },
					{ name: 'Specific', value: 'specific' },
				],
			},
			{
				displayName: 'Team Member Names',
				name: 'teamMemberNames',
				type: 'string',
				default: '',
				placeholder: 'Anna Beispiel, Max Muster',
				description:
					'Comma-separated exact team member display names, used when the mode is "Specific"',
			},
			optionsField(
				'WhatsApp Connection Name',
				'whatsAppConnectionName',
				'getWhatsappChannels',
				'WhatsApp channel to use; defaults to the first connected channel',
			),
		],
	},

	// --- import / export ---
	uploadBinaryProperty(
		RESOURCE,
		['import'],
		'Name of the input binary field that holds the CSV file to import',
	),
	downloadBinaryProperty(RESOURCE, ['export']),
];
