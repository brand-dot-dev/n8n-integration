/**
 * Live API contract tests — one-to-one verification against api.context.dev/v1.
 *
 * Requires: CONTEXT_DEV_API_KEY env var
 * Run:      CONTEXT_DEV_API_KEY=your_key npx jest tests/live.test.ts
 *
 * Expensive operations (AI, crawl, extract) are skipped unless
 * CONTEXT_DEV_RUN_EXPENSIVE=true is also set.
 */

import * as path from 'path';
import * as fs from 'fs';

const API_KEY = process.env.CONTEXT_DEV_API_KEY ?? '';
const RUN_EXPENSIVE = process.env.CONTEXT_DEV_RUN_EXPENSIVE === 'true';
const BASE_URL = 'https://api.context.dev/v1';

// Load spec produced by scripts/extract-spec.ts
const SPEC = JSON.parse(
	fs.readFileSync(path.resolve(__dirname, '../spec.json'), 'utf-8'),
) as {
	endpoints: Array<{
		path: string;
		httpMethod: string;
		sdkMethod: string;
		responseFields: Array<{ name: string; required: boolean }>;
	}>;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function headers(): Record<string, string> {
	return {
		Authorization: `Bearer ${API_KEY}`,
		'Content-Type': 'application/json',
		integration_name: 'n8n',
	};
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiResponse = { status: number; body: any };

async function get(apiPath: string, qs: Record<string, string | number | boolean> = {}): Promise<ApiResponse> {
	const url = new URL(BASE_URL + apiPath);
	for (const [k, v] of Object.entries(qs)) url.searchParams.set(k, String(v));
	const res = await fetch(url.toString(), { headers: headers() });
	return { status: res.status, body: await res.json() };
}

async function post(apiPath: string, body: Record<string, unknown> = {}): Promise<ApiResponse> {
	const res = await fetch(BASE_URL + apiPath, {
		method: 'POST',
		headers: headers(),
		body: JSON.stringify(body),
	});
	return { status: res.status, body: await res.json() };
}

/** Verify that the response contains every required top-level field from the SDK spec. */
function checkResponseShape(body: Record<string, unknown>, sdkMethod: string) {
	const ep = SPEC.endpoints.find((e) => e.sdkMethod === sdkMethod);
	if (!ep) return;
	for (const field of ep.responseFields) {
		if (field.required) {
			expect(body).toHaveProperty(field.name);
		}
	}
}

// ─── Rate limiting (10 req/min = 6s between requests) ────────────────────────

const RATE_LIMIT_MS = 6500;
jest.setTimeout(60000);
afterEach(() => new Promise((r) => setTimeout(r, RATE_LIMIT_MS)));

// ─── Skip guard ───────────────────────────────────────────────────────────────

const skip = !API_KEY ? test.skip : test;
const skipExpensive = !API_KEY || !RUN_EXPENSIVE ? test.skip : test;

// ─── Brand Intelligence ───────────────────────────────────────────────────────

describe('Brand Intelligence', () => {
	skip('GET /brand/retrieve — required: domain', async () => {
		const { status, body } = await get('/brand/retrieve', { domain: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'retrieve');
		expect(body.brand?.domain).toBe('stripe.com');
	});

	skip('GET /brand/retrieve-by-email — required: email', async () => {
		const { status, body } = await get('/brand/retrieve-by-email', { email: 'support@stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'retrieveByEmail');
	});

	skip('GET /brand/retrieve-by-name — required: name', async () => {
		const { status, body } = await get('/brand/retrieve-by-name', { name: 'Stripe' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'retrieveByName');
	});

	skip('GET /brand/retrieve-by-ticker — required: ticker', async () => {
		const { status, body } = await get('/brand/retrieve-by-ticker', { ticker: 'AAPL' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'retrieveByTicker');
	});

	skip('GET /brand/retrieve-by-isin — required: isin', async () => {
		const { status, body } = await get('/brand/retrieve-by-isin', { isin: 'US0378331005' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'retrieveByIsin');
	});

	skip('GET /brand/retrieve-simplified — required: domain', async () => {
		const { status, body } = await get('/brand/retrieve-simplified', { domain: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'retrieveSimplified');
	});

	skip('GET /brand/transaction_identifier — required: transaction_info', async () => {
		const { status, body } = await get('/brand/transaction_identifier', {
			transaction_info: 'AMZ*MKTPLACE 800-123-4567 WA',
		});
		// 200 = matched, 400 = not found — both mean the endpoint is reachable and param name is correct
		expect([200, 400]).toContain(status);
		expect(body).toHaveProperty('status');
	});
});

// ─── Industry Classification ──────────────────────────────────────────────────

describe('Industry Classification', () => {
	skip('GET /web/naics — required: input', async () => {
		const { status, body } = await get('/web/naics', { input: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'retrieveNaics');
		expect(Array.isArray(body.codes)).toBe(true);
	});

	skip('GET /web/sic — required: input', async () => {
		const { status, body } = await get('/web/sic', { input: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'retrieveSic');
		expect(Array.isArray(body.codes)).toBe(true);
	});
});

// ─── Web Scraping ─────────────────────────────────────────────────────────────

describe('Web Scraping', () => {
	skip('GET /web/scrape/markdown — required: url', async () => {
		const { status, body } = await get('/web/scrape/markdown', { url: 'https://stripe.com' });
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		checkResponseShape(body, 'webScrapeMd');
		expect(typeof body.markdown).toBe('string');
	});

	skip('GET /web/scrape/html — required: url', async () => {
		const { status, body } = await get('/web/scrape/html', { url: 'https://stripe.com' });
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		checkResponseShape(body, 'webScrapeHTML');
		expect(typeof body.html).toBe('string');
	});

	skip('GET /web/scrape/images — required: url', async () => {
		const { status, body } = await get('/web/scrape/images', { url: 'https://stripe.com' });
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		checkResponseShape(body, 'webScrapeImages');
		expect(Array.isArray(body.images)).toBe(true);
	});

	skip('GET /web/scrape/sitemap — required: domain', async () => {
		const { status, body } = await get('/web/scrape/sitemap', { domain: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.success).toBe(true);
		checkResponseShape(body, 'webScrapeSitemap');
		expect(Array.isArray(body.urls)).toBe(true);
	});

	skip('GET /web/screenshot — required: domain', async () => {
		const { status, body } = await get('/web/screenshot', { domain: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'screenshot');
		expect(typeof body.screenshot).toBe('string');
	});

	skip('GET /web/styleguide — required: domain', async () => {
		const { status, body } = await get('/web/styleguide', { domain: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'extractStyleguide');
	});

	skip('GET /web/fonts — required: domain', async () => {
		const { status, body } = await get('/web/fonts', { domain: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'extractFonts');
		expect(Array.isArray(body.fonts)).toBe(true);
	});

	skip('GET /web/competitors — required: domain', async () => {
		const { status, body } = await get('/web/competitors', { domain: 'stripe.com' });
		expect(status).toBe(200);
		expect(body.status).toBe('ok');
		checkResponseShape(body, 'extractCompetitors');
		expect(Array.isArray(body.competitors)).toBe(true);
	});

	skip('POST /web/search — required: query', async () => {
		const { status, body } = await post('/web/search', { query: 'stripe payment api' });
		expect(status).toBe(200);
		checkResponseShape(body, 'search');
		expect(Array.isArray(body.results)).toBe(true);
	});

	skipExpensive('POST /web/crawl — required: url (expensive)', async () => {
		const { status, body } = await post('/web/crawl', {
			url: 'https://stripe.com/docs',
			maxPages: 1,
		});
		expect(status).toBe(200);
		checkResponseShape(body, 'webCrawlMd');
		expect(Array.isArray(body.results)).toBe(true);
	});

	skipExpensive('POST /web/extract — required: url + schema (expensive)', async () => {
		const { status, body } = await post('/web/extract', {
			url: 'https://stripe.com',
			schema: {
				type: 'object',
				properties: { tagline: { type: 'string' } },
			},
		});
		expect(status).toBe(200);
		checkResponseShape(body, 'extract');
		expect(body.data).toBeDefined();
	});
});

// ─── AI Data Extraction ───────────────────────────────────────────────────────

describe('AI Data Extraction', () => {
	skipExpensive('POST /brand/ai/products — required: domain (expensive)', async () => {
		const { status, body } = await post('/brand/ai/products', {
			domain: 'stripe.com',
			maxProducts: 1,
		});
		expect(status).toBe(200);
		checkResponseShape(body, 'extractProducts');
		expect(Array.isArray(body.products)).toBe(true);
	});

	skipExpensive('POST /brand/ai/product — required: url (expensive)', async () => {
		const { status, body } = await post('/brand/ai/product', {
			url: 'https://stripe.com/products/payments',
		});
		expect(status).toBe(200);
		checkResponseShape(body, 'extractProduct');
		expect(typeof body.is_product_page).toBe('boolean');
	}, 60000);

	skipExpensive('POST /brand/ai/query — required: domain + data_to_extract (expensive)', async () => {
		const { status, body } = await post('/brand/ai/query', {
			domain: 'stripe.com',
			data_to_extract: [
				{
					datapoint_name: 'tagline',
					datapoint_description: 'Main homepage tagline',
					datapoint_type: 'text',
					datapoint_example: 'The platform for modern teams',
				},
			],
		});
		expect(status).toBe(200);
		checkResponseShape(body, 'aiQuery');
		expect(Array.isArray(body.data_extracted)).toBe(true);
	});
});

// ─── Utility ─────────────────────────────────────────────────────────────────

describe('Utility', () => {
	skip('POST /brand/prefetch — required: domain', async () => {
		const { status } = await post('/brand/prefetch', { domain: 'stripe.com' });
		// 200 = success, 403 = plan restriction — both confirm endpoint is reachable
		expect([200, 403]).toContain(status);
	});

	skip('POST /brand/prefetch-by-email — required: email', async () => {
		const { status } = await post('/brand/prefetch-by-email', { email: 'support@stripe.com' });
		expect([200, 403]).toContain(status);
	});
});
