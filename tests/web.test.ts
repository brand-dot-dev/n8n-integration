import { webDescription } from '../nodes/ContextDev/resources/web';
import {
	getOperations,
	operationExists,
	urlFor,
	methodFor,
	allUrls,
	getTopField,
	getAllTopFields,
	getAdditionalField,
	usesQsRouting,
	usesBodyRouting,
	showsForOperations,
	additionalFieldShowsFor,
	qsKeyFor,
	bodyKeyFor,
	arrayFormatFor,
	getAdditionalFieldFor,
} from './helpers';

describe('web resource', () => {
	// ─── Operations ────────────────────────────────────────────────────────────

	describe('operations', () => {
		it('has exactly 11 operations', () => {
			expect(getOperations(webDescription)).toHaveLength(11);
		});

		it('has no duplicate operation values', () => {
			const values = getOperations(webDescription).map((o) => o.value);
			expect(new Set(values).size).toBe(values.length);
		});

		it('every operation has an action defined (required for usableAsTool)', () => {
			const missing = getOperations(webDescription).filter((o) => !o.action);
			expect(missing).toHaveLength(0);
		});

		it('operation property has noDataExpression: true', () => {
			const op = webDescription.find((p) => p.name === 'operation');
			expect(op?.noDataExpression).toBe(true);
		});
	});

	// ─── Routing — correct URLs and methods ───────────────────────────────────

	describe('routing — correct URLs and methods', () => {
		const cases: [string, string, string][] = [
			['scrapeMd', 'GET', '/web/scrape/markdown'],
			['scrapeHtml', 'GET', '/web/scrape/html'],
			['scrapeImages', 'GET', '/web/scrape/images'],
			['crawl', 'POST', '/web/crawl'],
			['scrapeSitemap', 'GET', '/web/scrape/sitemap'],
			['search', 'POST', '/web/search'],
			['extract', 'POST', '/web/extract'],
			['screenshot', 'GET', '/web/screenshot'],
			['extractStyleguide', 'GET', '/web/styleguide'],
			['extractFonts', 'GET', '/web/fonts'],
			['extractCompetitors', 'GET', '/web/competitors'],
		];

		test.each(cases)('%s → %s %s', (op, method, url) => {
			expect(methodFor(webDescription, op)).toBe(method);
			expect(urlFor(webDescription, op)).toBe(url);
		});
	});

	// ─── Migration — old wrong URLs are gone ──────────────────────────────────

	describe('migration — old wrong URLs do not exist', () => {
		const banned = [
			'/web/scrape/md',
			'/web/crawl/md',
			'/web/sitemap',
			'/brand/screenshot',
			'/brand/styleguide',
			'/brand/fonts',
			'/brand/competitors',
		];

		test.each(banned)('%s is gone', (url) => {
			expect(allUrls(webDescription)).not.toContain(url);
		});

		it('scrapeHtml is GET not POST', () => {
			expect(methodFor(webDescription, 'scrapeHtml')).toBe('GET');
		});

		it('scrapeImages is GET not POST', () => {
			expect(methodFor(webDescription, 'scrapeImages')).toBe('GET');
		});
	});

	// ─── New operations ────────────────────────────────────────────────────────

	describe('new operations exist', () => {
		it('extract operation exists', () => {
			expect(operationExists(webDescription, 'extract')).toBe(true);
		});

		it('extractCompetitors operation exists', () => {
			expect(operationExists(webDescription, 'extractCompetitors')).toBe(true);
		});
	});

	// ─── Required fields ───────────────────────────────────────────────────────

	describe('required fields exist and are marked required', () => {
		it('url is required for GET scrape ops (scrapeMd, scrapeHtml, scrapeImages)', () => {
			const getUrlFields = getAllTopFields(webDescription, 'url').filter((f) => {
				const ops = showsForOperations(f);
				return ops.includes('scrapeMd') && !ops.includes('crawl');
			});
			expect(getUrlFields.some((f) => f.required)).toBe(true);
		});

		it('url is required for POST crawl op', () => {
			const postUrlFields = getAllTopFields(webDescription, 'url').filter((f) =>
				showsForOperations(f).includes('crawl'),
			);
			expect(postUrlFields.some((f) => f.required)).toBe(true);
		});

		it('url is required for POST extract op', () => {
			const postUrlFields = getAllTopFields(webDescription, 'url').filter((f) =>
				showsForOperations(f).includes('extract'),
			);
			expect(postUrlFields.some((f) => f.required)).toBe(true);
		});

		it('domain is required for scrapeSitemap', () => {
			const field = getAllTopFields(webDescription, 'domain').find((f) =>
				showsForOperations(f).includes('scrapeSitemap'),
			);
			expect(field?.required).toBe(true);
		});

		it('query is required for search', () => {
			const field = getTopField(webDescription, 'query');
			expect(field?.required).toBe(true);
		});

		it('schema is required for extract', () => {
			const field = getTopField(webDescription, 'schema');
			expect(field?.required).toBe(true);
		});
	});

	// ─── displayOptions scoping ────────────────────────────────────────────────

	describe('displayOptions scoping', () => {
		it('GET url field does NOT show for crawl or extract (POST ops)', () => {
			const getUrlField = getAllTopFields(webDescription, 'url').find(
				(f) =>
					showsForOperations(f).includes('scrapeMd') && !showsForOperations(f).includes('crawl'),
			);
			expect(getUrlField).toBeDefined();
			expect(showsForOperations(getUrlField!)).not.toContain('crawl');
			expect(showsForOperations(getUrlField!)).not.toContain('extract');
		});

		it('POST url field does NOT show for scrapeMd or scrapeHtml (GET ops)', () => {
			const postUrlField = getAllTopFields(webDescription, 'url').find((f) =>
				showsForOperations(f).includes('crawl'),
			);
			expect(postUrlField).toBeDefined();
			expect(showsForOperations(postUrlField!)).not.toContain('scrapeMd');
			expect(showsForOperations(postUrlField!)).not.toContain('scrapeHtml');
		});

		it('query shows only for search', () => {
			const field = getTopField(webDescription, 'query')!;
			expect(showsForOperations(field)).toEqual(['search']);
		});

		it('schema shows only for extract', () => {
			const field = getTopField(webDescription, 'schema')!;
			expect(showsForOperations(field)).toEqual(['extract']);
		});

		it('domain field covers scrapeSitemap, screenshot, extractStyleguide, extractFonts, extractCompetitors (across all domain fields)', () => {
			const allOps = getAllTopFields(webDescription, 'domain').flatMap((f) =>
				showsForOperations(f),
			);
			expect(allOps).toContain('scrapeSitemap');
			expect(allOps).toContain('screenshot');
			expect(allOps).toContain('extractStyleguide');
			expect(allOps).toContain('extractFonts');
			expect(allOps).toContain('extractCompetitors');
		});

		it('domain field does NOT show for scrapeMd, crawl, search, extract', () => {
			const allOps = getAllTopFields(webDescription, 'domain').flatMap((f) =>
				showsForOperations(f),
			);
			expect(allOps).not.toContain('scrapeMd');
			expect(allOps).not.toContain('crawl');
			expect(allOps).not.toContain('search');
			expect(allOps).not.toContain('extract');
		});
	});

	// ─── Field routing ─────────────────────────────────────────────────────────

	describe('field routing — GET params in qs, POST params in body', () => {
		it('GET url field uses qs routing', () => {
			const getUrlField = getAllTopFields(webDescription, 'url').find(
				(f) =>
					showsForOperations(f).includes('scrapeMd') && !showsForOperations(f).includes('crawl'),
			)!;
			expect(usesQsRouting(getUrlField)).toBe(true);
		});

		it('POST url field (crawl/extract) uses body routing', () => {
			const postUrlField = getAllTopFields(webDescription, 'url').find((f) =>
				showsForOperations(f).includes('crawl'),
			)!;
			expect(usesBodyRouting(postUrlField)).toBe(true);
		});

		it('query field uses body routing', () => {
			const field = getTopField(webDescription, 'query')!;
			expect(usesBodyRouting(field)).toBe(true);
		});

		it('schema field uses body routing', () => {
			const field = getTopField(webDescription, 'schema')!;
			expect(usesBodyRouting(field)).toBe(true);
		});

		it('domain field uses qs routing', () => {
			const domainField = getAllTopFields(webDescription, 'domain').find((f) =>
				showsForOperations(f).includes('scrapeSitemap'),
			)!;
			expect(usesQsRouting(domainField)).toBe(true);
		});
	});

	// ─── Field types ───────────────────────────────────────────────────────────

	describe('field types', () => {
		it('schema is type json', () => {
			expect(getTopField(webDescription, 'schema')?.type).toBe('json');
		});

		it('query is type string', () => {
			expect(getTopField(webDescription, 'query')?.type).toBe('string');
		});

		it('maxPages in additionalFields is type number', () => {
			expect(getAdditionalField(webDescription, 'maxPages')?.type).toBe('number');
		});

		it('maxDepth in additionalFields is type number', () => {
			expect(getAdditionalField(webDescription, 'maxDepth')?.type).toBe('number');
		});

		it('followSubdomains in additionalFields is type boolean', () => {
			expect(getAdditionalField(webDescription, 'followSubdomains')?.type).toBe('boolean');
		});

		it('factCheck in additionalFields is type boolean', () => {
			expect(getAdditionalField(webDescription, 'factCheck')?.type).toBe('boolean');
		});

		it('handleCookiePopup in additionalFields is type boolean', () => {
			expect(getAdditionalField(webDescription, 'handleCookiePopup')?.type).toBe('boolean');
		});
	});

	// ─── additionalFields contents ─────────────────────────────────────────────

	describe('additionalFields', () => {
		it('maxPages is scoped to crawl only', () => {
			const field = getAdditionalField(webDescription, 'maxPages')!;
			expect(additionalFieldShowsFor(field)).toEqual(['crawl']);
		});

		it('maxDepth is scoped to crawl only', () => {
			const field = getAdditionalField(webDescription, 'maxDepth')!;
			expect(additionalFieldShowsFor(field)).toEqual(['crawl']);
		});

		it('maxLinks is scoped to scrapeSitemap only', () => {
			const field = getAdditionalField(webDescription, 'maxLinks')!;
			expect(additionalFieldShowsFor(field)).toEqual(['scrapeSitemap']);
		});

		it('factCheck is scoped to extract only', () => {
			const field = getAdditionalField(webDescription, 'factCheck')!;
			expect(additionalFieldShowsFor(field)).toEqual(['extract']);
		});

		it('instructions is scoped to extract only', () => {
			const field = getAdditionalField(webDescription, 'instructions')!;
			expect(additionalFieldShowsFor(field)).toEqual(['extract']);
		});

		it('numCompetitors is scoped to extractCompetitors only', () => {
			const field = getAdditionalField(webDescription, 'numCompetitors')!;
			expect(additionalFieldShowsFor(field)).toEqual(['extractCompetitors']);
		});

		it('handleCookiePopup is scoped to screenshot only', () => {
			const field = getAdditionalField(webDescription, 'handleCookiePopup')!;
			expect(additionalFieldShowsFor(field)).toEqual(['screenshot']);
		});

		it('fullScreenshot is scoped to screenshot only', () => {
			const field = getAdditionalField(webDescription, 'fullScreenshot')!;
			expect(additionalFieldShowsFor(field)).toEqual(['screenshot']);
		});

		it('queryFanout is scoped to search only', () => {
			const field = getAdditionalField(webDescription, 'queryFanout')!;
			expect(additionalFieldShowsFor(field)).toEqual(['search']);
		});

		it('freshness is scoped to search only', () => {
			const field = getAdditionalField(webDescription, 'freshness')!;
			expect(additionalFieldShowsFor(field)).toEqual(['search']);
		});

		it('directUrl is scoped to screenshot, extractStyleguide, extractFonts', () => {
			const field = getAdditionalField(webDescription, 'directUrl')!;
			const ops = additionalFieldShowsFor(field);
			expect(ops).toContain('screenshot');
			expect(ops).toContain('extractStyleguide');
			expect(ops).toContain('extractFonts');
		});
	});

	// ─── Routing key names match API param names ──────────────────────────────

	describe('routing key names match API param names', () => {
		it('GET url field sends key "url"', () => {
			const getUrlField = getAllTopFields(webDescription, 'url').find(
				(f) =>
					showsForOperations(f).includes('scrapeMd') && !showsForOperations(f).includes('crawl'),
			)!;
			expect(qsKeyFor(getUrlField)).toBe('url');
		});

		it('POST url field sends key "url"', () => {
			const postUrlField = getAllTopFields(webDescription, 'url').find((f) =>
				showsForOperations(f).includes('crawl'),
			)!;
			expect(bodyKeyFor(postUrlField)).toBe('url');
		});

		it('domain field sends key "domain"', () => {
			const domainField = getAllTopFields(webDescription, 'domain').find((f) =>
				showsForOperations(f).includes('scrapeSitemap'),
			)!;
			expect(qsKeyFor(domainField)).toBe('domain');
		});

		it('query field sends key "query"', () => {
			const field = getTopField(webDescription, 'query')!;
			expect(bodyKeyFor(field)).toBe('query');
		});

		it('schema field sends key "schema"', () => {
			const field = getTopField(webDescription, 'schema')!;
			expect(bodyKeyFor(field)).toBe('schema');
		});
	});

	// ─── All fields have defaults ──────────────────────────────────────────────

	describe('all fields have a default value', () => {
		it('no top-level field is missing default', () => {
			const missing = webDescription
				.filter((p) => p.name !== 'operation')
				.filter((p) => p.default === undefined);
			expect(missing.map((p) => p.name)).toEqual([]);
		});
	});

	// ─── Selector & header params (SDK 1.34) — wire-contract guarantees ─────────
	//
	// The OpenAPI marks includeSelectors/excludeSelectors as style:deepObject, but the
	// official Stainless SDK ignores style/explode and serializes EVERY query param via
	// qs.stringify(query, { arrayFormat: 'comma' }). So the real server contract is
	// comma-joined:  includeSelectors: ['a','b']  ->  includeSelectors=a%2Cb
	// n8n uses the same qs lib, so arrayFormat:'comma' on the GET fields makes the node
	// byte-identical to the SDK. On crawl (POST) the params ride in the JSON body as a
	// plain array, so no qs/arrayFormat applies. These tests lock that contract.

	describe('selector & header params (SDK 1.34) — wire-contract guarantees', () => {
		describe.each(['includeSelectors', 'excludeSelectors'])('%s — GET ops (qs array)', (name) => {
			it('is scoped to scrapeMd + scrapeHtml', () => {
				const f = getAdditionalField(webDescription, name);
				expect(f).toBeDefined();
				expect(additionalFieldShowsFor(f!).sort()).toEqual(['scrapeHtml', 'scrapeMd']);
			});

			it(`routes to qs key "${name}"`, () => {
				expect(qsKeyFor(getAdditionalField(webDescription, name)!)).toBe(name);
			});

			it('sets arrayFormat "comma" (byte-identical to the SDK)', () => {
				expect(arrayFormatFor(getAdditionalField(webDescription, name)!)).toBe('comma');
			});

			it('splits the input into an array before serialization', () => {
				const f = getAdditionalField(webDescription, name)!;
				const expr = (f.routing!.request!.qs as Record<string, string>)[name];
				expect(expr).toContain('.split(",")');
			});
		});

		describe.each(['includeSelectorsPost', 'excludeSelectorsPost'])(
			'%s — crawl (JSON body array)',
			(name) => {
				const apiKey = name.replace('Post', '');

				it('is scoped to crawl only', () => {
					expect(additionalFieldShowsFor(getAdditionalField(webDescription, name)!)).toEqual([
						'crawl',
					]);
				});

				it(`routes to body key "${apiKey}"`, () => {
					expect(bodyKeyFor(getAdditionalField(webDescription, name)!)).toBe(apiKey);
				});

				it('does NOT set arrayFormat (body is JSON, not a query string)', () => {
					expect(arrayFormatFor(getAdditionalField(webDescription, name)!)).toBeUndefined();
				});
			},
		);

		describe('headers — deep-object map', () => {
			it('is a fixedCollection scoped to the four GET scrape ops', () => {
				const f = getAdditionalField(webDescription, 'headers')!;
				expect(f.type).toBe('fixedCollection');
				expect(additionalFieldShowsFor(f).sort()).toEqual([
					'scrapeHtml',
					'scrapeImages',
					'scrapeMd',
					'scrapeSitemap',
				]);
			});

			it('routes to qs key "headers"', () => {
				expect(qsKeyFor(getAdditionalField(webDescription, 'headers')!)).toBe('headers');
			});

			it('exposes Name and Value sub-fields', () => {
				const f = getAdditionalField(webDescription, 'headers')!;
				const values = (f.options as Array<{ values: Array<{ name: string }> }>)[0].values;
				expect(values.map((v) => v.name)).toEqual(['name', 'value']);
			});

			it('builds an object via Object.fromEntries (-> headers[Key]=Value)', () => {
				const f = getAdditionalField(webDescription, 'headers')!;
				const expr = (f.routing!.request!.qs as Record<string, string>).headers;
				expect(expr).toContain('Object.fromEntries');
			});
		});

		describe('useMainContentOnly extended to scrapeHtml (1.34)', () => {
			it('GET field shows for scrapeMd + scrapeHtml', () => {
				const f = getAdditionalField(webDescription, 'useMainContentOnly')!;
				expect(additionalFieldShowsFor(f).sort()).toEqual(['scrapeHtml', 'scrapeMd']);
			});
		});
	});

	// ─── extract gained maxDepth + maxPages (SDK 1.34) ──────────────────────────
	// These param names already existed on crawl, so they need operation-scoped
	// lookup. Extract's maxPages cap is 50; crawl's is 500 — distinct bounds.
	describe('extract crawl-control params (SDK 1.34)', () => {
		it('maxDepth is exposed for extract and routes to body', () => {
			const f = getAdditionalFieldFor(webDescription, 'maxDepth', 'extract');
			expect(f).toBeDefined();
			expect(bodyKeyFor(f!)).toBe('maxDepth');
		});

		it('maxPages is exposed for extract, routes to body, capped at 50', () => {
			const f = getAdditionalFieldFor(webDescription, 'maxPages', 'extract');
			expect(f).toBeDefined();
			expect(bodyKeyFor(f!)).toBe('maxPages');
			expect((f!.typeOptions as { maxValue?: number }).maxValue).toBe(50);
		});

		it('crawl maxPages keeps its own 500 cap (distinct bound)', () => {
			const f = getAdditionalFieldFor(webDescription, 'maxPages', 'crawl');
			expect((f!.typeOptions as { maxValue?: number }).maxValue).toBe(500);
		});
	});
});
