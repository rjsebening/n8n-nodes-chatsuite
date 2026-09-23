import type { IDataObject, IExecuteFunctions, INodeParameterResourceLocator } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Reads a resourceLocator parameter and returns its plain value, no matter
 * whether the user picked from the list or typed an ID/expression.
 */
export function getRl(ctx: IExecuteFunctions, name: string, i: number): string {
	const raw = ctx.getNodeParameter(name, i) as INodeParameterResourceLocator | string | number;
	if (raw === null || raw === undefined) return '';
	if (typeof raw === 'string' || typeof raw === 'number') return String(raw).trim();
	return String(raw.value ?? '').trim();
}

/** Same as getRl, but fails loudly when the value is required and missing. */
export function getRlRequired(
	ctx: IExecuteFunctions,
	name: string,
	i: number,
	label: string,
): string {
	const value = getRl(ctx, name, i);
	if (!value) {
		throw new NodeOperationError(ctx.getNode(), `${label} is required`, { itemIndex: i });
	}
	return value;
}

/** Drops keys the user left empty so PATCH bodies only carry real changes. */
export function cleanBody(source: IDataObject): IDataObject {
	const body: IDataObject = {};
	for (const [key, value] of Object.entries(source)) {
		if (value === undefined || value === null || value === '') continue;
		body[key] = value;
	}
	return body;
}

/**
 * Merges required fields with an "Additional Fields"/"Update Fields" collection.
 * Collection entries win over nothing - required values are always kept.
 */
export function buildBody(required: IDataObject, collection: IDataObject = {}): IDataObject {
	return { ...cleanBody(collection), ...cleanBody(required) };
}

/** Turns a comma separated string or an array into a clean string array. */
export function toStringArray(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((entry) => String(entry).trim()).filter((entry) => entry !== '');
	}
	if (typeof value === 'string') {
		return value
			.split(',')
			.map((entry) => entry.trim())
			.filter((entry) => entry !== '');
	}
	return [];
}

/**
 * Collects the shared OData query options ($orderby / $select) plus any extra
 * filter fields into a single query string object.
 */
export function buildListQuery(
	ctx: IExecuteFunctions,
	i: number,
	extraFilterParam = 'filters',
): IDataObject {
	const filters = ctx.getNodeParameter(extraFilterParam, i, {}) as IDataObject;
	const options = ctx.getNodeParameter('options', i, {}) as IDataObject;
	return cleanBody({ ...filters, ...options });
}

/** Parses a JSON parameter and reports a helpful error when it is malformed. */
export function parseJsonParameter(
	ctx: IExecuteFunctions,
	value: unknown,
	i: number,
	label: string,
): IDataObject {
	if (value === undefined || value === null || value === '') return {};
	if (typeof value === 'object') return value as IDataObject;
	try {
		return JSON.parse(String(value)) as IDataObject;
	} catch {
		throw new NodeOperationError(ctx.getNode(), `${label} must be valid JSON`, { itemIndex: i });
	}
}

/** Path segments are user supplied (phone numbers, e-mails, names) - always escape. */
export function seg(value: string | number): string {
	return encodeURIComponent(String(value));
}
