import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest, csRequestBinary, csRequestMultipart } from '../../helpers/apiclient';
import { getUploadFile, toBinaryItem } from '../../helpers/binary';
import { buildBody, buildListQuery, seg } from '../../helpers/params';
import { knowledgeBody } from '../shared/knowledge.actions';

const BASE = '/api/v1/knowledge/qa';

export async function handleKnowledgeQa(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[] | INodeExecutionData> {
	const knowledgeId =
		operation === 'getAll' || operation === 'create'
			? ''
			: (this.getNodeParameter('knowledgeId', i) as string);

	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, BASE, buildListQuery(this, i));

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(knowledgeId)}`);

		case 'create': {
			const body = buildBody(
				{
					question: this.getNodeParameter('question', i) as string,
					answer: this.getNodeParameter('answer', i) as string,
				},
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

		case 'getAttachment':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(knowledgeId)}/attachment`);

		case 'uploadAttachment': {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const file = await getUploadFile(this, i, binaryPropertyName, 'attachment');
			return await csRequestMultipart<IDataObject>(
				this,
				'PUT',
				`${BASE}/${seg(knowledgeId)}/attachment`,
				{ File: file },
			);
		}

		case 'deleteAttachment': {
			const response = await csRequest<IDataObject>(
				this,
				'DELETE',
				`${BASE}/${seg(knowledgeId)}/attachment`,
			);
			return response ?? { success: true, knowledgeId };
		}

		case 'downloadAttachment': {
			const download = await csRequestBinary(
				this,
				`${BASE}/${seg(knowledgeId)}/attachment/content`,
			);
			return await toBinaryItem(this, i, download, `qa-${knowledgeId}-attachment`, {
				knowledgeId,
			});
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported knowledge Q&A operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
