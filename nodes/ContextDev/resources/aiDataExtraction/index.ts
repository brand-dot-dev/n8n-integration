import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['aiDataExtraction'] };

export const aiDataExtractionDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'AI Query',
				value: 'aiQuery',
				action: 'Query a website with AI and extract structured data',
				description:
					'Define data points to extract from any domain. <a href="https://docs.context.dev/api-reference/web-extraction/extract-structured-website-data" target="_blank">View docs</a>.',
				routing: { request: { method: 'POST', url: '/brand/ai/query' } },
			},
			{
				name: 'Extract Products',
				value: 'extractProducts',
				action: 'Extract products from a brand website',
				description:
					'Extract product catalog with name, description, pricing, features. <a href="https://docs.context.dev/api-reference/web-extraction/extract-products-from-a-brands-website" target="_blank">View docs</a>.',
				routing: { request: { method: 'POST', url: '/brand/ai/products' } },
			},
			{
				name: 'Extract Single Product',
				value: 'extractProduct',
				action: 'Extract a single product from a URL',
				description:
					'Extract product data from a specific product page. <a href="https://docs.context.dev/api-reference/web-extraction/extract-a-single-product-from-a-url" target="_blank">View docs</a>.',
				routing: { request: { method: 'POST', url: '/brand/ai/product' } },
			},
		],
		default: 'aiQuery',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: ['aiQuery', 'extractProducts'] } },
		default: '',
		placeholder: 'stripe.com',
		routing: { request: { body: { domain: '={{ $value }}' } } },
	},
	{
		displayName: 'Product URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: ['extractProduct'] } },
		default: '',
		placeholder: 'https://example.com/products/widget',
		description: 'Direct URL to the product page',
		routing: { request: { body: { url: '={{ $value }}' } } },
	},
	{
		displayName: 'Data Points to Extract',
		name: 'data_to_extract',
		type: 'fixedCollection',
		required: true,
		typeOptions: { multipleValues: true },
		displayOptions: { show: { ...show, operation: ['aiQuery'] } },
		default: {},
		description: 'Define the structured data fields you want to extract from the website',
		options: [
			{
				name: 'datapoint',
				displayName: 'Data Point',
				values: [
					{
						displayName: 'Name',
						name: 'datapoint_name',
						type: 'string',
						default: '',
						placeholder: 'company_tagline',
					},
					{
						displayName: 'Description',
						name: 'datapoint_description',
						type: 'string',
						default: '',
						placeholder: 'The main tagline shown on the homepage',
					},
					{
						displayName: 'Type',
						name: 'datapoint_type',
						type: 'options',
						default: 'text',
						options: [
							{ name: 'Text', value: 'text' },
							{ name: 'Number', value: 'number' },
							{ name: 'Date', value: 'date' },
							{ name: 'Boolean', value: 'boolean' },
							{ name: 'List', value: 'list' },
							{ name: 'URL', value: 'url' },
						],
					},
					{
						displayName: 'List Item Type',
						name: 'datapoint_list_type',
						type: 'options',
						displayOptions: { show: { datapoint_type: ['list'] } },
						default: 'string',
						options: [
							{ name: 'String', value: 'string' },
							{ name: 'Number', value: 'number' },
							{ name: 'Date', value: 'date' },
							{ name: 'Boolean', value: 'boolean' },
							{ name: 'URL', value: 'url' },
							{ name: 'Object', value: 'object' },
						],
					},
					{
						displayName: 'Example Value',
						name: 'datapoint_example',
						type: 'string',
						default: '',
						placeholder: 'The platform for modern teams',
					},
				],
			},
		],
		routing: { request: { body: { data_to_extract: '={{ $value.datapoint }}' } } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: { ...show, operation: ['aiQuery', 'extractProducts', 'extractProduct'] },
		},
		options: [
			{
				displayName: 'Max Products',
				name: 'maxProducts',
				type: 'number',
				displayOptions: { show: { '/operation': ['extractProducts'] } },
				default: 5,
				typeOptions: { minValue: 1 },
				routing: { request: { body: { maxProducts: '={{ $value }}' } } },
			},
			{
				displayName: 'Pages to Analyze',
				name: 'specific_pages',
				type: 'multiOptions',
				displayOptions: { show: { '/operation': ['aiQuery'] } },
				default: [],
				description: 'Specific pages to analyze on the website',
				options: [
					{ name: 'About Us', value: 'about_us' },
					{ name: 'Blog', value: 'blog' },
					{ name: 'Careers', value: 'careers' },
					{ name: 'Contact Us', value: 'contact_us' },
					{ name: 'FAQ', value: 'faq' },
					{ name: 'Home Page', value: 'home_page' },
					{ name: 'Pricing', value: 'pricing' },
					{ name: 'Privacy Policy', value: 'privacy_policy' },
					{ name: 'Terms & Conditions', value: 'terms_and_conditions' },
				],
				routing: {
					request: {
						body: {
							specific_pages:
								'={{ Object.fromEntries($value.map((k) => [k, true])) }}',
						},
					},
				},
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				typeOptions: { minValue: 1, maxValue: 300000 },
				routing: { request: { body: { timeoutMS: '={{ $value }}' } } },
			},
		],
	},
];
