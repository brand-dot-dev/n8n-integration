import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BranddevApi implements ICredentialType {
	name = 'branddevApi';

	displayName = 'Context.dev API';

	documentationUrl = 'https://docs.context.dev/quickstart';

	icon = 'file:branddev.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			placeholder: 'ctxt_secret_...',
			description: 'API key from your Context.dev account',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
				integration_name: 'n8n',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.context.dev/v1',
			url: '/monitors/limits',
		},
	};
}
