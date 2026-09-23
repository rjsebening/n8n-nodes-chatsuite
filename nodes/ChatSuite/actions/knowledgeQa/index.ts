import type { INodeProperties } from 'n8n-workflow';

import { downloadBinaryProperty, uploadBinaryProperty } from '../shared/binary.properties';
import {
	isApprovedField,
	knowledgeListFilters,
	ticketCategoryIdsField,
} from '../shared/knowledge.properties';
import { optionsProperty, stringProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'knowledgeQa';
const SCOPED = [
	'get',
	'patch',
	'delete',
	'approve',
	'reprocess',
	'getAttachment',
	'uploadAttachment',
	'deleteAttachment',
	'downloadAttachment',
];

export const knowledgeQaOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Approve',
				value: 'approve',
				description: 'Idempotently approve a Q&A entry',
				action: 'Approve a Q and A entry',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a Q&A entry',
				action: 'Create a Q and A entry',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Soft-delete a Q&A entry and remove it from retrieval',
				action: 'Delete a Q and A entry',
			},
			{
				name: 'Delete Attachment',
				value: 'deleteAttachment',
				description: 'Remove the attachment from a Q&A entry',
				action: 'Delete a Q and A attachment',
			},
			{
				name: 'Download Attachment',
				value: 'downloadAttachment',
				description: 'Download the attachment content of a Q&A entry',
				action: 'Download a Q and A attachment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one Q&A entry',
				action: 'Get a Q and A entry',
			},
			{
				name: 'Get Attachment',
				value: 'getAttachment',
				description: 'Get the attachment metadata of a Q&A entry',
				action: 'Get a Q and A attachment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List Q&A entries',
				action: 'Get many Q and A entries',
			},
			{
				name: 'Reprocess',
				value: 'reprocess',
				description: 'Re-queue a failed or pending Q&A entry for reformulation',
				action: 'Reprocess a Q and A entry',
			},
			{
				name: 'Update Partially',
				value: 'patch',
				description: 'Update only the given fields of a Q&A entry',
				action: 'Update a Q and A entry partially',
			},
			{
				name: 'Upload Attachment',
				value: 'uploadAttachment',
				description: 'Upload or atomically replace the attachment of a Q&A entry',
				action: 'Upload a Q and A attachment',
			},
		],
	},
];

const keywordsField: INodeProperties = {
	displayName: 'Keywords',
	name: 'keywords',
	type: 'string',
	default: '',
	description: 'Comma-separated keywords that should match this entry',
};

export const knowledgeQaFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Q&A Entry',
		name: 'knowledgeId',
		resource: RESOURCE,
		operations: SCOPED,
		loadOptionsMethod: 'getKnowledgeQa',
		description: 'The Q&A entry to act on',
		required: true,
	}),

	stringProperty('Question', 'question', RESOURCE, ['create'], 'The question users may ask', {
		typeOptions: { rows: 2 },
	}),
	stringProperty('Answer', 'answer', RESOURCE, ['create'], 'The answer to return', {
		typeOptions: { rows: 4 },
	}),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['create'] } },
		options: [isApprovedField, keywordsField, ticketCategoryIdsField],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['patch'] } },
		options: [
			{
				displayName: 'Answer',
				name: 'answer',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'New answer text',
			},
			isApprovedField,
			keywordsField,
			{
				displayName: 'Question',
				name: 'question',
				type: 'string',
				typeOptions: { rows: 2 },
				default: '',
				description: 'New question text',
			},
			ticketCategoryIdsField,
		],
	},

	uploadBinaryProperty(
		RESOURCE,
		['uploadAttachment'],
		'Name of the input binary field that holds the attachment',
	),
	downloadBinaryProperty(RESOURCE, ['downloadAttachment']),

	...paginationProperties(RESOURCE, ['getAll']),
	knowledgeListFilters(RESOURCE),
	listOptionsProperty(RESOURCE, ['getAll']),
];
