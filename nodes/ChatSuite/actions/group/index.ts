import type { INodeProperties } from 'n8n-workflow';

import { optionsField, optionsProperty } from '../shared/locators.properties';

const RESOURCE = 'group';
const ALL = [
	'update',
	'leave',
	'getParticipants',
	'addTeamMember',
	'setTeamMemberAdmin',
	'removeTeamMember',
	'setTicketDetection',
];

/** Every group endpoint addresses its group by channel + group ID or group name */
const GROUP_ADDRESSED = [
	'update',
	'leave',
	'getParticipants',
	'addTeamMember',
	'setTeamMemberAdmin',
	'removeTeamMember',
];

export const groupOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getParticipants',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Add Team Member',
				value: 'addTeamMember',
				description: 'Add a team member to a WhatsApp group',
				action: 'Add a team member to a group',
			},
			{
				name: 'Get Many Participants',
				value: 'getParticipants',
				description: 'List all people currently in a WhatsApp group',
				action: 'Get many group participants',
			},
			{
				name: 'Leave',
				value: 'leave',
				description: 'Leave a WhatsApp group through the selected channel',
				action: 'Leave a group',
			},
			{
				name: 'Remove Team Member',
				value: 'removeTeamMember',
				description: 'Remove a team member from a WhatsApp group',
				action: 'Remove a team member from a group',
			},
			{
				name: 'Set Team Member Admin',
				value: 'setTeamMemberAdmin',
				description: "Set an existing participant's group-admin status",
				action: 'Set the group admin status of a team member',
			},
			{
				name: 'Set Ticket Detection',
				value: 'setTicketDetection',
				description: 'Turn ticket detection on or off for many groups at once',
				action: 'Set ticket detection for groups',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update the name, description or picture of a WhatsApp group',
				action: 'Update a group',
			},
		],
	},
];

export const groupFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Channel Name',
		name: 'kanalName',
		resource: RESOURCE,
		operations: ALL,
		loadOptionsMethod: 'getWhatsappChannels',
		description: 'WhatsApp channel the group lives on',
	}),
	{
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		default: '',
		placeholder: '120363425784382970@g.us',
		description: 'WhatsApp group JID. Provide either the group ID or the group name.',
		displayOptions: { show: { resource: [RESOURCE], operation: GROUP_ADDRESSED } },
	},
	{
		displayName: 'Group Name',
		name: 'groupName',
		type: 'string',
		default: '',
		description:
			'Exact, case-insensitive group name within the channel. Provide either the group ID or the group name.',
		displayOptions: { show: { resource: [RESOURCE], operation: GROUP_ADDRESSED } },
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
			{
				displayName: 'New Description',
				name: 'newDescription',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				description: 'New group description, at most 2000 characters',
			},
			{
				displayName: 'New Name',
				name: 'newName',
				type: 'string',
				default: '',
				description: 'New group name (subject)',
			},
			{
				displayName: 'New Picture (Base64)',
				name: 'newPictureBase64',
				type: 'string',
				default: '',
				description: 'New group picture as a data URI or raw base64 string',
			},
		],
	},

	// --- leave ---
	{
		displayName: 'Leave Options',
		name: 'leaveOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['leave'] } },
		options: [
			{
				displayName: 'Delete Group',
				name: 'deleteGroup',
				type: 'boolean',
				default: false,
				description: 'Whether to delete the group after leaving it',
			},
			{
				displayName: 'Operation ID',
				name: 'operationId',
				type: 'string',
				default: '',
				description: 'Idempotency key for repeated leave calls',
			},
			{
				displayName: 'Remove Other Participants',
				name: 'removeOtherParticipants',
				type: 'boolean',
				default: false,
				description: 'Whether to remove all other participants before leaving',
			},
			{
				displayName: 'Remove Team Members',
				name: 'removeTeamMembers',
				type: 'boolean',
				default: false,
				description: 'Whether to remove team members from the group before leaving',
			},
		],
	},

	// --- team member operations ---
	optionsProperty({
		displayName: 'Team Member Email',
		name: 'email',
		resource: RESOURCE,
		operations: ['addTeamMember', 'setTeamMemberAdmin', 'removeTeamMember'],
		loadOptionsMethod: 'getTeamMembers',
		description: 'Team member to act on. Provide either the e-mail or the phone number.',
	}),
	{
		displayName: 'Team Member Phone Number',
		name: 'memberPhoneNumber',
		type: 'string',
		default: '',
		placeholder: '+4915112345678',
		description:
			'Team member phone number including the country code. Provide either the e-mail or the phone number.',
		displayOptions: {
			show: {
				resource: [RESOURCE],
				operation: ['addTeamMember', 'setTeamMemberAdmin', 'removeTeamMember'],
			},
		},
	},
	{
		displayName: 'Promote to Admin',
		name: 'promoteToAdmin',
		type: 'boolean',
		default: true,
		description: 'Whether to promote the team member to group admin after adding them',
		displayOptions: { show: { resource: [RESOURCE], operation: ['addTeamMember'] } },
	},
	{
		displayName: 'Is Group Admin',
		name: 'isGroupAdmin',
		type: 'boolean',
		default: true,
		description: 'Whether the participant should be a group admin',
		displayOptions: { show: { resource: [RESOURCE], operation: ['setTeamMemberAdmin'] } },
	},

	// --- setTicketDetection ---
	{
		displayName: 'Ticket Detection',
		name: 'ticketDetectionEnabled',
		type: 'options',
		required: true,
		default: 'on',
		description: 'Target ticket detection state for the selected groups',
		displayOptions: { show: { resource: [RESOURCE], operation: ['setTicketDetection'] } },
		options: [
			{
				name: 'Default',
				value: 'default',
				description: 'Back to the default: on once a customer is assigned',
			},
			{ name: 'Off', value: 'off' },
			{ name: 'On', value: 'on' },
		],
	},
	{
		displayName: 'Groups',
		name: 'ticketDetectionGroups',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Group',
		default: {},
		description: 'Explicit groups to change. Leave empty to use the Where filter instead.',
		displayOptions: { show: { resource: [RESOURCE], operation: ['setTicketDetection'] } },
		options: [
			{
				displayName: 'Group',
				name: 'group',
				values: [
					{
						displayName: 'Group ID',
						name: 'groupId',
						type: 'string',
						default: '',
						placeholder: '120363425784382970@g.us',
						description: 'WhatsApp group JID',
					},
					{
						displayName: 'Group Name',
						name: 'groupName',
						type: 'string',
						default: '',
						description: 'Exact group name within the channel',
					},
				],
			},
		],
	},
	{
		displayName: 'Where',
		name: 'ticketDetectionWhere',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		description: 'Select the groups to change by their current state or category',
		displayOptions: { show: { resource: [RESOURCE], operation: ['setTicketDetection'] } },
		options: [
			optionsField(
				'Group Category',
				'groupCategory',
				'getWhatsappGroupCategories',
				'All groups assigned to this group category',
			),
			{
				displayName: 'Ticket Detection',
				name: 'ticketDetection',
				type: 'options',
				default: 'on',
				description: 'The groups whose ticket detection is currently in this state',
				options: [
					{ name: 'Default', value: 'default' },
					{ name: 'Off', value: 'off' },
					{ name: 'On', value: 'on' },
				],
			},
		],
	},
];
