import type { INodeProperties } from 'n8n-workflow';

/** Input binary property for upload operations */
export function uploadBinaryProperty(
	resource: string,
	operations: string[],
	description: string,
): INodeProperties {
	return {
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		description,
		displayOptions: { show: { resource: [resource], operation: operations } },
	};
}

/** Output binary property for download operations */
export function downloadBinaryProperty(resource: string, operations: string[]): INodeProperties {
	return {
		displayName: 'Put Output File in Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		hint: 'The name of the output binary field to put the file in',
		displayOptions: { show: { resource: [resource], operation: operations } },
	};
}
