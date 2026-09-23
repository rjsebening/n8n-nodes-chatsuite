import type { INodeProperties } from 'n8n-workflow';

import { knowledgeDocumentStatusOptions } from '../../helpers/enums';
import { downloadBinaryProperty, uploadBinaryProperty } from '../shared/binary.properties';
import { ticketCategoryIdsField } from '../shared/knowledge.properties';
import { optionsField, optionsProperty } from '../shared/locators.properties';
import { listOptionsProperty, paginationProperties } from '../shared/pagination.properties';

const RESOURCE = 'knowledgeDocument';
const SCOPED = ['get', 'patch', 'delete', 'download', 'reindex'];

export const knowledgeDocumentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		default: 'getAll',
		displayOptions: { show: { resource: [RESOURCE] } },
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Hard-delete the document, its vectors, chunks and stored file',
				action: 'Delete a knowledge document',
			},
			{
				name: 'Download',
				value: 'download',
				description: 'Download the original stored file',
				action: 'Download a knowledge document',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one knowledge document and its indexing status',
				action: 'Get a knowledge document',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List knowledge documents',
				action: 'Get many knowledge documents',
			},
			{
				name: 'Reindex',
				value: 'reindex',
				description: 'Queue the stored file for a fresh extraction and indexing pass',
				action: 'Reindex a knowledge document',
			},
			{
				name: 'Update Partially',
				value: 'patch',
				description: 'Update ticket-category assignments and the retrieval toggle',
				action: 'Update a knowledge document partially',
			},
			{
				name: 'Upload',
				value: 'upload',
				description: 'Upload a PDF, DOCX, TXT or Markdown knowledge document',
				action: 'Upload a knowledge document',
			},
		],
	},
];

export const knowledgeDocumentFields: INodeProperties[] = [
	optionsProperty({
		displayName: 'Document',
		name: 'documentId',
		resource: RESOURCE,
		operations: SCOPED,
		loadOptionsMethod: 'getKnowledgeDocuments',
		description: 'The knowledge document to act on',
		required: true,
	}),

	uploadBinaryProperty(
		RESOURCE,
		['upload'],
		'Name of the input binary field holding the PDF, DOCX, TXT or Markdown file (max 32 MiB)',
	),
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['upload'] } },
		options: [ticketCategoryIdsField],
	},
	downloadBinaryProperty(RESOURCE, ['download']),

	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['patch'] } },
		options: [
			{
				displayName: 'Is Active',
				name: 'isActive',
				type: 'boolean',
				default: true,
				description: 'Whether the document is used for retrieval',
			},
			ticketCategoryIdsField,
		],
	},

	...paginationProperties(RESOURCE, ['getAll']),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: [RESOURCE], operation: ['getAll'] } },
		options: [
			{
				displayName: 'Is Active',
				name: 'isActive',
				type: 'boolean',
				default: true,
				description: 'Whether to only return documents active for retrieval',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Full text search across the documents',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'Indexed',
				description: 'Only return documents in this indexing state',
				options: knowledgeDocumentStatusOptions,
			},
			optionsField(
				'Ticket Category ID',
				'ticketCategoryId',
				'getTicketCategoryIds',
				'Only return documents assigned to this ticket category',
			),
		],
	},
	listOptionsProperty(RESOURCE, ['getAll']),
];
