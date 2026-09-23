import type { INodeProperties } from 'n8n-workflow';

interface LocatorConfig {
	displayName: string;
	name: string;
	resource: string;
	operations: string[];
	searchListMethod: string;
	idLabel: string;
	idPlaceholder: string;
	description: string;
	required?: boolean;
}

/**
 * resourceLocator with a searchable "From List" mode and a manual ID mode,
 * used for the large, searchable collections of the API.
 */
export function locatorProperty(config: LocatorConfig): INodeProperties {
	return {
		displayName: config.displayName,
		name: config.name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: config.required ?? true,
		description: config.description,
		displayOptions: { show: { resource: [config.resource], operation: config.operations } },
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: { searchListMethod: config.searchListMethod, searchable: true },
			},
			{
				displayName: config.idLabel,
				name: 'id',
				type: 'string',
				placeholder: config.idPlaceholder,
			},
		],
	};
}

interface OptionsConfig {
	displayName: string;
	name: string;
	resource: string;
	operations: string[];
	loadOptionsMethod: string;
	description: string;
	required?: boolean;
	multiple?: boolean;
	loadOptionsDependsOn?: string[];
}

/** Dropdown backed by a loadOptions method, with the n8n mandated hint text */
export function optionsProperty(config: OptionsConfig): INodeProperties {
	return {
		displayName: config.displayName,
		name: config.name,
		type: config.multiple ? 'multiOptions' : 'options',
		default: config.multiple ? [] : '',
		required: config.required ?? false,
		description: `${config.description}. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.`,
		typeOptions: {
			loadOptionsMethod: config.loadOptionsMethod,
			...(config.loadOptionsDependsOn ? { loadOptionsDependsOn: config.loadOptionsDependsOn } : {}),
		},
		displayOptions: { show: { resource: [config.resource], operation: config.operations } },
	};
}

/** Same as optionsProperty, but shaped for use inside a collection/fixedCollection */
export function optionsField(
	displayName: string,
	name: string,
	loadOptionsMethod: string,
	description: string,
	extra: Partial<INodeProperties> = {},
): INodeProperties {
	return {
		displayName,
		name,
		type: 'options',
		default: '',
		description: `${description}. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.`,
		typeOptions: { loadOptionsMethod },
		...extra,
	};
}

/** Plain required string path parameter */
export function stringProperty(
	displayName: string,
	name: string,
	resource: string,
	operations: string[],
	description: string,
	extra: Partial<INodeProperties> = {},
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		required: true,
		default: '',
		description,
		displayOptions: { show: { resource: [resource], operation: operations } },
		...extra,
	};
}
