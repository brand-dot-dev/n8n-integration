import type { INodeProperties } from 'n8n-workflow';
import { scrapingFields } from './scraping';
import { brandFields } from './brand';
import { searchExtractFields } from './searchExtract';

const show = { resource: ['web'] };

const operationField: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show },
	options: [
		{
			name: 'Crawl Sitemap',
			value: 'scrapeSitemap',
			action: 'Crawl sitemap and return all discovered urls',
			description:
				'Parse a domain sitemap and return all discovered page URLs. <a href="https://docs.context.dev/api-reference/web-scraping/crawl-sitemap" target="_blank">View docs</a>.',
			routing: { request: { method: 'GET', url: '/web/scrape/sitemap' } },
		},
		{
			name: 'Crawl Website',
			value: 'crawl',
			action: 'Crawl a website and return markdown for all pages',
			description:
				'Crawl multiple pages of a website and return markdown for each. <a href="https://docs.context.dev/api-reference/web-scraping/crawl-website" target="_blank">View docs</a>.',
			routing: { request: { method: 'POST', url: '/web/crawl' } },
		},
		{
			name: 'Extract Competitors',
			value: 'extractCompetitors',
			action: 'Extract competitors for a domain',
			description: 'Identify direct competitors for a given brand domain.',
			routing: { request: { method: 'GET', url: '/web/competitors' } },
		},
		{
			name: 'Extract Fonts',
			value: 'extractFonts',
			action: 'Extract font information from a website',
			description:
				'Extract font families, usage statistics, fallbacks, and element counts. <a href="https://docs.context.dev/api-reference/brand/fonts" target="_blank">View docs</a>.',
			routing: { request: { method: 'GET', url: '/web/fonts' } },
		},
		{
			name: 'Extract Structured Data',
			value: 'extract',
			action: 'Extract structured data using a JSON schema',
			description:
				'Crawl a website and extract data matching your JSON schema. <a href="https://docs.context.dev/api-reference/web-scraping/extract" target="_blank">View docs</a>.',
			routing: { request: { method: 'POST', url: '/web/extract' } },
		},
		{
			name: 'Extract Styleguide',
			value: 'extractStyleguide',
			action: 'Extract design system from a website',
			description:
				'Extract colors, typography, spacing, shadows, and UI components. <a href="https://docs.context.dev/api-reference/brand/styleguide" target="_blank">View docs</a>.',
			routing: { request: { method: 'GET', url: '/web/styleguide' } },
		},
		{
			name: 'Scrape HTML',
			value: 'scrapeHtml',
			action: 'Scrape a URL and return raw HTML',
			description:
				'Scrape any URL and return the raw HTML. <a href="https://docs.context.dev/api-reference/web-scraping/scrape-html" target="_blank">View docs</a>.',
			routing: { request: { method: 'GET', url: '/web/scrape/html' } },
		},
		{
			name: 'Scrape Images',
			value: 'scrapeImages',
			action: 'Extract all images from a webpage',
			description:
				'Extract image assets from a web page including URLs, inline SVGs, and metadata. <a href="https://docs.context.dev/api-reference/web-scraping/scrape-images" target="_blank">View docs</a>.',
			routing: { request: { method: 'GET', url: '/web/scrape/images' } },
		},
		{
			name: 'Scrape to Markdown',
			value: 'scrapeMd',
			action: 'Scrape a url to markdown',
			description:
				'Scrape any URL and get back clean markdown content. <a href="https://docs.context.dev/api-reference/web-scraping/scrape-markdown" target="_blank">View docs</a>.',
			routing: { request: { method: 'GET', url: '/web/scrape/markdown' } },
		},
		{
			name: 'Screenshot',
			value: 'screenshot',
			action: 'Take a screenshot of a website',
			description:
				'Capture a screenshot with options for page type and viewport. <a href="https://docs.context.dev/api-reference/brand/screenshot" target="_blank">View docs</a>.',
			routing: { request: { method: 'GET', url: '/web/screenshot' } },
		},
		{
			name: 'Search',
			value: 'search',
			action: 'Search the web and return results',
			description:
				'Run a web search and get structured results with optional markdown content. <a href="https://docs.context.dev/api-reference/web-scraping/web-search" target="_blank">View docs</a>.',
			routing: { request: { method: 'POST', url: '/web/search' } },
		},
	],
	default: 'scrapeMd',
};

export const webDescription: INodeProperties[] = [
	operationField,
	...scrapingFields,   // scrapeMd, scrapeHtml, scrapeImages, crawl, scrapeSitemap
	...brandFields,     // screenshot, extractStyleguide, extractFonts, extractCompetitors
	...searchExtractFields, // search, extract
];
