import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest, unwrapList } from '../../helpers/apiclient';
import { seg } from '../../helpers/params';

const BASE = '/api/v1/whatsapp-group-category';

export async function handleWhatsappGroupCategory(
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

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported group category operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
