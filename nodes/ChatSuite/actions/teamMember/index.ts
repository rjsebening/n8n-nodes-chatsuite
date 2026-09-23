import type { INodeProperties } from 'n8n-workflow';

import { userRoleOptions } from '../../helpers/enums';
import { locatorProperty, optionsField, stringProperty } from '../shared/locators.properties';

const RESOURCE = 'teamMember';

export const teamMemberOperations: INodeProperties[] = [
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
				description: 'Create a team member',
				action: 'Create a team member',
			},
			{
				name: 'Create Absence',
				value: 'createAbsence',
				description: 'Add an absence period for a team member',
				action: 'Create a team member absence',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Deactivate a team member by e-mail',
				action: 'Delete a team member',
			},
			{
				name: 'Delete Absence',
				value: 'deleteAbsence',
				description: 'Delete an absence period',
				action: 'Delete a team member absence',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one team member by e-mail',
				action: 'Get a team member',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List many team members',
				action: 'Get many team members',
			},
			{
				name: 'Get Many Absences',
				value: 'getAbsences',
				description: 'List the absence periods of a team member',
				action: 'Get many team member absences',
			},
			{
				name: 'Resend Welcome Email',
				value: 'resendWelcome',
				description: 'Resend the welcome and password setup e-mail',
				action: 'Resend the welcome email',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Fully replace a team member (PUT)',
				action: 'Update a team member',
			},
			{
				name: 'Update Absence',
				value: 'updateAbsence',
				description: 'Replace an absence period',
				action: 'Update a team member absence',
			},
			{
				name: 'Update Partially',
				value: 'patch',
				description: 'Update only the given team member fields (PATCH)',
				action: 'Update a team member partially',
			},
		],
	},
];

const memberFields: INodeProperties[] = [
	{
		displayName: 'Accepts Auto Assignments',
		name: 'acceptsAutoAssignments',
		type: 'boolean',
		default: true,
		description: 'Whether this member can receive automatic ticket assignments',
	},
	{
		displayName: 'Expertise Names',
		name: 'expertiseNames',
		type: 'string',
		default: '',
		description: 'Comma-separated expertise names; missing names are created',
	},
	{
		displayName: 'Job Title',
		name: 'jobTitle',
		type: 'string',
		default: '',
		description: 'Optional visible job title',
	},
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		placeholder: '+4915112345678',
		description: 'Optional phone number used for WhatsApp group membership',
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		default: 'User',
		description: 'Permission role of the team member',
		options: userRoleOptions,
	},
	optionsField(
		'Topic Names',
		'topicNames',
		'getTicketCategories',
		'Existing ticket topic names to assign',
		{ type: 'multiOptions', default: [] },
	),
];

const activeField: INodeProperties = {
	displayName: 'Is Active',
	name: 'isActive',
	type: 'boolean',
	default: true,
	description: 'Whether this member is active',
};

export const teamMemberFields: INodeProperties[] = [
	locatorProperty({
		displayName: 'Team Member',
		name: 'email',
		resource: RESOURCE,
		operations: [
			'get',
			'update',
			'patch',
			'delete',
			'resendWelcome',
			'getAbsences',
			'createAbsence',
			'updateAbsence',
			'deleteAbsence',
		],
		searchListMethod: 'searchTeamMembers',
		idLabel: 'Email',
		idPlaceholder: 'coach@example.com',
		description: 'The team member, addressed by login e-mail',
	}),

	stringProperty(
		'Email',
		'newEmail',
		RESOURCE,
		['create'],
		'Login e-mail address, must be unique',
		{
			placeholder: 'coach@example.com',
		},
	),
	stringProperty('First Name', 'firstName', RESOURCE, ['create'], 'First name shown in ChatSuite'),
	stringProperty('Last Name', 'lastName', RESOURCE, ['create'], 'Last name shown in ChatSuite'),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create'] } },
		options: memberFields,
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['update', 'patch'] } },
		options: [
			...memberFields,
			activeField,
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'First name shown in ChatSuite',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Last name shown in ChatSuite',
			},
		].sort((a, b) => a.displayName.localeCompare(b.displayName)) as INodeProperties[],
	},

	// --- absences ---
	{
		displayName: 'Absence Name or ID',
		name: 'absenceId',
		type: 'options',
		required: true,
		default: '',
		description:
			'The absence period to act on. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		typeOptions: {
			loadOptionsMethod: 'getTeamMemberAbsences',
			loadOptionsDependsOn: ['email.value'],
		},
		displayOptions: {
			show: { resource: [RESOURCE], operation: ['updateAbsence', 'deleteAbsence'] },
		},
	},
	stringProperty(
		'Start Date',
		'startDate',
		RESOURCE,
		['createAbsence', 'updateAbsence'],
		'First day of the absence',
		{ type: 'dateTime' },
	),
	stringProperty(
		'End Date',
		'endDate',
		RESOURCE,
		['createAbsence', 'updateAbsence'],
		'Last day of the absence',
		{ type: 'dateTime' },
	),
];
