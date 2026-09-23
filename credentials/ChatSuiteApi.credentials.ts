import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class ChatSuiteApi implements ICredentialType {
	name = 'chatSuiteApi';

	displayName = 'ChatSuite API';

	documentationUrl = 'https://github.com/rjsebening/n8n-nodes-chatsuite/blob/main/CREDENTIALS.md';

	icon: Icon = {
		light: 'file:chatsuite-light-icon.svg',
		dark: 'file:chatsuite-dark-icon.svg',
	};

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.chatsuite.com',
			placeholder: 'https://api.chatsuite.com',
			description: 'Base URL of the ChatSuite Tenant API, without the /api/v1 path',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'Tenant API key created in ChatSuite under Settings > API',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				"={{String($credentials.baseUrl).replace(/\\/+$/, '').replace(/\\/api(\\/v\\d+)?$/i, '')}}",
			url: '/api/v1/webhook/event',
			method: 'GET',
		},
	};
}
