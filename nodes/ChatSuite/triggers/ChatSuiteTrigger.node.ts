import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { csRequest, unwrapList } from '../helpers/apiclient';
import { seg } from '../helpers/params';
import { getWebhookEvents, getWhatsappChannels } from '../methods/loadOptions';
import { triggerProperties } from './trigger.properties';

type TriggerStaticData = {
	webhookId?: string;
};

type ApiErrorLike = {
	httpCode?: string | number;
	response?: { statusCode?: number };
};

type WebhookSubscription = IDataObject & {
	id?: string;
	url?: string | null;
	events?: string[] | null;
	description?: string | null;
};

function isNotFoundError(error: unknown): boolean {
	const apiError = error as ApiErrorLike;
	return apiError.httpCode === '404' || apiError.response?.statusCode === 404;
}

/** Same set of events, order independent */
function sameEvents(a: string[] = [], b: string[] = []): boolean {
	if (a.length !== b.length) return false;
	const left = [...a].sort();
	const right = [...b].sort();
	return left.every((event, index) => event === right[index]);
}

function selectedEvents(ctx: IHookFunctions): string[] {
	const events = (ctx.getNodeParameter('events', 0) as string[]) ?? [];
	if (!Array.isArray(events) || events.length === 0) {
		throw new NodeOperationError(ctx.getNode(), 'Select at least one event to subscribe to');
	}
	return events.map((event) => String(event));
}

function subscriptionBody(ctx: IHookFunctions, url: string): IDataObject {
	const description = (ctx.getNodeParameter('description', '') as string).trim();
	return {
		url,
		events: selectedEvents(ctx),
		...(description ? { description } : {}),
	};
}

/**
 * Digits of a phone number without its trunk or international prefix, so
 * "+49 151 1234", "0049 151 1234" and "0151 1234" all compare equal.
 */
function phoneDigits(value: string): string {
	return value.replace(/\D/g, '').replace(/^00/, '').replace(/^0/, '');
}

/** Shortest suffix length that still makes a phone comparison meaningful */
const MIN_PHONE_MATCH = 6;

function samePhone(a: string, b: string): boolean {
	const left = phoneDigits(a);
	const right = phoneDigits(b);
	if (left.length < MIN_PHONE_MATCH || right.length < MIN_PHONE_MATCH) return false;
	return left.endsWith(right) || right.endsWith(left);
}

/**
 * Reads a value from the event payload, checking both the top level and the
 * common nested containers ChatSuite uses (message, customer, group, channel).
 */
function payloadValue(payload: IDataObject, keys: string[]): string {
	const containers: IDataObject[] = [payload];
	for (const key of ['data', 'message', 'customer', 'group', 'whatsAppChannel', 'channel']) {
		const nested = payload[key];
		if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
			containers.push(nested as IDataObject);
		}
	}

	for (const container of containers) {
		for (const key of keys) {
			const value = container[key];
			if (value !== undefined && value !== null && String(value) !== '') return String(value);
		}
	}
	return '';
}

export class ChatSuiteTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ChatSuite Trigger',
		name: 'chatSuiteTrigger',
		icon: {
			light: 'file:../chatsuite-light-icon.svg',
			dark: 'file:../chatsuite-dark-icon.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"]}}',
		description: 'Starts a workflow when ChatSuite sends a webhook event (powered by joergsebening.de)',
		defaults: {
			name: 'ChatSuite Trigger',
			// @ts-expect-error free-form description
			description: 'Starts a workflow when ChatSuite sends a webhook event (powered by joergsebening.de)',
		},
		credentials: [{ name: 'chatSuiteApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				isFullPath: true,
				path: '',
			},
		],
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		properties: triggerProperties,
	};

	methods = {
		loadOptions: {
			getWebhookEvents,
			getWhatsappChannels,
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node') as TriggerStaticData;
				const id = webhookData.webhookId;
				if (!id) return false;

				const currentUrl = this.getNodeWebhookUrl('default');

				let subscriptions: WebhookSubscription[];
				try {
					// The API has no GET /webhook/{id}, so the list is the only lookup
					subscriptions = unwrapList<WebhookSubscription>(
						await csRequest(this, 'GET', '/api/v1/webhook'),
					);
				} catch (error) {
					if (isNotFoundError(error)) {
						delete webhookData.webhookId;
						return false;
					}
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: 'Failed to verify the existing ChatSuite webhook subscription',
					});
				}

				const remote = subscriptions.find((entry) => entry.id === id);
				if (!remote) {
					delete webhookData.webhookId;
					return false;
				}

				// Repair a drifted subscription instead of recreating it: the
				// subscription id stays stable and no orphan is left behind in
				// ChatSuite when the webhook URL changes.
				const events = selectedEvents(this);
				const urlDrifted = Boolean(currentUrl) && remote.url !== currentUrl;
				if (urlDrifted || !sameEvents(remote.events ?? [], events)) {
					try {
						await csRequest(this, 'PUT', `/api/v1/webhook/${seg(id)}`, {
							body: subscriptionBody(this, currentUrl as string),
						});
					} catch (error) {
						if (isNotFoundError(error)) {
							delete webhookData.webhookId;
							return false;
						}
						throw new NodeApiError(this.getNode(), error as JsonObject, {
							message: 'Failed to update the existing ChatSuite webhook subscription',
						});
					}
				}

				return true;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl) {
					throw new NodeOperationError(this.getNode(), 'Webhook URL could not be determined');
				}

				let response: WebhookSubscription | undefined;
				try {
					response = await csRequest<WebhookSubscription>(this, 'POST', '/api/v1/webhook', {
						body: subscriptionBody(this, webhookUrl),
					});
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: 'Failed to create the ChatSuite webhook subscription',
					});
				}

				if (!response?.id) {
					throw new NodeOperationError(
						this.getNode(),
						'ChatSuite did not return a webhook ID for the new subscription',
						{ description: JSON.stringify(response ?? {}) },
					);
				}

				const webhookData = this.getWorkflowStaticData('node') as TriggerStaticData;
				webhookData.webhookId = response.id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node') as TriggerStaticData;
				const id = webhookData.webhookId;
				if (!id) return true;

				try {
					await csRequest(this, 'DELETE', `/api/v1/webhook/${seg(id)}`);
				} catch (error) {
					if (!isNotFoundError(error)) {
						// Clear the local state before throwing so reactivation always works
						delete webhookData.webhookId;
						throw new NodeApiError(this.getNode(), error as JsonObject, {
							message: 'Failed to delete the ChatSuite webhook subscription',
						});
					}
				}

				delete webhookData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject | IDataObject[];
		const options = this.getNodeParameter('options', {}) as IDataObject;

		const rawPayload = options.rawPayload === true;
		const events: IDataObject[] = rawPayload
			? [body as IDataObject]
			: Array.isArray(body)
				? (body as IDataObject[])
				: [body];

		// ChatSuite offers no server-side filters, so narrow the delivered events here
		const wantedChannel = String(options.kanalName ?? '')
			.trim()
			.toLowerCase();
		const wantedPhone = String(options.customerPhoneNumber ?? '').trim();

		const matching = events.filter((event) => {
			if (wantedChannel) {
				const channel = payloadValue(event, ['kanalName', 'channelName', 'whatsAppChannelName']);
				if (channel.toLowerCase() !== wantedChannel) return false;
			}
			if (wantedPhone) {
				const phone = payloadValue(event, [
					'phoneNumber',
					'customerPhoneNumber',
					'fromPhoneNumber',
				]);
				if (!samePhone(phone, wantedPhone)) return false;
			}
			return true;
		});

		if (matching.length === 0) {
			// Acknowledge the delivery, but start no workflow run
			return { webhookResponse: { body: { ok: true }, responseCode: 200 } };
		}

		return {
			webhookResponse: { body: { ok: true }, responseCode: 200 },
			workflowData: [this.helpers.returnJsonArray(matching)],
		};
	}
}
