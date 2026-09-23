import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest } from '../../helpers/apiclient';
import { getBase64File } from '../../helpers/binary';
import { buildListQuery, cleanBody, getRlRequired, seg, toStringArray } from '../../helpers/params';

const BASE = '/api/v1/message';
const MAX_FILES = 10;

/** Pulls the Idempotency-Key out of an options collection into a header object */
function idempotencyHeaders(options: IDataObject): Record<string, string> {
	const key = String(options.idempotencyKey ?? '').trim();
	return key ? { 'Idempotency-Key': key } : {};
}

export async function handleMessage(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	switch (operation) {
		case 'send': {
			const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
			const message = (this.getNodeParameter('message', i, '') as string) ?? '';
			const attachFiles = this.getNodeParameter('attachFiles', i, false) as boolean;
			const options = this.getNodeParameter('sendOptions', i, {}) as IDataObject;

			const body: IDataObject = { phoneNumber, ...cleanBody(options) };
			if (options.isDirectChat !== undefined) body.isDirectChat = options.isDirectChat;
			if (message) body.message = message;

			if (attachFiles) {
				const names = toStringArray(this.getNodeParameter('binaryPropertyNames', i, 'data'));
				if (names.length === 0) {
					throw new NodeOperationError(
						this.getNode(),
						'Name at least one input binary field to attach',
						{ itemIndex: i },
					);
				}
				if (names.length > MAX_FILES) {
					throw new NodeOperationError(
						this.getNode(),
						`A message carries at most ${MAX_FILES} files, ${names.length} were given`,
						{ itemIndex: i },
					);
				}
				body.files = await Promise.all(names.map((name) => getBase64File(this, i, name)));
			} else if (!message) {
				throw new NodeOperationError(
					this.getNode(),
					'Provide a message text, or enable Attach Files and name a binary field',
					{ itemIndex: i },
				);
			}

			return await csRequest<IDataObject>(this, 'POST', BASE, { body });
		}

		case 'sendToCustomerGroups': {
			const options = this.getNodeParameter('groupSendOptions', i, {}) as IDataObject;
			const body: IDataObject = {
				phoneNumber: getRlRequired(this, 'phoneNumber', i, 'Customer'),
				message: this.getNodeParameter('message', i, '') as string,
				groupCategoryNames: toStringArray(this.getNodeParameter('groupCategoryNames', i, [])),
			};
			if (options.replyToMessageId) body.replyToMessageId = options.replyToMessageId;

			return await csRequest<IDataObject>(this, 'POST', `${BASE}/customer-groups`, {
				body,
				headers: idempotencyHeaders(options),
			});
		}

		case 'sendToGroup': {
			const groupId = (this.getNodeParameter('groupId', i, '') as string).trim();
			const groupName = (this.getNodeParameter('groupName', i, '') as string).trim();
			if (!groupId && !groupName) {
				throw new NodeOperationError(
					this.getNode(),
					'Provide either a Group ID or a Group Name to address the WhatsApp group',
					{ itemIndex: i },
				);
			}

			const options = this.getNodeParameter('groupSendOptions', i, {}) as IDataObject;
			const body = cleanBody({
				kanalName: this.getNodeParameter('kanalName', i) as string,
				groupId,
				groupName,
				message: this.getNodeParameter('message', i, '') as string,
				replyToMessageId: options.replyToMessageId,
			});

			return await csRequest<IDataObject>(this, 'POST', `${BASE}/group`, {
				body,
				headers: idempotencyHeaders(options),
			});
		}

		case 'get': {
			const messageId = this.getNodeParameter('messageId', i) as string;
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(messageId)}`);
		}

		case 'getHistory': {
			const phoneNumber = getRlRequired(this, 'phoneNumber', i, 'Customer');
			return await csGetMany<IDataObject>(
				this,
				i,
				`${BASE}/history/${seg(phoneNumber)}`,
				buildListQuery(this, i),
			);
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unsupported message operation: ${operation}`, {
				itemIndex: i,
			});
	}
}
