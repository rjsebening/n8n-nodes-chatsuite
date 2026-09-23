import type { INodePropertyOptions } from 'n8n-workflow';

/** Builds an alphabetically sorted option list from the spec's enum values */
function enumOptions(values: string[]): INodePropertyOptions[] {
	return values
		.map((value) => ({ name: value, value }))
		.sort((a, b) => a.name.localeCompare(b.name));
}

export const automationStatusOptions = enumOptions(['Draft', 'Active', 'Paused', 'Archived']);

export const automationExecutionStatusOptions = enumOptions([
	'Pending',
	'Running',
	'Completed',
	'Failed',
	'Cancelled',
	'Waiting',
]);

export const dataFieldTypeOptions = enumOptions([
	'Number',
	'FreeText',
	'Range',
	'File',
	'Date',
	'YesNo',
	'Selection',
	'Currency',
]);

export const periodTypeOptions = enumOptions(['Day', 'Week', 'Month', 'Quarter', 'Year']);

export const knowledgeDocumentStatusOptions = enumOptions([
	'Uploaded',
	'Processing',
	'Indexed',
	'Failed',
]);

export const knowledgeProcessingStatusOptions = enumOptions([
	'Pending',
	'Processing',
	'Completed',
	'Failed',
]);

export const topicDistributionModeOptions = enumOptions(['FairDistribution', 'PrimaryAndBackup']);

export const userRoleOptions = enumOptions(['User', 'TenantAdmin', 'SuperAdmin']);

export const dataCollectionScopeOptions = enumOptions(['AllTargets', 'Customer']);

export const botStatusOptions = enumOptions([
	'Connected',
	'Disconnected',
	'Scanning',
	'Connecting',
	'Error',
]);
