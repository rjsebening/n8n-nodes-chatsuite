import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest } from '../../helpers/apiclient';
import { buildBody, buildListQuery, seg } from '../../helpers/params';
import { knowledgeBody, queryBody } from '../shared/knowledge.actions';

const BASE = '/api/v1/knowledge';

export async function handleKnowledgeInformation(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const scoped = ['get', 'patch', 'delete', 'approve', 'reprocess'].includes(operation);
	const knowledgeId = scoped ? (this.getNodeParameter('knowledgeId', i) as string) : '';

	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, BASE, buildListQuery(this, i));

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(knowledgeId)}`);

		case 'create': {
			const body = buildBody(
				{ content: this.getNodeParameter('content', i) as string },
				knowledgeBody(this.getNodeParameter('additionalFields', i, {}) as IDataObject),
			);
			return await csRequest<IDataObject>(this, 'POST', BASE, { body });
		}

		case 'patch':
			return await csRequest<IDataObject>(this, 'PATCH', `${BASE}/${seg(knowledgeId)}`, {
				body: knowledgeBody(this.getNodeParameter('updateFields', i, {}) as IDataObject),
			});

		case 'delete': {
			const response = await csRequest<IDataObject>(this, 'DELETE', `${BASE}/${seg(knowledgeId)}`);
			return response ?? { success: true, knowledgeId };
		}

		case 'approve': {
			const response = await csRequest<IDataObject>(
				this,
				'POST',
				`${BASE}/${seg(knowledgeId)}/approve`,
			);
			return response ?? { success: true, knowledgeId };
		}

		case 'reprocess': {
			const response = await csRequest<IDataObject>(
				this,
				'POST',
				`${BASE}/${seg(knowledgeId)}/reprocess`,
			);
			return response ?? { success: true, knowledgeId };
		}

		case 'query':
			return await csRequest<IDataObject>(this, 'POST', `${BASE}/query`, {
				body: queryBody(this, i),
			});

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported knowledge information operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
