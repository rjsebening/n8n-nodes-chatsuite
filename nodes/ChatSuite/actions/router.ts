import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { handleApiCall } from './apiCall/apiCall.actions';
import { handleAutomation } from './automation/automation.actions';
import { handleCustomer } from './customer/customer.actions';
import { handleCustomerCategory } from './customerCategory/customerCategory.actions';
import { handleCustomerKnowledge } from './customerKnowledge/customerKnowledge.actions';
import { handleDataCollection } from './dataCollection/dataCollection.actions';
import { handleDataPoint } from './dataPoint/dataPoint.actions';
import { handleDataPointValue } from './dataPointValue/dataPointValue.actions';
import { handleGroup } from './group/group.actions';
import { handleKnowledgeDocument } from './knowledgeDocument/knowledgeDocument.actions';
import { handleKnowledgeInformation } from './knowledgeInformation/knowledgeInformation.actions';
import { handleKnowledgeQa } from './knowledgeQa/knowledgeQa.actions';
import { handleMessage } from './message/message.actions';
import { handleProduct } from './product/product.actions';
import { handleProductCategory } from './productCategory/productCategory.actions';
import { handleTeamMember } from './teamMember/teamMember.actions';
import { handleTicket } from './ticket/ticket.actions';
import { handleTicketCategory } from './ticketCategory/ticketCategory.actions';
import type { HandlerResult, ResourceHandler } from './types';
import { handleWebhook } from './webhook/webhook.actions';
import { handleWhatsappChannel } from './whatsappChannel/whatsappChannel.actions';
import { handleWhatsappGroupCategory } from './whatsappGroupCategory/whatsappGroupCategory.actions';

const handlers: Record<string, ResourceHandler> = {
	apiCall: handleApiCall,
	automation: handleAutomation,
	customer: handleCustomer,
	customerCategory: handleCustomerCategory,
	customerKnowledge: handleCustomerKnowledge,
	dataCollection: handleDataCollection,
	dataPoint: handleDataPoint,
	dataPointValue: handleDataPointValue,
	group: handleGroup,
	knowledgeDocument: handleKnowledgeDocument,
	knowledgeInformation: handleKnowledgeInformation,
	knowledgeQa: handleKnowledgeQa,
	message: handleMessage,
	product: handleProduct,
	productCategory: handleProductCategory,
	teamMember: handleTeamMember,
	ticket: handleTicket,
	ticketCategory: handleTicketCategory,
	webhook: handleWebhook,
	whatsappChannel: handleWhatsappChannel,
	whatsappGroupCategory: handleWhatsappGroupCategory,
};

export async function route(
	this: IExecuteFunctions,
	i: number,
	resource: string,
	operation: string,
): Promise<HandlerResult> {
	const handler = handlers[resource];
	if (!handler) {
		throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, {
			itemIndex: i,
		});
	}

	return await handler.call(this, i, operation);
}
