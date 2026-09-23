import type { IDataObject, IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest } from '../../helpers/apiclient';
import { parseJsonParameter } from '../../helpers/params';

export async function handleApiCall(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	if (operation !== 'request') {
		throw new NodeOperationError(this.getNode(), `Unsupported API call operation: ${operation}`, {
			itemIndex: i,
		});
	}

	const method = this.getNodeParameter('method', i) as IHttpRequestMethods;
	const path = this.getNodeParameter('path', i) as string;
	const qs = parseJsonParameter(
		this,
		this.getNodeParameter('queryParameters', i, ''),
		i,
		'Query Parameters',
	);
	const body =
		method === 'GET'
			? undefined
			: parseJsonParameter(this, this.getNodeParameter('body', i, ''), i, 'Body');

	const response = await csRequest<IDataObject | IDataObject[]>(this, method, path, {
		qs,
		...(body && Object.keys(body).length ? { body } : {}),
	});

	return response ?? { success: true };
}
