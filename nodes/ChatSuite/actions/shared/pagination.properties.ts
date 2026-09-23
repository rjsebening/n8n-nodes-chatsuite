import type { INodeProperties } from 'n8n-workflow';

/**
 * "Return All" + "Limit" pair for a getAll operation of one resource.
 * `operations` defaults to the single `getAll` operation.
 */
export function paginationProperties(
	resource: string,
	operations: string[] = ['getAll'],
): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
			displayOptions: { show: { resource: [resource], operation: operations } },
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			default: 50,
			typeOptions: { minValue: 1 },
			description: 'Max number of results to return',
			displayOptions: {
				show: { resource: [resource], operation: operations, returnAll: [false] },
			},
		},
	];
}

/** Shared OData query options every list endpoint of the API accepts */
export function listOptionsProperty(
	resource: string,
	operations: string[] = ['getAll'],
	extra: INodeProperties[] = [],
): INodeProperties {
	return {
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [resource], operation: operations } },
		options: [
			...extra,
			{
				displayName: 'Order By',
				name: '$orderby',
				type: 'string',
				default: '',
				placeholder: 'createdAt desc',
				description: 'OData sort expression, for example "createdAt desc"',
			},
			{
				displayName: 'Select Fields',
				name: '$select',
				type: 'string',
				default: '',
				placeholder: 'name,createdAt',
				description: 'Comma-separated list of fields to return',
			},
		].sort((a, b) => a.displayName.localeCompare(b.displayName)) as INodeProperties[],
	};
}
