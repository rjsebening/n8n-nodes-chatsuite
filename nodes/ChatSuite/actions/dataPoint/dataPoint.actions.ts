import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest, unwrapList } from '../../helpers/apiclient';
import { buildBody, cleanBody, parseJsonParameter, seg } from '../../helpers/params';

const BASE = '/api/v1/data-point';

function dataPointBody(ctx: IExecuteFunctions, i: number, fields: IDataObject): IDataObject {
	const body = cleanBody(fields);
	if (fields.config !== undefined && fields.config !== '') {
		body.config = parseJsonParameter(ctx, fields.config, i, 'Config');
	}
	return body;
}

export async function handleDataPoint(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const dataPointId =
		operation === 'getAll' || operation === 'create'
			? ''
			: (this.getNodeParameter('dataPointId', i) as string);

	switch (operation) {
		case 'getAll':
			return unwrapList<IDataObject>(await csRequest(this, 'GET', BASE));

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(dataPointId)}`);

		case 'create': {
			const body = buildBody(
				{
					name: this.getNodeParameter('name', i) as string,
					fieldType: this.getNodeParameter('fieldType', i) as string,
				},
				dataPointBody(this, i, this.getNodeParameter('additionalFields', i, {}) as IDataObject),
			);
			return await csRequest<IDataObject>(this, 'POST', BASE, { body });
		}

		case 'update': {
			const body = buildBody(
				{ name: this.getNodeParameter('name', i) as string },
				dataPointBody(this, i, this.getNodeParameter('additionalFields', i, {}) as IDataObject),
			);
			return await csRequest<IDataObject>(this, 'PUT', `${BASE}/${seg(dataPointId)}`, { body });
		}

		case 'patch':
			return await csRequest<IDataObject>(this, 'PATCH', `${BASE}/${seg(dataPointId)}`, {
				body: dataPointBody(this, i, this.getNodeParameter('updateFields', i, {}) as IDataObject),
			});

		case 'delete': {
			const response = await csRequest<IDataObject>(this, 'DELETE', `${BASE}/${seg(dataPointId)}`);
			return response ?? { success: true, dataPointId };
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported data point operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
