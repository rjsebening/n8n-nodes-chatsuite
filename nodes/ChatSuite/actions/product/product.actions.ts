import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest } from '../../helpers/apiclient';
import {
	buildBody,
	buildListQuery,
	cleanBody,
	getRlRequired,
	seg,
	toStringArray,
} from '../../helpers/params';

function productBody(fields: IDataObject): IDataObject {
	const body = cleanBody(fields);
	if (fields.productCategoryNames !== undefined) {
		body.productCategoryNames = toStringArray(fields.productCategoryNames);
	}
	return body;
}

export async function handleProduct(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, '/api/v1/product', buildListQuery(this, i));

		case 'get': {
			const productCode = getRlRequired(this, 'productCode', i, 'Product');
			return await csRequest<IDataObject>(this, 'GET', `/api/v1/product/${seg(productCode)}`);
		}

		case 'create': {
			const body = buildBody(
				{
					productCode: this.getNodeParameter('newProductCode', i) as string,
					name: this.getNodeParameter('name', i) as string,
				},
				productBody(this.getNodeParameter('additionalFields', i, {}) as IDataObject),
			);
			return await csRequest<IDataObject>(this, 'POST', '/api/v1/product', { body });
		}

		case 'update': {
			const productCode = getRlRequired(this, 'productCode', i, 'Product');
			const body = buildBody(
				{
					productCode: this.getNodeParameter('newProductCode', i) as string,
					name: this.getNodeParameter('name', i) as string,
				},
				productBody(this.getNodeParameter('additionalFields', i, {}) as IDataObject),
			);
			return await csRequest<IDataObject>(this, 'PUT', `/api/v1/product/${seg(productCode)}`, {
				body,
			});
		}

		case 'patch': {
			const productCode = getRlRequired(this, 'productCode', i, 'Product');
			const body = productBody(this.getNodeParameter('updateFields', i, {}) as IDataObject);
			return await csRequest<IDataObject>(this, 'PATCH', `/api/v1/product/${seg(productCode)}`, {
				body,
			});
		}

		case 'delete': {
			const productCode = getRlRequired(this, 'productCode', i, 'Product');
			const response = await csRequest<IDataObject>(
				this,
				'DELETE',
				`/api/v1/product/${seg(productCode)}`,
			);
			return response ?? { success: true, productCode };
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unsupported product operation: ${operation}`, {
				itemIndex: i,
			});
	}
}
