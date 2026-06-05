import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['industry'] };

export const industryDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Classify NAICS',
				value: 'retrieveNaics',
				action: 'Classify a brand into NAICS industry codes',
				description:
					'2022 NAICS codes from domain or company name. <a href="https://docs.context.dev/api-reference/industry-classification/retrieve-naics-code-for-a-brand" target="_blank">View docs</a>.',
				routing: { request: { method: 'GET', url: '/web/naics' } },
			},
			{
				name: 'Classify SIC',
				value: 'retrieveSic',
				action: 'Classify a brand into SIC industry codes',
				description:
					'Standard Industrial Classification codes from domain or company name. <a href="https://docs.context.dev/api-reference/industry-classification/retrieve-sic-code-for-a-brand" target="_blank">View docs</a>.',
				routing: { request: { method: 'GET', url: '/web/sic' } },
			},
		],
		default: 'retrieveNaics',
	},
	{
		displayName: 'Input',
		name: 'input',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: ['retrieveNaics', 'retrieveSic'] } },
		default: '',
		placeholder: 'stripe.com or Stripe Inc',
		description: 'Domain or company name to classify',
		routing: { request: { qs: { input: '={{ $value }}' } } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...show, operation: ['retrieveNaics', 'retrieveSic'] } },
		options: [
			{
				displayName: 'Max Results',
				name: 'maxResults',
				type: 'number',
				default: 5,
				typeOptions: { minValue: 1, maxValue: 10 },
				routing: { request: { qs: { maxResults: '={{ $value }}' } } },
			},
			{
				displayName: 'Min Results',
				name: 'minResults',
				type: 'number',
				default: 1,
				typeOptions: { minValue: 1 },
				routing: { request: { qs: { minResults: '={{ $value }}' } } },
			},
			{
				displayName: 'SIC Dataset',
				name: 'type',
				type: 'options',
				displayOptions: { show: { '/operation': ['retrieveSic'] } },
				default: 'original_sic',
				options: [
					{ name: 'Original SIC (1987)', value: 'original_sic' },
					{ name: 'Latest SEC', value: 'latest_sec' },
				],
				routing: { request: { qs: { type: '={{ $value }}' } } },
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				typeOptions: { minValue: 1, maxValue: 300000 },
				routing: { request: { qs: { timeoutMS: '={{ $value }}' } } },
			},
		],
	},
];
