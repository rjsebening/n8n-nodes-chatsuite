import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest, csRequestBinary, csRequestMultipart } from '../../helpers/apiclient';
import { getUploadFile, toBinaryItem } from '../../helpers/binary';
import { buildListQuery, seg, toStringArray } from '../../helpers/params';
import { knowledgeBody } from '../shared/knowledge.actions';

const BASE = '/api/v1/knowledge/documents';

export async function handleKnowledgeDocument(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[] | INodeExecutionData> {
	const documentId =
		operation === 'getAll' || operation === 'upload'
			? ''
			: (this.getNodeParameter('documentId', i) as string);

	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, BASE, buildListQuery(this, i));

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(documentId)}`);

		case 'upload': {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
			const file = await getUploadFile(this, i, binaryPropertyName, 'document');

			const formData: IDataObject = { File: file };
			const categoryIds = toStringArray(additionalFields.ticketCategoryIds);
			if (categoryIds.length) formData.TicketCategoryIds = categoryIds;

			return await csRequestMultipart<IDataObject>(this, 'POST', BASE, formData);
		}

		case 'patch':
			return await csRequest<IDataObject>(this, 'PATCH', `${BASE}/${seg(documentId)}`, {
				body: knowledgeBody(this.getNodeParameter('updateFields', i, {}) as IDataObject),
			});

		case 'delete': {
			const response = await csRequest<IDataObject>(this, 'DELETE', `${BASE}/${seg(documentId)}`);
			return response ?? { success: true, documentId };
		}

		case 'reindex': {
			const response = await csRequest<IDataObject>(
				this,
				'POST',
				`${BASE}/${seg(documentId)}/reindex`,
			);
			return response ?? { success: true, documentId };
		}

		case 'download': {
			const download = await csRequestBinary(this, `${BASE}/${seg(documentId)}/content`);
			return await toBinaryItem(this, i, download, `document-${documentId}`, { documentId });
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported knowledge document operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
