import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
} from 'n8n-workflow';

export const CREDENTIALS_NAME = 'chatSuiteApi';

/** Every n8n context that is allowed to talk to the ChatSuite API */
export type ApiContext =
	| IExecuteFunctions
	| ILoadOptionsFunctions
	| IHookFunctions
	| IWebhookFunctions;

export interface RequestOptions {
	qs?: IDataObject;
	body?: IDataObject | IDataObject[] | string;
	json?: boolean;
	headers?: Record<string, string>;
}

/** Shape of the paged envelope the API returns for OData-style list endpoints */
export interface ListPage {
	limit?: number;
	nextSkipToken?: string | null;
	hasMore?: boolean;
}

export interface ListResponse<T = IDataObject> {
	data?: T[] | null;
	page?: ListPage;
}

type RequestWithAuthentication = (
	credentialType: string,
	requestOptions: IHttpRequestOptions,
) => Promise<unknown>;

function hasRequestWithAuthentication(ctx: ApiContext): ctx is ApiContext & {
	helpers: { httpRequestWithAuthentication: RequestWithAuthentication };
} {
	return typeof ctx.helpers?.httpRequestWithAuthentication === 'function';
}

/** Strips trailing slashes and an accidentally pasted /api or /api/v1 suffix */
export function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl
		.trim()
		.replace(/\/+$/, '')
		.replace(/\/api(\/v\d+)?$/i, '');
}

/** All spec paths start with /api/v1; accept both with and without that prefix */
export function normalizePath(path: string): string {
	const normalizedPath = path.trim();
	if (!normalizedPath.startsWith('/')) {
		throw new Error(
			`ChatSuite API path must start with a slash, for example /api/v1/customer. Received: ${path}`,
		);
	}
	if (/^\/api\/v\d+(\/|$)/i.test(normalizedPath)) {
		return normalizedPath;
	}
	if (/^\/v\d+(\/|$)/i.test(normalizedPath)) {
		return `/api${normalizedPath}`;
	}
	return `/api/v1${normalizedPath}`;
}

/** Drops empty query values so optional filters never reach the API as `?x=` */
function cleanQuery(qs: IDataObject): IDataObject {
	const filtered: IDataObject = {};
	for (const [key, value] of Object.entries(qs)) {
		if (value === undefined || value === null || value === '') continue;
		if (Array.isArray(value) && value.length === 0) continue;
		filtered[key] = value;
	}
	return filtered;
}

async function buildOptions(
	ctx: ApiContext,
	method: IHttpRequestMethods,
	path: string,
	opts: RequestOptions,
): Promise<IHttpRequestOptions> {
	const credentials = await ctx.getCredentials(CREDENTIALS_NAME);
	const baseUrl = normalizeBaseUrl(String(credentials.baseUrl ?? ''));
	if (!baseUrl) {
		throw new Error('No ChatSuite API base URL configured in the credentials');
	}

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}${normalizePath(path)}`,
		json: opts.json ?? typeof opts.body !== 'string',
	};

	if (opts.headers) {
		options.headers = { ...opts.headers };
	}

	if (opts.qs) {
		const filtered = cleanQuery(opts.qs);
		if (Object.keys(filtered).length) options.qs = filtered;
	}

	if (opts.body !== undefined) {
		options.body = opts.body;
	}

	return options;
}

export async function csRequest<T = unknown>(
	ctx: ApiContext,
	method: IHttpRequestMethods,
	path: string,
	opts: RequestOptions = {},
): Promise<T> {
	const options = await buildOptions(ctx, method, path, opts);

	if (!hasRequestWithAuthentication(ctx)) {
		throw new Error('No HTTP helper available');
	}

	return (await ctx.helpers.httpRequestWithAuthentication.call(
		ctx,
		CREDENTIALS_NAME,
		options,
	)) as T;
}

/** Raw binary download - returns the body buffer plus the response headers */
export async function csRequestBinary(
	ctx: ApiContext,
	path: string,
	opts: RequestOptions = {},
): Promise<{ body: Buffer; headers: IDataObject }> {
	const options = await buildOptions(ctx, 'GET', path, { ...opts, json: false });
	options.encoding = 'arraybuffer';
	options.returnFullResponse = true;

	if (!hasRequestWithAuthentication(ctx)) {
		throw new Error('No HTTP helper available');
	}

	const response = (await ctx.helpers.httpRequestWithAuthentication.call(
		ctx,
		CREDENTIALS_NAME,
		options,
	)) as { body: ArrayBuffer | Buffer; headers?: IDataObject };

	if (response.body === undefined || response.body === null) {
		throw new Error(`The ChatSuite API returned no file content for ${path}`);
	}

	const body = Buffer.isBuffer(response.body)
		? response.body
		: Buffer.from(response.body as ArrayBuffer);

	return { body, headers: response.headers ?? {} };
}

/** multipart/form-data upload. `formData` carries n8n's form-data payload shape. */
export async function csRequestMultipart<T = unknown>(
	ctx: ApiContext,
	method: IHttpRequestMethods,
	path: string,
	formData: IDataObject,
	opts: RequestOptions = {},
): Promise<T> {
	const options = await buildOptions(ctx, method, path, { ...opts, json: false });
	options.body = formData;
	options.headers = { ...(options.headers ?? {}), 'Content-Type': 'multipart/form-data' };
	options.json = false;

	if (!hasRequestWithAuthentication(ctx)) {
		throw new Error('No HTTP helper available');
	}

	const result = await ctx.helpers.httpRequestWithAuthentication.call(
		ctx,
		CREDENTIALS_NAME,
		options,
	);

	// The API answers multipart uploads with JSON, but without `json: true` it
	// arrives as a string - parse it back so handlers always see an object.
	if (typeof result === 'string') {
		try {
			return JSON.parse(result) as T;
		} catch {
			return result as unknown as T;
		}
	}
	return result as T;
}

/** Unwraps both the `{ data, page }` envelope and bare-array responses */
export function unwrapList<T = IDataObject>(response: unknown): T[] {
	if (Array.isArray(response)) return response as T[];
	if (response && typeof response === 'object') {
		const data = (response as ListResponse<T>).data;
		if (Array.isArray(data)) return data;
	}
	return response ? [response as T] : [];
}

/**
 * The event list endpoint is declared as text/plain as well as JSON, so the
 * response may arrive as a JSON string instead of a parsed array.
 */
export async function csGetWebhookEvents(ctx: ApiContext): Promise<string[]> {
	const response = await csRequest<string[] | string>(ctx, 'GET', '/api/v1/webhook/event');

	if (Array.isArray(response)) return response.map((event) => String(event));
	if (typeof response === 'string') {
		try {
			const parsed = JSON.parse(response) as unknown;
			if (Array.isArray(parsed)) return parsed.map((event) => String(event));
		} catch {
			// fall through to the empty list below
		}
	}
	return [];
}

const PAGE_SIZE = 100;
const MAX_PAGES = 500;

/**
 * Walks an OData-style list endpoint via `$skiptoken` until the API reports no
 * more pages. Endpoints that answer with a bare array have no paging at all, so
 * the first response is returned as-is.
 */
export async function csRequestAllItems<T = IDataObject>(
	ctx: ApiContext,
	path: string,
	opts: { qs?: IDataObject; limit?: number } = {},
): Promise<T[]> {
	const all: T[] = [];
	const limit = opts.limit && opts.limit > 0 ? opts.limit : undefined;
	let skipToken: string | undefined;

	for (let page = 0; page < MAX_PAGES; page++) {
		const pageSize = limit ? Math.min(PAGE_SIZE, limit - all.length) : PAGE_SIZE;
		const response = await csRequest<ListResponse<T> | T[]>(ctx, 'GET', path, {
			qs: { ...(opts.qs ?? {}), $top: pageSize, $skiptoken: skipToken },
		});

		const rows = unwrapList<T>(response);
		all.push(...rows);

		if (limit && all.length >= limit) return all.slice(0, limit);

		// Bare arrays carry no paging envelope - one response is everything.
		if (Array.isArray(response)) break;

		const pageInfo = (response as ListResponse<T>).page;
		if (!pageInfo?.hasMore || !pageInfo.nextSkipToken) break;
		skipToken = pageInfo.nextSkipToken;
	}

	return all;
}

/**
 * Shared "Return All / Limit" reader for getAll operations: either walks every
 * page or fetches exactly the requested number of items.
 */
export async function csGetMany<T = IDataObject>(
	ctx: IExecuteFunctions,
	i: number,
	path: string,
	qs: IDataObject = {},
): Promise<T[]> {
	const returnAll = ctx.getNodeParameter('returnAll', i, false) as boolean;
	const limit = returnAll ? undefined : (ctx.getNodeParameter('limit', i, 50) as number);
	return await csRequestAllItems<T>(ctx, path, { qs, limit });
}
