import type { INodeProperties } from 'n8n-workflow';

const showOnlyForNaics = {
	resource: ['naics'],
};

export const naicsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForNaics,
		},
		options: [
			{
				name: 'Classify Brand',
				value: 'classify',
				action: 'Retrieve NAICS code for any brand',
				description: 'Classify any brand into a 2022 NAICS code. <a href="https://docs.brand.dev/api-reference/industry-classification/retrieve-naics-code-for-any-brand" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/naics',
					},
				},
			},
		],
		default: 'classify',
	},
	{
		displayName: 'Input',
		name: 'input',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForNaics,
				operation: ['classify'],
			},
		},
		default: '',
		placeholder: 'example.com or Apple Inc',
		description: 'Brand domain or company name to classify. If a valid domain is provided, it will be used; otherwise, we will search for the brand using the provided title.',
		routing: {
			request: {
				qs: {
					input: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForNaics,
				operation: ['classify'],
			},
		},
		options: [
			{
				displayName: 'Min Results',
				name: 'minResults',
				type: 'number',
				default: 1,
				description: 'Minimum number of NAICS codes to return (1-10)',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				routing: {
					request: {
						qs: {
							minResults: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				default: 5,
				description: 'Maximum number of NAICS codes to return (1-10)',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				routing: {
					request: {
						qs: {
							maxResults: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				description: 'Timeout in milliseconds for the request (1-300000ms)',
				typeOptions: {
					minValue: 1,
					maxValue: 300000,
				},
				routing: {
					request: {
						qs: {
							timeoutMS: '={{ $value }}',
						},
					},
				},
			},
		],
	},
];
