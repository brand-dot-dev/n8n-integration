import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['web'] };
const visualOps = ['screenshot', 'extractStyleguide', 'extractFonts', 'extractCompetitors'];

export const visualFields: INodeProperties[] = [
	// ─── Required inputs ─────────────────────────────────────────────────────
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: visualOps } },
		default: '',
		placeholder: 'stripe.com',
		routing: { request: { qs: { domain: '={{ $value }}' } } },
	},

	// ─── Additional Fields ────────────────────────────────────────────────────
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...show, operation: visualOps } },
		options: [
			{
				displayName: 'Direct URL',
				name: 'directUrl',
				type: 'string',
				displayOptions: { show: { '/operation': ['screenshot', 'extractStyleguide', 'extractFonts'] } },
				default: '',
				placeholder: 'https://example.com/design-system',
				description: 'Fetch from this exact URL instead of resolving from the domain',
				routing: { request: { qs: { directUrl: '={{ $value }}' } } },
			},
			{
				displayName: 'Full Page Screenshot',
				name: 'fullScreenshot',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['screenshot'] } },
				default: false,
				description: 'Capture the full scrollable page height instead of just the visible viewport',
				routing: { request: { qs: { fullScreenshot: '={{ $value ? "true" : "false" }}' } } },
			},
			{
				displayName: 'Handle Cookie Popup',
				name: 'handleCookiePopup',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['screenshot'] } },
				default: false,
				description: 'Attempt to dismiss cookie consent banners before taking the screenshot',
				routing: { request: { qs: { handleCookiePopup: '={{ $value ? "true" : "false" }}' } } },
			},
			{
				displayName: 'Max Age (Ms)',
				name: 'maxAgeMs',
				type: 'number',
				default: 86400000,
				description: 'Max age of cached result in ms before a fresh fetch. Default 1 day.',
				routing: { request: { qs: { maxAgeMs: '={{ $value }}' } } },
			},
			{
				displayName: 'Number of Competitors',
				name: 'numCompetitors',
				type: 'number',
				displayOptions: { show: { '/operation': ['extractCompetitors'] } },
				default: 5,
				typeOptions: { minValue: 1 },
				routing: { request: { qs: { numCompetitors: '={{ $value }}' } } },
			},
			{
				displayName: 'Page Type',
				name: 'page',
				type: 'options',
				displayOptions: { show: { '/operation': ['screenshot'] } },
				default: '',
				options: [
					{ name: 'Blog', value: 'blog' },
					{ name: 'Careers', value: 'careers' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Homepage (Default)', value: '' },
					{ name: 'Login', value: 'login' },
					{ name: 'Pricing', value: 'pricing' },
					{ name: 'Privacy', value: 'privacy' },
					{ name: 'Signup', value: 'signup' },
					{ name: 'Terms', value: 'terms' },
				],
				routing: { request: { qs: { page: '={{ $value }}' } } },
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				description: 'Maximum time in milliseconds to wait for a response before the request fails.',
				typeOptions: { minValue: 1, maxValue: 300000 },
				routing: { request: { qs: { timeoutMS: '={{ $value }}' } } },
			},
			{
				displayName: 'Wait For (Ms)',
				name: 'waitForMs',
				type: 'number',
				displayOptions: { show: { '/operation': ['screenshot'] } },
				default: 0,
				description: 'Delay capturing by this many milliseconds after page load. Max 30,000 ms.',
				typeOptions: { minValue: 0, maxValue: 30000 },
				routing: { request: { qs: { waitForMs: '={{ $value }}' } } },
			},
		],
	},
];
