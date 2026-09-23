import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csRequest, unwrapList } from '../../helpers/apiclient';
import { cleanBody, seg } from '../../helpers/params';

/**
 * Shared executor for the name+color category endpoints
 * (/customer-category and /product-category).
 */
export async function handleCategory(
	ctx: IExecuteFunctions,
	i: number,
	operation: string,
	basePath: string,
	label: string,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'getAll': {
			const response = await csRequest(ctx, 'GET', basePath);
			return unwrapList<IDataObject>(response);
		}

		case 'get': {
			const categoryName = ctx.getNodeParameter('categoryName', i) as string;
			return await csRequest<IDataObject>(ctx, 'GET', `${basePath}/${seg(categoryName)}`);
		}

		case 'create': {
			const body = {
				name: ctx.getNodeParameter('name', i) as string,
				color: ctx.getNodeParameter('color', i) as string,
			};
			return await csRequest<IDataObject>(ctx, 'POST', basePath, { body });
		}

		case 'update': {
			const categoryName = ctx.getNodeParameter('categoryName', i) as string;
			const body = {
				name: ctx.getNodeParameter('name', i) as string,
				color: ctx.getNodeParameter('color', i) as string,
			};
			return await csRequest<IDataObject>(ctx, 'PUT', `${basePath}/${seg(categoryName)}`, {
				body,
			});
		}

		case 'patch': {
			const categoryName = ctx.getNodeParameter('categoryName', i) as string;
			const updateFields = ctx.getNodeParameter('updateFields', i, {}) as IDataObject;
			return await csRequest<IDataObject>(ctx, 'PATCH', `${basePath}/${seg(categoryName)}`, {
				body: cleanBody(updateFields),
			});
		}

		case 'delete': {
			const categoryName = ctx.getNodeParameter('categoryName', i) as string;
			const response = await csRequest<IDataObject>(
				ctx,
				'DELETE',
				`${basePath}/${seg(categoryName)}`,
			);
			return response ?? { success: true, name: categoryName };
		}

		default:
			throw new NodeOperationError(ctx.getNode(), `Unsupported ${label} operation: ${operation}`, {
				itemIndex: i,
			});
	}
}
