import type { INodeProperties } from 'n8n-workflow';

import { categoryFields, categoryOperations } from '../shared/category.properties';

const CONFIG = {
	resource: 'customerCategory',
	label: 'customer category',
	loadOptionsMethod: 'getCustomerCategories',
	hasPatch: true,
};

export const customerCategoryOperations: INodeProperties[] = categoryOperations(CONFIG);
export const customerCategoryFields: INodeProperties[] = categoryFields(CONFIG);
