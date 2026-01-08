import type { INodeProperties } from 'n8n-workflow';

const showOnlyForProduct = {
	resource: ['aiDataExtraction'],
};

export const productDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForProduct,
		},
		options: [
			{
				name: 'Extract Products From a Brand\'s Website',
				value: 'extractFromWebsite',
				action: "Extract products from a brand's website",
				description: 'Extract product information from a brand\'s website including name, description, pricing, and more. <a href="https://docs.brand.dev/api-reference/ai-data-extraction/extract-products-from-a-brands-website" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'POST',
						url: '/brand/ai/products',
					},
				},
			},
		],
		default: 'extractFromWebsite',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForProduct,
				operation: ['extractFromWebsite'],
			},
		},
		default: '',
		placeholder: 'example.com',
		description: 'The domain name to analyze for product extraction',
		routing: {
			request: {
				body: {
					domain: '={{ $value }}',
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
				...showOnlyForProduct,
				operation: ['extractFromWebsite'],
			},
		},
		options: [
			{
				displayName: 'Max Products',
				name: 'maxProducts',
				type: 'number',
				default: 5,
				description: 'Maximum number of products to extract (1-12)',
				typeOptions: {
					minValue: 1,
					maxValue: 12,
				},
				routing: {
					request: {
						body: {
							maxProducts: '={{ $value }}',
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
						body: {
							timeoutMS: '={{ $value }}',
						},
					},
				},
			},
		],
	},
];
