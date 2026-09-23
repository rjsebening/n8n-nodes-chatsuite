import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { apiCallFields, apiCallOperations } from './actions/apiCall';
import { automationFields, automationOperations } from './actions/automation';
import { customerFieldProperties, customerOperations } from './actions/customer';
import { customerCategoryFields, customerCategoryOperations } from './actions/customerCategory';
import { customerKnowledgeFields, customerKnowledgeOperations } from './actions/customerKnowledge';
import { dataCollectionFields, dataCollectionOperations } from './actions/dataCollection';
import { dataPointFields, dataPointOperations } from './actions/dataPoint';
import { dataPointValueFields, dataPointValueOperations } from './actions/dataPointValue';
import { groupFields, groupOperations } from './actions/group';
import { knowledgeDocumentFields, knowledgeDocumentOperations } from './actions/knowledgeDocument';
import {
	knowledgeInformationFields,
	knowledgeInformationOperations,
} from './actions/knowledgeInformation';
import { knowledgeQaFields, knowledgeQaOperations } from './actions/knowledgeQa';
import { messageFields, messageOperations } from './actions/message';
import { productFields, productOperations } from './actions/product';
import { productCategoryFields, productCategoryOperations } from './actions/productCategory';
import { resourceSelector } from './actions/resource.selector';
import { route } from './actions/router';
import { teamMemberFields, teamMemberOperations } from './actions/teamMember';
import { ticketFields, ticketOperations } from './actions/ticket';
import { ticketCategoryFields, ticketCategoryOperations } from './actions/ticketCategory';
import { webhookFields, webhookOperations } from './actions/webhook';
import { whatsappChannelFields, whatsappChannelOperations } from './actions/whatsappChannel';
import {
	whatsappGroupCategoryFields,
	whatsappGroupCategoryOperations,
} from './actions/whatsappGroupCategory';
import * as loadOptions from './methods/loadOptions';
import * as listSearch from './methods/listSearch';

export class ChatSuite implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatSuite',
		name: 'chatSuite',
		icon: { light: 'file:chatsuite-light-icon.svg', dark: 'file:chatsuite-dark-icon.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the ChatSuite API (powered by joergsebening.de)',
		defaults: {
			name: 'ChatSuite',
			// @ts-expect-error free-form description
			description: 'Interact with the ChatSuite API (powered by joergsebening.de)',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'chatSuiteApi', required: true }],
		// Tool-usable for all JSON operations. The seven binary operations
		// (customer CSV import/export, knowledge document and Q&A attachment
		// up-/download) need a real binary item and are not meant to be driven
		// by an AI agent.
		usableAsTool: true,
		properties: [
			resourceSelector,

			...apiCallOperations,
			...apiCallFields,
			...automationOperations,
			...automationFields,
			...customerOperations,
			...customerFieldProperties,
			...customerCategoryOperations,
			...customerCategoryFields,
			...customerKnowledgeOperations,
			...customerKnowledgeFields,
			...dataCollectionOperations,
			...dataCollectionFields,
			...dataPointOperations,
			...dataPointFields,
			...dataPointValueOperations,
			...dataPointValueFields,
			...groupOperations,
			...groupFields,
			...knowledgeDocumentOperations,
			...knowledgeDocumentFields,
			...knowledgeInformationOperations,
			...knowledgeInformationFields,
			...knowledgeQaOperations,
			...knowledgeQaFields,
			...messageOperations,
			...messageFields,
			...productOperations,
			...productFields,
			...productCategoryOperations,
			...productCategoryFields,
			...teamMemberOperations,
			...teamMemberFields,
			...ticketOperations,
			...ticketFields,
			...ticketCategoryOperations,
			...ticketCategoryFields,
			...webhookOperations,
			...webhookFields,
			...whatsappChannelOperations,
			...whatsappChannelFields,
			...whatsappGroupCategoryOperations,
			...whatsappGroupCategoryFields,
		],
	};

	methods = {
		loadOptions: { ...loadOptions },
		listSearch: { ...listSearch },
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				const responseData = await route.call(this, i, resource, operation);

				// Handlers either return plain JSON or ready-made items (binary downloads)
				const results = Array.isArray(responseData) ? responseData : [responseData];
				for (const entry of results) {
					if (entry && typeof entry === 'object' && 'json' in entry) {
						returnData.push({ pairedItem: { item: i }, ...(entry as INodeExecutionData) });
						continue;
					}
					returnData.push({ json: (entry ?? {}) as IDataObject, pairedItem: { item: i } });
				}
			} catch (error) {
				const nodeError =
					error instanceof NodeApiError || error instanceof NodeOperationError
						? error
						: new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });

				if (this.continueOnFail()) {
					returnData.push({ json: items[i].json, error: nodeError, pairedItem: { item: i } });
					continue;
				}
				throw nodeError;
			}
		}

		return [returnData];
	}
}
