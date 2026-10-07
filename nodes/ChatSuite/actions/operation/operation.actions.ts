import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest } from '../../helpers/apiclient';
import { seg } from '../../helpers/params';

const BASE = '/api/v1/operations';

export async function handleOperation(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject> {
	const operationId = (this.getNodeParameter('operationId', i) as string).trim();

	switch (operation) {
		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(operationId)}`);

		case 'cancel':
			return await csRequest<IDataObject>(this, 'POST', `${BASE}/${seg(operationId)}/cancel`);

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported operation operation: ${operation}`,
				{
					itemIndex: i,
				},
			);
	}
}
