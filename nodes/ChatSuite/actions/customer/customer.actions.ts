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
	seg,
	toStringArray,
} from '../../helpers/params';

/** Normalizes the shared customer field collection into an API request body */
function customerBody(fields: IDataObject): IDataObject {
	const body = cleanBody(fields);
	if (fields.emails !== undefined) {
		body.emails = toStringArray(fields.emails);
	}
	if (fields.categoryNames !== undefined) {
		body.categoryNames = toStringArray(fields.categoryNames);
	}
	// `isActive: false` is meaningful and must survive cleanBody
	if (fields.isActive !== undefined) {
		body.isActive = fields.isActive;
	}
	return body;
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
			if (teamMemberMode && teamMemberMode !== 'none') {
				const teamMembers: IDataObject = { mode: teamMemberMode };
				if (teamMemberMode === 'specific') {
					const names = toStringArray(options.teamMemberNames);
					if (names.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'Team Member Names is required when the team member mode is "Specific"',
							{ itemIndex: i },
						);
					}
					teamMembers.names = names;
				}
				body.teamMembers = teamMembers;
			}

			return await csRequest<IDataObject>(
				this,
				'POST',
				`/api/v1/customer/${seg(phoneNumber)}/whatsapp-onboarding`,
				{ body },
			);
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
