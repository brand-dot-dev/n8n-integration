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
	sendPropertyFor,
	sendTypeFor,
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

		it('directUrl is scoped to screenshot, styleguide, fonts (NOT competitors — SDK has no directUrl there)', () => {
			const field = getAdditionalField(webDescription, 'directUrl')!;
			const ops = additionalFieldShowsFor(field);
			expect(ops.sort()).toEqual(['extractFonts', 'extractStyleguide', 'screenshot']);
			expect(ops).not.toContain('extractCompetitors');
		});

		it('visual-op domain is NOT required and omits empty values (enables directUrl-only)', () => {
			const domain = getAllTopFields(webDescription, 'domain').find((f) =>
				showsForOperations(f).includes('screenshot'),
			)!;
			expect(domain.required).not.toBe(true);
			expect((domain.routing?.request?.qs as Record<string, string>).domain).toContain('|| undefined');
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

	// ─── nested + flat param additions (SDK sync) ───────────────────────────────
	const subNames = (f?: { options?: unknown }) =>
		((f?.options as { name: string }[] | undefined) ?? []).map((o) => o.name).sort();

	describe('pdf nested collection', () => {
		it('GET pdf (scrapeMd/scrapeHtml) is a collection routing qs key "pdf"', () => {
			const f = getAdditionalFieldFor(webDescription, 'pdf', 'scrapeMd')!;
			expect(f.type).toBe('collection');
			expect(additionalFieldShowsFor(f)).toEqual(['scrapeMd', 'scrapeHtml']);
			expect(qsKeyFor(f)).toBe('pdf');
			expect(subNames(f)).toEqual(['end', 'shouldParse', 'start']);
		});

		it('crawl pdf routes to body key "pdf", scoped to crawl only', () => {
			const f = getAdditionalFieldFor(webDescription, 'pdfPost', 'crawl')!;
			expect(f.type).toBe('collection');
			expect(bodyKeyFor(f)).toBe('pdf');
			expect(additionalFieldShowsFor(f)).toEqual(['crawl']);
			expect(subNames(f)).toEqual(['end', 'shouldParse', 'start']);
		});

		it('extract pdf routes to body key "pdf", scoped to extract, with all sub-fields', () => {
			const f = getAdditionalFieldFor(webDescription, 'pdf', 'extract')!;
			expect(f.type).toBe('collection');
			expect(bodyKeyFor(f)).toBe('pdf');
			expect(additionalFieldShowsFor(f)).toEqual(['extract']);
			expect(subNames(f)).toEqual(['end', 'shouldParse', 'start']);
		});
	});

	describe('enrichment nested collection (scrapeImages)', () => {
		it('is a collection scoped to scrapeImages routing qs key "enrichment"', () => {
			const f = getAdditionalField(webDescription, 'enrichment')!;
			expect(f.type).toBe('collection');
			expect(additionalFieldShowsFor(f)).toEqual(['scrapeImages']);
			expect(qsKeyFor(f)).toBe('enrichment');
			expect(subNames(f)).toEqual(['classification', 'hostedUrl', 'maxTimePerMs', 'resolution']);
		});
	});

	describe('shortenBase64Images', () => {
		it('GET variant (scrapeMd) routes to qs, scoped to scrapeMd only', () => {
			const f = getAdditionalFieldFor(webDescription, 'shortenBase64Images', 'scrapeMd')!;
			expect(f.type).toBe('boolean');
			expect(qsKeyFor(f)).toBe('shortenBase64Images');
			expect(additionalFieldShowsFor(f)).toEqual(['scrapeMd']);
		});

		it('POST variant (crawl) routes to body, scoped to crawl only', () => {
			const f = getAdditionalFieldFor(webDescription, 'shortenBase64ImagesPost', 'crawl')!;
			expect(bodyKeyFor(f)).toBe('shortenBase64Images');
			expect(additionalFieldShowsFor(f)).toEqual(['crawl']);
		});
	});

	describe('viewport nested collection (screenshot)', () => {
		it('is a collection scoped to screenshot routing qs key "viewport"', () => {
			const f = getAdditionalField(webDescription, 'viewport')!;
			expect(f.type).toBe('collection');
			expect(additionalFieldShowsFor(f)).toEqual(['screenshot']);
			expect(qsKeyFor(f)).toBe('viewport');
			expect(subNames(f)).toEqual(['height', 'width']);
		});
	});

	// ─── SDK 1.41 web params (colorScheme, country, numResults, scrollOffset) ────
	describe('colorScheme (SDK 1.41)', () => {
		it('is an options field offering light + dark', () => {
			const f = getAdditionalField(webDescription, 'colorScheme')!;
			expect(f).toBeDefined();
			expect(f.type).toBe('options');
			const values = (f.options as { value: string }[]).map((o) => o.value);
			expect(values).toContain('light');
			expect(values).toContain('dark');
		});

		it('is scoped to screenshot + extractStyleguide and routes to qs key "colorScheme"', () => {
			const f = getAdditionalField(webDescription, 'colorScheme')!;
			expect(additionalFieldShowsFor(f).sort()).toEqual(['extractStyleguide', 'screenshot']);
			expect(qsKeyFor(f)).toBe('colorScheme');
		});

		it('defaults to "" (Auto)', () => {
			expect(getAdditionalField(webDescription, 'colorScheme')!.default).toBe('');
		});
	});

	describe('scrollOffset (SDK 1.41)', () => {
		it('is a number scoped to screenshot, routing qs key "scrollOffset"', () => {
			const f = getAdditionalField(webDescription, 'scrollOffset')!;
			expect(f).toBeDefined();
			expect(f.type).toBe('number');
			expect(additionalFieldShowsFor(f)).toEqual(['screenshot']);
			expect(qsKeyFor(f)).toBe('scrollOffset');
		});

		it('bounds match SDK (0..100000, default 0)', () => {
			const f = getAdditionalField(webDescription, 'scrollOffset')!;
			expect(f.default).toBe(0);
			expect((f.typeOptions as { minValue?: number; maxValue?: number }).minValue).toBe(0);
			expect((f.typeOptions as { minValue?: number; maxValue?: number }).maxValue).toBe(100000);
		});
	});

	describe('numResults (SDK 1.41)', () => {
		it('is a number scoped to search, routing body key "numResults"', () => {
			const f = getAdditionalField(webDescription, 'numResults')!;
			expect(f).toBeDefined();
			expect(f.type).toBe('number');
			expect(additionalFieldShowsFor(f)).toEqual(['search']);
			expect(bodyKeyFor(f)).toBe('numResults');
		});

		it('bounds match SDK (10..100, default 10)', () => {
			const f = getAdditionalField(webDescription, 'numResults')!;
			expect(f.default).toBe(10);
			expect((f.typeOptions as { minValue?: number; maxValue?: number }).minValue).toBe(10);
			expect((f.typeOptions as { minValue?: number; maxValue?: number }).maxValue).toBe(100);
		});
	});

	describe('country (SDK 1.41)', () => {
		// exact op×routing matrix from the SDK: qs for GET ops, body for POST ops.
		// The two GET scrape ops share one qs field; screenshot/crawl/search each get their own.
		const cases: [op: string, fieldName: string, loc: 'qs' | 'body', show: string[]][] = [
			['scrapeMd', 'country', 'qs', ['scrapeMd', 'scrapeHtml']],
			['scrapeHtml', 'country', 'qs', ['scrapeMd', 'scrapeHtml']],
			['screenshot', 'country', 'qs', ['screenshot']],
			['crawl', 'countryPost', 'body', ['crawl']],
			['search', 'country', 'body', ['search']],
		];

		it.each(cases)('%s: string field routes country via %s with exact scoping', (op, name, loc, show) => {
			const f = getAdditionalFieldFor(webDescription, name, op)!;
			expect(f).toBeDefined();
			expect(f.type).toBe('string');
			expect(f.default).toBe('');
			expect(additionalFieldShowsFor(f).sort()).toEqual([...show].sort());
			if (loc === 'qs') expect(qsKeyFor(f)).toBe('country');
			else expect(bodyKeyFor(f)).toBe('country');
		});

		it('country is NOT offered for extractStyleguide (SDK has no country there)', () => {
			expect(getAdditionalFieldFor(webDescription, 'country', 'extractStyleguide')).toBeUndefined();
			expect(getAdditionalFieldFor(webDescription, 'countryPost', 'extractStyleguide')).toBeUndefined();
		});
	});

	// ─── search markdownOptions sub-fields (capability drop fix) ────────────────
	// markdownEnabled only ever sent markdownOptions.enabled — once a user turned
	// scraping on for search results, there was no way to configure it. These
	// fields expose the rest of WebSearchParams.MarkdownOptions from the SDK.

	describe('search markdownOptions sub-fields', () => {
		const booleanCases: [name: string, apiPath: string][] = [
			['markdownIncludeFrames', 'markdownOptions.includeFrames'],
			['markdownIncludeImages', 'markdownOptions.includeImages'],
			['markdownIncludeLinks', 'markdownOptions.includeLinks'],
			['markdownUseMainContentOnly', 'markdownOptions.useMainContentOnly'],
			['markdownShortenBase64Images', 'markdownOptions.shortenBase64Images'],
		];

		it.each(booleanCases)('%s is a boolean scoped to search, sending body via "%s"', (name, apiPath) => {
			const f = getAdditionalField(webDescription, name);
			expect(f).toBeDefined();
			expect(f!.type).toBe('boolean');
			expect(additionalFieldShowsFor(f!)).toEqual(['search']);
			expect(sendTypeFor(f!)).toBe('body');
			expect(sendPropertyFor(f!)).toBe(apiPath);
		});

		const numberCases: [name: string, apiPath: string][] = [
			['markdownMaxAgeMs', 'markdownOptions.maxAgeMs'],
			['markdownTimeoutMS', 'markdownOptions.timeoutMS'],
			['markdownWaitForMs', 'markdownOptions.waitForMs'],
		];

		it.each(numberCases)('%s is a number scoped to search, sending body via "%s"', (name, apiPath) => {
			const f = getAdditionalField(webDescription, name);
			expect(f).toBeDefined();
			expect(f!.type).toBe('number');
			expect(additionalFieldShowsFor(f!)).toEqual(['search']);
			expect(sendTypeFor(f!)).toBe('body');
			expect(sendPropertyFor(f!)).toBe(apiPath);
		});

		it('all markdownOptions sub-fields only display when markdownEnabled is true', () => {
			const names = [...booleanCases, ...numberCases].map(([name]) => name);
			for (const name of names) {
				const f = getAdditionalField(webDescription, name)!;
				const show = f.displayOptions?.show as Record<string, unknown> | undefined;
				expect(show?.['/markdownEnabled']).toEqual([true]);
			}
		});

		describe('markdownPdf nested collection', () => {
			it('is a collection scoped to search, sending body via "markdownOptions.pdf"', () => {
				const f = getAdditionalField(webDescription, 'markdownPdf');
				expect(f).toBeDefined();
				expect(f!.type).toBe('collection');
				expect(additionalFieldShowsFor(f!)).toEqual(['search']);
				expect(sendTypeFor(f!)).toBe('body');
				expect(sendPropertyFor(f!)).toBe('markdownOptions.pdf');
			});

			it('exposes start, end, shouldParse sub-fields (matches SDK MarkdownOptions.Pdf)', () => {
				const f = getAdditionalField(webDescription, 'markdownPdf')!;
				const names = (f.options as { name: string }[]).map((o) => o.name).sort();
				expect(names).toEqual(['end', 'shouldParse', 'start']);
			});

			it('only displays when markdownEnabled is true', () => {
				const f = getAdditionalField(webDescription, 'markdownPdf')!;
				const show = f.displayOptions?.show as Record<string, unknown> | undefined;
				expect(show?.['/markdownEnabled']).toEqual([true]);
			});
		});
	});
});
