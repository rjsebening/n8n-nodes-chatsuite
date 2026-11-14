import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	csGetMany,
	csRequest,
	csRequestBinary,
	csRequestMultipart,
	unwrapList,
} from '../../helpers/apiclient';
import { getUploadFile, toBinaryItem } from '../../helpers/binary';
import {
	buildBody,
	buildListQuery,
	cleanBody,
	getRlRequired,
	parseJsonParameter,
	seg,
	toStringArray,
} from '../../helpers/params';

const MAX_BATCH_SIZE = 50;

/** Normalizes the shared customer field collection into an API request body */
function customerBody(fields: IDataObject): IDataObject {
	const body = cleanBody(fields);
	if (fields.emails !== undefined) {
		body.emails = toStringArray(fields.emails);
	}
	if (fields.categoryNames !== undefined) {
		body.categoryNames = toStringArray(fields.categoryNames);
	}
	// `isActive: false` and `isNewClient: false` are meaningful and must survive cleanBody
	for (const key of ['isActive', 'isNewClient']) {
		if (fields[key] !== undefined) body[key] = fields[key];
	}
	// `timeZoneId: null` lets the customer inherit the tenant time zone
	delete body.useTenantTimeZone;
	if (fields.useTenantTimeZone === true) {
		body.timeZoneId = null;
	}
	return body;
}

/** Builds `teamMembers` for the "specific" mode; names and emails may be combined */
function specificTeamMembers(
	ctx: IExecuteFunctions,
	i: number,
	fields: IDataObject,
	label: string,
): IDataObject {
	const names = toStringArray(fields.teamMemberNames);
	const emails = toStringArray(fields.teamMemberEmails);
	if (names.length === 0 && emails.length === 0) {
		throw new NodeOperationError(
			ctx.getNode(),
			`${label}: Team Member Emails or Team Member Names is required when the team member mode is "Specific"`,
			{ itemIndex: i },
		);
	}
	const teamMembers: IDataObject = { mode: 'specific' };
	if (names.length) teamMembers.names = names;
	if (emails.length) teamMembers.emails = emails;
	return teamMembers;
}

/** Maps one "Customer" entry of the batch UI to a batch position of the API */
function batchItemFromUi(
	ctx: IExecuteFunctions,
	i: number,
	entry: IDataObject,
	position: number,
): IDataObject {
	const label = `Customer ${position}`;
	const item = cleanBody({
		phone: entry.phone,
		groupName: entry.groupName,
		firstName: entry.firstName,
		lastName: entry.lastName,
		groupDescription: entry.groupDescription,
		productId: entry.productId,
	});
	if (!item.phone || !item.groupName) {
		throw new NodeOperationError(ctx.getNode(), `${label}: Phone and Group Name are required`, {
			itemIndex: i,
		});
	}
	item.useDefaultGroupPicture = entry.useDefaultGroupPicture ?? true;
	item.inviteBySms = entry.inviteBySms ?? false;

	const teamMemberMode = (entry.teamMemberMode as string) || 'all';
	if (teamMemberMode === 'specific') {
		item.teamMembers = specificTeamMembers(ctx, i, entry, label);
	} else {
		item.addAllTeamMembers = teamMemberMode === 'all';
	}
	return item;
}

function batchItems(ctx: IExecuteFunctions, i: number): IDataObject[] {
	const inputMode = ctx.getNodeParameter('batchInputMode', i) as string;

	let items: IDataObject[];
	if (inputMode === 'json') {
		const raw = ctx.getNodeParameter('batchCustomersJson', i);
		const parsed: unknown =
			typeof raw === 'string' ? parseJsonParameter(ctx, raw, i, 'Customers (JSON)') : raw;
		if (!Array.isArray(parsed)) {
			throw new NodeOperationError(ctx.getNode(), 'Customers (JSON) must be a JSON array', {
				itemIndex: i,
			});
		}
		items = parsed as IDataObject[];
	} else {
		const collection = ctx.getNodeParameter('batchCustomers', i, {}) as {
			customer?: IDataObject[];
		};
		items = (collection.customer ?? []).map((entry, index) =>
			batchItemFromUi(ctx, i, entry, index + 1),
		);
	}

	if (items.length === 0 || items.length > MAX_BATCH_SIZE) {
		throw new NodeOperationError(
			ctx.getNode(),
			`A batch needs between 1 and ${MAX_BATCH_SIZE} customers, got ${items.length}`,
			{ itemIndex: i },
		);
	}
	return items;
}

export async function handleCustomer(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[] | INodeExecutionData> {
	switch (operation) {
		case 'getAll': {
			return await csGetMany<IDataObject>(this, i, '/api/v1/customer', buildListQuery(this, i));
		}

		case 'get': {
			const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
			return await csRequest<IDataObject>(this, 'GET', `/api/v1/customer/${seg(phoneNumber)}`);
		}

		case 'getByEmail': {
			const email = this.getNodeParameter('email', i) as string;
			const response = await csRequest(this, 'GET', '/api/v1/customer/by-email', {
				qs: { email },
			});
			return unwrapList<IDataObject>(response);
		}

		case 'create': {
			const phoneNumber = this.getNodeParameter('newPhoneNumber', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
			const body = buildBody({ phoneNumber }, customerBody(additionalFields));
			return await csRequest<IDataObject>(this, 'POST', '/api/v1/customer', { body });
		}

		case 'update': {
			const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
			const newPhoneNumber = (this.getNodeParameter('newPhoneNumber', i, '') as string).trim();
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
			const body = buildBody(
				{ phoneNumber: newPhoneNumber || phoneNumber },
				customerBody(updateFields),
			);
			return await csRequest<IDataObject>(this, 'PUT', `/api/v1/customer/${seg(phoneNumber)}`, {
				body,
			});
		}

		case 'patch': {
			const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
			const newPhoneNumber = (this.getNodeParameter('patchPhoneNumber', i, '') as string).trim();
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
			const body = customerBody(updateFields);
			if (newPhoneNumber) body.phoneNumber = newPhoneNumber;
			return await csRequest<IDataObject>(this, 'PATCH', `/api/v1/customer/${seg(phoneNumber)}`, {
				body,
			});
		}

		case 'delete': {
			const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
			const response = await csRequest<IDataObject>(
				this,
				'DELETE',
				`/api/v1/customer/${seg(phoneNumber)}`,
			);
			return response ?? { success: true, phoneNumber };
		}

		case 'whatsappOnboarding': {
			const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
			const mode = this.getNodeParameter('mode', i) as string;
			const groupName = this.getNodeParameter('groupName', i) as string;
			const options = this.getNodeParameter('onboardingOptions', i, {}) as IDataObject;

			const body: IDataObject = { mode, groupName };
			if (options.whatsAppConnectionName) {
				body.whatsAppConnectionName = options.whatsAppConnectionName;
			}

			const teamMemberMode = (options.teamMemberMode as string) ?? '';
			if (teamMemberMode === 'specific') {
				body.teamMembers = specificTeamMembers(this, i, options, 'Onboarding Options');
			} else if (teamMemberMode === 'all') {
				body.teamMembers = { mode: 'all' };
			}

			return await csRequest<IDataObject>(
				this,
				'POST',
				`/api/v1/customer/${seg(phoneNumber)}/whatsapp-onboarding`,
				{ body },
			);
		}

		case 'batchOnboarding': {
			const whatsAppChannelId = (this.getNodeParameter('whatsAppChannelId', i) as string).trim();
			const idempotencyKey = (this.getNodeParameter('idempotencyKey', i) as string).trim();
			if (!idempotencyKey) {
				throw new NodeOperationError(this.getNode(), 'Idempotency Key is required', {
					itemIndex: i,
				});
			}
			return await csRequest<IDataObject>(this, 'POST', '/api/v1/customer-onboarding', {
				body: { whatsAppChannelId, items: batchItems(this, i) },
				headers: { 'Idempotency-Key': idempotencyKey },
			});
		}

		case 'export': {
			const download = await csRequestBinary(this, '/api/v1/customer/export');
			return await toBinaryItem(this, i, download, 'customers.csv');
		}

		case 'import': {
			const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
			const file = await getUploadFile(this, i, binaryPropertyName, 'customers.csv');
			return await csRequestMultipart<IDataObject>(this, 'POST', '/api/v1/customer/import', {
				CsvFile: file,
			});
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unsupported customer operation: ${operation}`, {
				itemIndex: i,
			});
	}
}
