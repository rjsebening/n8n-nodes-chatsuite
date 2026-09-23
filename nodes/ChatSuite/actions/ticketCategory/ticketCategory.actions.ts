import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest, unwrapList } from '../../helpers/apiclient';
import { buildBody, cleanBody, seg, toStringArray } from '../../helpers/params';

const BASE = '/api/v1/ticket-category';

function categoryBody(fields: IDataObject): IDataObject {
	const body = cleanBody(fields);
	for (const key of ['memberUserIds', 'orderedMemberUserIds']) {
		if (fields[key] !== undefined) body[key] = toStringArray(fields[key]);
	}
	if (fields.isActive !== undefined) body.isActive = fields.isActive;
	if (fields.sortOrder !== undefined) body.sortOrder = fields.sortOrder;
	return body;
}

export async function handleTicketCategory(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getAll':
			return unwrapList<IDataObject>(await csRequest(this, 'GET', BASE));

		case 'get': {
			const categoryName = this.getNodeParameter('categoryName', i) as string;
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(categoryName)}`);
		}

		case 'create':
		case 'update': {
			const body = buildBody(
				{
					name: this.getNodeParameter('name', i) as string,
					color: this.getNodeParameter('color', i) as string,
					icon: this.getNodeParameter('icon', i) as string,
				},
				categoryBody(this.getNodeParameter('additionalFields', i, {}) as IDataObject),
			);

			if (operation === 'create') {
				return await csRequest<IDataObject>(this, 'POST', BASE, { body });
			}

			const categoryName = this.getNodeParameter('categoryName', i) as string;
			return await csRequest<IDataObject>(this, 'PUT', `${BASE}/${seg(categoryName)}`, { body });
		}

		case 'delete': {
			const categoryName = this.getNodeParameter('categoryName', i) as string;
			const response = await csRequest<IDataObject>(this, 'DELETE', `${BASE}/${seg(categoryName)}`);
			return response ?? { success: true, name: categoryName };
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported ticket category operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
