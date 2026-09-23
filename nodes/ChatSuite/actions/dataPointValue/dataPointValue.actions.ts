import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest } from '../../helpers/apiclient';
import { buildBody, buildListQuery, cleanBody, getRlRequired, seg } from '../../helpers/params';

/** Drops the zero defaults of the numeric period fields */
function periodBody(ctx: IExecuteFunctions, i: number): IDataObject {
	const period = ctx.getNodeParameter('period', i, {}) as IDataObject;
	const body: IDataObject = {};
	for (const [key, value] of Object.entries(cleanBody(period))) {
		if (typeof value === 'number' && value === 0) continue;
		body[key] = value;
	}
	if (Object.keys(body).length === 0) {
		throw new NodeOperationError(
			ctx.getNode(),
			'At least one Period field is required to identify the value',
			{ itemIndex: i },
		);
	}
	return body;
}

export async function handleDataPointValue(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
	const dataPointId = this.getNodeParameter('dataPointId', i) as string;
	const path = `/api/v1/customer/${seg(phoneNumber)}/data-point-value/${seg(dataPointId)}`;

	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, path, buildListQuery(this, i));

		case 'write': {
			const body = buildBody(
				{
					value: this.getNodeParameter('value', i) as string,
					period: periodBody(this, i),
				},
				this.getNodeParameter('additionalFields', i, {}) as IDataObject,
			);
			return await csRequest<IDataObject>(this, 'POST', path, { body });
		}

		case 'delete': {
			const response = await csRequest<IDataObject>(this, 'DELETE', path, {
				body: { period: periodBody(this, i) },
			});
			return response ?? { success: true, phoneNumber, dataPointId };
		}

		default:
			throw new NodeOperationError(
				this.getNode(),
				`Unsupported data point value operation: ${operation}`,
				{ itemIndex: i },
			);
	}
}
