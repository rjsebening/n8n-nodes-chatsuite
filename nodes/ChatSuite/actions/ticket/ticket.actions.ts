import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetMany, csRequest, unwrapList } from '../../helpers/apiclient';
import { buildBody, buildListQuery, cleanBody, getRlRequired, seg } from '../../helpers/params';

const BASE = '/api/v1/ticket';

export async function handleTicket(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const needsTicket = [
		'get',
		'update',
		'getHistory',
		'getMessages',
		'getNotes',
		'createNote',
	].includes(operation);
	const ticketNumber = needsTicket ? getRlRequired(this, 'ticketNumber', i, 'Ticket') : '';

	switch (operation) {
		case 'getAll':
			return await csGetMany<IDataObject>(this, i, BASE, buildListQuery(this, i));

		case 'get':
			return await csRequest<IDataObject>(this, 'GET', `${BASE}/${seg(ticketNumber)}`);

		case 'getStates':
			return unwrapList<IDataObject>(await csRequest(this, 'GET', `${BASE}/states`));

		case 'getHistory':
			return unwrapList<IDataObject>(
				await csRequest(this, 'GET', `${BASE}/${seg(ticketNumber)}/history`),
			);

		case 'getMessages':
			return await csGetMany<IDataObject>(
				this,
				i,
				`${BASE}/${seg(ticketNumber)}/messages`,
				buildListQuery(this, i),
			);

		case 'getNotes':
			return unwrapList<IDataObject>(
				await csRequest(this, 'GET', `${BASE}/${seg(ticketNumber)}/notes`),
			);

		case 'create': {
			const body = buildBody(
				{
					customerPhoneNumber: this.getNodeParameter('customerPhoneNumber', i) as string,
					message: this.getNodeParameter('message', i) as string,
				},
				this.getNodeParameter('additionalFields', i, {}) as IDataObject,
			);
			return await csRequest<IDataObject>(this, 'POST', BASE, { body });
		}

		case 'update': {
			const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
			// `stateName` and `isClosed` are mutually exclusive in the API
			if (updateFields.stateName && updateFields.isClosed !== undefined) {
				throw new NodeOperationError(
					this.getNode(),
					'State Name and Is Closed cannot be used together - pick one',
					{ itemIndex: i },
				);
			}

			const body = cleanBody(updateFields);
			// Booleans must survive even when false
			for (const key of ['isClosed', 'isPriority']) {
				if (updateFields[key] !== undefined) body[key] = updateFields[key];
			}
			// An explicitly empty category or assignee clears the field
			for (const key of ['categoryName', 'assignedToEmail']) {
				if (updateFields[key] === '') body[key] = '';
			}

			return await csRequest<IDataObject>(this, 'PATCH', `${BASE}/${seg(ticketNumber)}`, { body });
		}

		case 'createNote': {
			const body = buildBody(
				{ content: this.getNodeParameter('content', i) as string },
				{ authorName: this.getNodeParameter('authorName', i, '') as string },
			);
			return await csRequest<IDataObject>(this, 'POST', `${BASE}/${seg(ticketNumber)}/notes`, {
				body,
			});
		}

		default:
			throw new NodeOperationError(this.getNode(), `Unsupported ticket operation: ${operation}`, {
				itemIndex: i,
			});
	}
}
