import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BranddevApi implements ICredentialType {
	name = 'branddevApi';

	displayName = 'Brand.dev API';

	documentationUrl = 'https://docs.brand.dev/quickstart';

	icon = 'file:branddev.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			placeholder: 'sk_live_...',
			description: 'API key from your Brand.dev account',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.brand.dev/v1',
			url: '/brand/retrieve',
			qs: {
				domain: 'brand.dev',
			},
		},
	};
}
