import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['web'] };
const scrapingOps = ['scrapeMd', 'scrapeHtml', 'scrapeImages', 'crawl', 'scrapeSitemap'];

export const scrapingFields: INodeProperties[] = [
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: ['scrapeMd', 'scrapeHtml', 'scrapeImages'] } },
		default: '',
		placeholder: 'https://stripe.com/docs',
		routing: { request: { qs: { url: '={{ $value }}' } } },
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: ['crawl'] } },
		default: '',
		placeholder: 'https://stripe.com/blog',
		routing: { request: { body: { url: '={{ $value }}' } } },
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: ['scrapeSitemap'] } },
		default: '',
		placeholder: 'stripe.com',
		routing: { request: { qs: { domain: '={{ $value }}' } } },
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...show, operation: scrapingOps } },
		options: [
			{
				displayName: 'Follow Subdomains',
				name: 'followSubdomains',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: false,
				description: 'Follow links to subdomains (e.g. blog.example.com) during a crawl',
				routing: { request: { body: { followSubdomains: '={{ $value }}' } } },
			},
			{
				displayName: 'Include Frames',
				name: 'includeFrames',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['scrapeMd', 'scrapeHtml'] } },
				default: false,
				description: 'Include content from iframes embedded in the page',
				routing: { request: { qs: { includeFrames: '={{ $value }}' } } },
			},
			{
				displayName: 'Include Frames',
				name: 'includeFramesPost',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: false,
				description: 'Include content from iframes embedded in the page',
				routing: { request: { body: { includeFrames: '={{ $value }}' } } },
			},
			{
				displayName: 'Include Images',
				name: 'includeImages',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['scrapeMd'] } },
				default: false,
				description: 'Include image references in the returned Markdown output',
				routing: { request: { qs: { includeImages: '={{ $value }}' } } },
			},
			{
				displayName: 'Include Images',
				name: 'includeImagesPost',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: false,
				description: 'Include image references in the returned Markdown output',
				routing: { request: { body: { includeImages: '={{ $value }}' } } },
			},
			{
				displayName: 'Include Links',
				name: 'includeLinks',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['scrapeMd'] } },
				default: true,
				description: 'Preserve hyperlinks in the returned Markdown output',
				routing: { request: { qs: { includeLinks: '={{ $value }}' } } },
			},
			{
				displayName: 'Include Links',
				name: 'includeLinksPost',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: true,
				description: 'Preserve hyperlinks in the returned Markdown output',
				routing: { request: { body: { includeLinks: '={{ $value }}' } } },
			},
			{
				displayName: 'Main Content Only',
				name: 'useMainContentOnly',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['scrapeMd', 'scrapeHtml'] } },
				default: false,
				description: 'Strip navigation, headers, and footers — return only the main body content',
				routing: { request: { qs: { useMainContentOnly: '={{ $value }}' } } },
			},
			{
				displayName: 'Main Content Only',
				name: 'useMainContentOnlyPost',
				type: 'boolean',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: false,
				description: 'Strip navigation, headers, and footers — return only the main body content',
				routing: { request: { body: { useMainContentOnly: '={{ $value }}' } } },
			},
			{
				displayName: 'Include Selectors',
				name: 'includeSelectors',
				type: 'string',
				displayOptions: { show: { '/operation': ['scrapeMd', 'scrapeHtml'] } },
				default: '',
				description:
					'Comma-separated CSS selectors. When set, only matching subtrees are kept (e.g. "article.main, #content").',
				routing: {
					request: {
						qs: { includeSelectors: '={{ $value.split(",").map(s => s.trim()).filter(Boolean) }}' },
						arrayFormat: 'comma',
					},
				},
			},
			{
				displayName: 'Include Selectors',
				name: 'includeSelectorsPost',
				type: 'string',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: '',
				description:
					'Comma-separated CSS selectors. When set, only matching subtrees are kept (e.g. "article.main, #content").',
				routing: {
					request: {
						body: {
							includeSelectors: '={{ $value.split(",").map(s => s.trim()).filter(Boolean) }}',
						},
					},
				},
			},
			{
				displayName: 'Exclude Selectors',
				name: 'excludeSelectors',
				type: 'string',
				displayOptions: { show: { '/operation': ['scrapeMd', 'scrapeHtml'] } },
				default: '',
				description:
					'Comma-separated CSS selectors to remove before extraction (e.g. "nav, footer, .ad-banner").',
				routing: {
					request: {
						qs: { excludeSelectors: '={{ $value.split(",").map(s => s.trim()).filter(Boolean) }}' },
						arrayFormat: 'comma',
					},
				},
			},
			{
				displayName: 'Exclude Selectors',
				name: 'excludeSelectorsPost',
				type: 'string',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: '',
				description:
					'Comma-separated CSS selectors to remove before extraction (e.g. "nav, footer, .ad-banner").',
				routing: {
					request: {
						body: {
							excludeSelectors: '={{ $value.split(",").map(s => s.trim()).filter(Boolean) }}',
						},
					},
				},
			},
			{
				displayName: 'Custom Headers',
				name: 'headers',
				type: 'fixedCollection',
				typeOptions: { multipleValues: true },
				default: {},
				displayOptions: {
					show: { '/operation': ['scrapeMd', 'scrapeHtml', 'scrapeImages', 'scrapeSitemap'] },
				},
				description:
					'Custom HTTP headers forwarded to the target URL. Sending headers bypasses the cache.',
				options: [
					{
						name: 'header',
						displayName: 'Header',
						values: [
							{ displayName: 'Name', name: 'name', type: 'string', default: '' },
							{ displayName: 'Value', name: 'value', type: 'string', default: '' },
						],
					},
				],
				routing: {
					request: {
						qs: {
							headers:
								'={{ Object.fromEntries(($value.header || []).map(h => [h.name, h.value])) }}',
						},
					},
				},
			},
			{
				displayName: 'Max Age (Ms)',
				name: 'maxAgeMs',
				type: 'number',
				displayOptions: {
					show: { '/operation': ['scrapeMd', 'scrapeHtml', 'scrapeImages', 'scrapeSitemap'] },
				},
				default: 86400000,
				description: 'Max age of cached result in ms before a fresh fetch. Default 1 day.',
				routing: { request: { qs: { maxAgeMs: '={{ $value }}' } } },
			},
			{
				displayName: 'Max Age (Ms)',
				name: 'maxAgeMsPost',
				type: 'number',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: 86400000,
				description: 'Max age of cached result in ms before a fresh fetch. Default 1 day.',
				routing: { request: { body: { maxAgeMs: '={{ $value }}' } } },
			},
			{
				displayName: 'Max Depth',
				name: 'maxDepth',
				type: 'number',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: 3,
				description:
					'How many link levels deep to crawl from the starting URL. 0 = starting page only.',
				typeOptions: { minValue: 0 },
				routing: { request: { body: { maxDepth: '={{ $value }}' } } },
			},
			{
				displayName: 'Max Links',
				name: 'maxLinks',
				type: 'number',
				displayOptions: { show: { '/operation': ['scrapeSitemap'] } },
				default: 10000,
				description: 'Maximum number of URLs to return from the sitemap. Capped at 100,000.',
				typeOptions: { minValue: 1, maxValue: 100000 },
				routing: { request: { qs: { maxLinks: '={{ $value }}' } } },
			},
			{
				displayName: 'Max Pages',
				name: 'maxPages',
				type: 'number',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: 10,
				description: 'Maximum number of pages to crawl. Increase for larger sites. Hard cap: 500.',
				typeOptions: { minValue: 1, maxValue: 500 },
				routing: { request: { body: { maxPages: '={{ $value }}' } } },
			},
			{
				displayName: 'Stop After (Ms)',
				name: 'stopAfterMs',
				type: 'number',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: 80000,
				description:
					'Stop the crawl after this many milliseconds, returning pages collected so far. Between 10,000 and 110,000 ms.',
				typeOptions: { minValue: 10000, maxValue: 110000 },
				routing: { request: { body: { stopAfterMs: '={{ $value }}' } } },
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				displayOptions: {
					show: { '/operation': ['scrapeMd', 'scrapeHtml', 'scrapeImages', 'scrapeSitemap'] },
				},
				default: 30000,
				description:
					'Maximum time in milliseconds to wait for a response before the request fails.',
				typeOptions: { minValue: 1, maxValue: 300000 },
				routing: { request: { qs: { timeoutMS: '={{ $value }}' } } },
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMSPost',
				type: 'number',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: 30000,
				description:
					'Maximum time in milliseconds to wait for a response before the request fails.',
				typeOptions: { minValue: 1, maxValue: 300000 },
				routing: { request: { body: { timeoutMS: '={{ $value }}' } } },
			},
			{
				displayName: 'URL Regex',
				name: 'urlRegex',
				type: 'string',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: '',
				placeholder: '^https?://[^/]+/blog/',
				description: 'Only crawl URLs matching this RE2 regex pattern',
				routing: { request: { body: { urlRegex: '={{ $value }}' } } },
			},
			{
				displayName: 'URL Regex',
				name: 'urlRegexSitemap',
				type: 'string',
				displayOptions: { show: { '/operation': ['scrapeSitemap'] } },
				default: '',
				placeholder: '^https?://[^/]+/blog/',
				description: 'Only return sitemap URLs matching this RE2 regex pattern',
				routing: { request: { qs: { urlRegex: '={{ $value }}' } } },
			},
			{
				displayName: 'Wait For (Ms)',
				name: 'waitForMs',
				type: 'number',
				displayOptions: { show: { '/operation': ['scrapeMd', 'scrapeHtml', 'scrapeImages'] } },
				default: 0,
				description:
					'Delay scraping by this many milliseconds after page load — useful for pages with delayed JavaScript rendering. Max 30,000 ms.',
				typeOptions: { minValue: 0, maxValue: 30000 },
				routing: { request: { qs: { waitForMs: '={{ $value }}' } } },
			},
			{
				displayName: 'Wait For (Ms)',
				name: 'waitForMsPost',
				type: 'number',
				displayOptions: { show: { '/operation': ['crawl'] } },
				default: 0,
				description:
					'Delay scraping by this many milliseconds after page load — useful for pages with delayed JavaScript rendering. Max 30,000 ms.',
				typeOptions: { minValue: 0, maxValue: 30000 },
				routing: { request: { body: { waitForMs: '={{ $value }}' } } },
			},
		],
	},
];
