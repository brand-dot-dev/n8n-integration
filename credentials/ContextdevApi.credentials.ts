import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ContextdevApi implements ICredentialType {
	name = 'contextdevApi';
	displayName = 'Context.dev API';
	documentationUrl = 'https://docs.context.dev/guides/get-started/quickstart';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				integration_name: 'n8n',
			},
		},
	};
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.context.dev/v1',
			url: '/brand/retrieve',
			qs: { domain: 'context.dev' },
		},
	};
}
