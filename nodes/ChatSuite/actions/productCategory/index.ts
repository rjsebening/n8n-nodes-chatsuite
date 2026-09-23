import type { INodeProperties } from 'n8n-workflow';

import { categoryFields, categoryOperations } from '../shared/category.properties';

const CONFIG = {
	resource: 'productCategory',
	label: 'product category',
	loadOptionsMethod: 'getProductCategories',
	hasPatch: true,
};

export const productCategoryOperations: INodeProperties[] = categoryOperations(CONFIG);
export const productCategoryFields: INodeProperties[] = categoryFields(CONFIG);
