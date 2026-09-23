import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { csGetWebhookEvents, csRequest, unwrapList } from '../../helpers/apiclient';
import { cleanBody, seg, toStringArray } from '../../helpers/params';

const BASE = '/api/v1/webhook';

function subscriptionBody(ctx: IExecuteFunctions, i: number): IDataObject {
	return cleanBody({
		url: ctx.getNodeParameter('url', i) as string,
		events: toStringArray(ctx.getNodeParameter('events', i, [])),
		description: ctx.getNodeParameter('description', i, '') as string,
	});
}

export async function handleWebhook(
	this: IExecuteFunctions,
	i: number,
	operation: string,
): Promise<IDataObject | IDataObject[]> {
	const webhookId = ['update', 'delete', 'test'].includes(operation)
		? (this.getNodeParameter('webhookId', i) as string)
		: '';

	switch (operation) {
		case 'getAll':
			return unwrapList<IDataObject>(await csRequest(this, 'GET', BASE));

		case 'getEvents': {
			const events = await csGetWebhookEvents(this);
			return events.map((event) => ({ event }));
		}

		case 'create':
			return await csRequest<IDataObject>(this, 'POST', BASE, {
				body: subscriptionBody(this, i),
			});

		case 'update':
			return await csRequest<IDataObject>(this, 'PUT', `${BASE}/${seg(webhookId)}`, {
				body: subscriptionBody(this, i),
			});

		case 'delete': {
			const response = await csRequest<IDataObject>(this, 'DELETE', `${BASE}/${seg(webhookId)}`);
			return response ?? { success: true, webhookId };
		}

		case 'test':
			return await csRequest<IDataObject>(this, 'POST', `${BASE}/${seg(webhookId)}/test`);

		default:
			throw new NodeOperationError(this.getNode(), `Unsupported webhook operation: ${operation}`, {
				itemIndex: i,
			});
	}
}
