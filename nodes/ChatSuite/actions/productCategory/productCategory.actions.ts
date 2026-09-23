import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import { handleCategory } from '../shared/category.actions';

export async function handleProductCategory(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	return await handleCategory(this, i, operation, '/api/v1/product-category', 'product category');
}
