import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest } from '../../helpers/apiclient';
import { buildListQuery, cleanBody, getRlRequired, seg } from '../../helpers/params';
import { queryBody } from '../shared/knowledge.actions';

export async function handleCustomerKnowledge(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
	const base = `/api/v1/customer/${seg(phoneNumber)}/knowledge`;

	// Every customer knowledge route takes the optional group scope as a query param
	const whatsAppGroupId = (this.getNodeParameter('whatsAppGroupId', i, '') as string).trim();
	const scopeQs: IDataObject = whatsAppGroupId ? { whatsAppGroupId } : {};

	const scoped = ['get', 'patch', 'delete', 'approve'].includes(operation);
	const knowledgeId = scoped ? (this.getNodeParameter('knowledgeId', i) as string) : '';

	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, base, {
				...buildListQuery(this, i),
				...scopeQs,
			});

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${base}/${seg(knowledgeId)}`, {
				qs: scopeQs,
			});

		case 'create':
			return await csRequest<IDataObject>(this, 'POST', base, {
				qs: scopeQs,
				body: { content: this.getNodeParameter('content', i) as string },
			});

		case 'patch': {
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
			const body = cleanBody(updateFields);
			if (updateFields.isApproved !== undefined) body.isApproved = updateFields.isApproved;
			return await csRequest<IDataObject>(this, 'PATCH', `${base}/${seg(knowledgeId)}`, {
				qs: scopeQs,
				body,
			});
		}

		case 'delete': {
			const response = await csRequest<IDataObject>(this, 'DELETE', `${base}/${seg(knowledgeId)}`, {
				qs: scopeQs,
			});
			return response ?? { success: true, knowledgeId };
		}

		case 'approve': {
			const response = await csRequest<IDataObject>(
				this,
				'POST',
				`${base}/${seg(knowledgeId)}/approve`,
				{ qs: scopeQs },
			);
			return response ?? { success: true, knowledgeId };
		}

		case 'query':
			return await csRequest<IDataObject>(this, 'POST', `${base}/query`, {
				qs: scopeQs,
				body: queryBody(this, i),
			});

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported customer knowledge operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
