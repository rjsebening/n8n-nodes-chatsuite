import type { INodeProperties } from 'n8n-workflow';

import { optionsProperty, stringProperty } from './locators.properties';

interface CategoryConfig {
	resource: string;
	/** Singular, lower case label used in operation descriptions */
	label: string;
	/** loadOptions method that lists the existing category names */
	loadOptionsMethod: string;
	/** Whether the API exposes a PATCH endpoint for this category type */
	hasPatch: boolean;
}

/**
 * The customer / product category endpoints share one shape: name + color,
 * addressed by category name. This builds both their operations and fields.
 */
export function categoryOperations(config: CategoryConfig): INodeProperties[] {
	const options = [
		{
			name: 'Create',
			value: 'create',
			description: `Create a ${config.label}`,
			action: `Create a ${config.label}`,
		},
		{
			name: 'Delete',
			value: 'delete',
			description: `Delete a ${config.label}`,
			action: `Delete a ${config.label}`,
		},
		{
			name: 'Get',
			value: 'get',
			description: `Get one ${config.label} by name`,
			action: `Get a ${config.label}`,
		},
		{
			name: 'Get Many',
			value: 'getAll',
			description: `List all ${config.label} entries`,
			action: `Get many ${config.label} entries`,
		},
		{
			name: 'Update',
			value: 'update',
			description: `Fully replace a ${config.label} (PUT)`,
			action: `Update a ${config.label}`,
		},
	];

	if (config.hasPatch) {
		options.push({
			name: 'Update Partially',
			value: 'patch',
			description: `Update only the given ${config.label} fields (PATCH)`,
			action: `Update a ${config.label} partially`,
		});
	}

	return [
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			default: 'getAll',
			displayOptions: { show: { resource: [config.resource] } },
			options: options.sort((a, b) => a.name.localeCompare(b.name)),
		},
	];
}

export function categoryFields(config: CategoryConfig): INodeProperties[] {
	const modifyOperations = config.hasPatch ? ['update', 'patch'] : ['update'];

	return [
		optionsProperty({
			displayName: 'Category Name',
			name: 'categoryName',
			resource: config.resource,
			operations: ['get', 'delete', ...modifyOperations],
			loadOptionsMethod: config.loadOptionsMethod,
			description: 'The category to act on',
			required: true,
		}),
		stringProperty('Name', 'name', config.resource, ['create'], 'Human-readable category name'),
		stringProperty('Color', 'color', config.resource, ['create'], 'UI color token or hex color', {
			placeholder: '#1F6FEB',
		}),
		stringProperty('New Name', 'name', config.resource, ['update'], 'Human-readable category name'),
		stringProperty('Color', 'color', config.resource, ['update'], 'UI color token or hex color', {
			placeholder: '#1F6FEB',
		}),
		...(config.hasPatch
			? [
					{
						displayName: 'Update Fields',
						name: 'updateFields',
						type: 'collection',
						placeholder: 'Add Field',
						default: {},
						displayOptions: { show: { resource: [config.resource], operation: ['patch'] } },
						options: [
							{
								displayName: 'Color',
								name: 'color',
								type: 'color',
								default: '',
								description: 'New UI color token or hex color',
							},
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'New human-readable category name',
							},
						],
					} as INodeProperties,
				]
			: []),
	];
}
