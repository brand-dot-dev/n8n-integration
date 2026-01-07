import type { INodeProperties } from 'n8n-workflow';

const showOnlyForScreenshot = {
	resource: ['screenshotStyleguide'],
};

export const screenshotStyleguideDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForScreenshot,
		},
		options: [
			{
				name: 'Take Screenshot',
				value: 'capture',
				action: 'Take screenshot of website',
				description: 'Capture a screenshot of a website (viewport or full page). <a href="https://docs.brand.dev/api-reference/screenshot-styleguide/take-screenshot-of-website" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/screenshot',
					},
				},
			},
			{
				name: 'Extract Styleguide',
				value: 'extractStyleguide',
				action: 'Extract design system and styleguide from website',
				description: 'Extract comprehensive design system including colors, typography, spacing, shadows, and components. <a href="https://docs.brand.dev/api-reference/screenshot-styleguide/extract-design-system-and-styleguide-from-website" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/styleguide',
					},
				},
			},
			{
				name: 'Extract Fonts',
				value: 'extractFonts',
				action: 'Extract font information from website',
				description: 'Extract font information including font families, usage statistics, fallbacks, and element/word counts. <a href="https://docs.brand.dev/api-reference/screenshot-styleguide/extract-fonts-from-website" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/fonts',
					},
				},
			},
		],
		default: 'capture',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForScreenshot,
				operation: ['capture', 'extractStyleguide', 'extractFonts'],
			},
		},
		default: '',
		placeholder: 'example.com',
		description: 'Domain name to take screenshot of or extract styleguide from',
		routing: {
			request: {
				qs: {
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
				...showOnlyForScreenshot,
				operation: ['capture'],
			},
		},
		options: [
			{
				displayName: 'Full Screenshot',
				name: 'fullScreenshot',
				type: 'boolean',
				default: false,
				description: 'Whether to take a full page screenshot. If false, takes a viewport screenshot (standard browser view).',
				routing: {
					request: {
						qs: {
							fullScreenshot: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Page Type',
				name: 'page',
				type: 'options',
				default: 'login',
				description: 'Specific page type to screenshot. System will find the most appropriate URL for this page type.',
				options: [
					{ name: 'Blog', value: 'blog' },
					{ name: 'Careers', value: 'careers' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Login', value: 'login' },
					{ name: 'Pricing', value: 'pricing' },
					{ name: 'Privacy', value: 'privacy' },
					{ name: 'Signup', value: 'signup' },
					{ name: 'Terms', value: 'terms' },
				],
				routing: {
					request: {
						qs: {
							page: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Prioritize',
				name: 'prioritize',
				type: 'options',
				default: 'quality',
				description: 'Screenshot capture priority',
				options: [
					{ name: 'Speed', value: 'speed' },
					{ name: 'Quality', value: 'quality' },
				],
				routing: {
					request: {
						qs: {
							prioritize: '={{ $value }}',
						},
					},
				},
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForScreenshot,
				operation: ['extractStyleguide'],
			},
		},
		options: [
			{
				displayName: 'Prioritize',
				name: 'prioritize',
				type: 'options',
				default: 'quality',
				description: 'Screenshot capture priority for styleguide extraction',
				options: [
					{ name: 'Speed', value: 'speed' },
					{ name: 'Quality', value: 'quality' },
				],
				routing: {
					request: {
						qs: {
							prioritize: '={{ $value }}',
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
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForScreenshot,
				operation: ['extractFonts'],
			},
		},
		options: [
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
