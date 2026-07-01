import type { INodeProperties } from 'n8n-workflow';
import { monitorsDescription } from '../nodes/ContextDev/resources/monitors';
import {
	getOperations,
	operationExists,
	urlFor,
	methodFor,
	getTopField,
	getAdditionalField,
	showsForOperations,
} from './helpers';

// ─── local helpers for send.property routing (monitors builds nested bodies this way) ─────────
const sendOf = (f?: INodeProperties) =>
	(f?.routing as { send?: { type?: string; property?: string; value?: string } } | undefined)?.send;

/** find a field by name anywhere: top-level or inside any collection's options */
const anyField = (name: string): INodeProperties | undefined =>
	getTopField(monitorsDescription, name) ?? getAdditionalField(monitorsDescription, name);

describe('monitors resource', () => {
	// ─── operations ────────────────────────────────────────────────────────────
	const OPS: [value: string, method: string, urlIncludes: string][] = [
		['create', 'POST', '/monitors'],
		['get', 'GET', '/monitors/'],
		['update', 'PATCH', '/monitors/'],
		['list', 'GET', '/monitors'],
		['delete', 'DELETE', '/monitors/'],
		['run', 'POST', '/run'],
		['listAccountChanges', 'GET', '/monitors/changes'],
		['listAccountRuns', 'GET', '/monitors/runs'],
		['listChanges', 'GET', '/changes'],
		['listRuns', 'GET', '/runs'],
		['getChange', 'GET', '/monitors/changes/'],
	];

	describe('operations', () => {
		it('has exactly 11 operations', () => {
			expect(getOperations(monitorsDescription)).toHaveLength(11);
		});

		it('has no duplicate operation values', () => {
			const vals = getOperations(monitorsDescription).map((o) => o.value);
			expect(new Set(vals).size).toBe(vals.length);
		});

		it('every operation defines an action (required for usableAsTool)', () => {
			for (const o of getOperations(monitorsDescription)) expect(o.action).toBeTruthy();
		});

		it.each(OPS)('%s → %s and url contains "%s"', (value, method, urlIncludes) => {
			expect(operationExists(monitorsDescription, value)).toBe(true);
			expect(methodFor(monitorsDescription, value)).toBe(method);
			expect(urlFor(monitorsDescription, value)).toContain(urlIncludes);
		});
	});

	// ─── path params ─────────────────────────────────────────────────────────────
	describe('path params', () => {
		it('monitorId is required and scoped to the id-bearing ops', () => {
			const f = getTopField(monitorsDescription, 'monitorId')!;
			expect(f).toBeDefined();
			expect(f.required).toBe(true);
			expect(showsForOperations(f).sort()).toEqual(
				['delete', 'get', 'listChanges', 'listRuns', 'run', 'update'].sort(),
			);
		});

		it('changeId is required and scoped to getChange', () => {
			const f = getTopField(monitorsDescription, 'changeId')!;
			expect(f).toBeDefined();
			expect(f.required).toBe(true);
			expect(showsForOperations(f)).toEqual(['getChange']);
		});

		it('id-bearing op URLs interpolate the id parameter', () => {
			for (const op of ['get', 'update', 'delete', 'run', 'listChanges', 'listRuns'])
				expect(urlFor(monitorsDescription, op)).toContain('$parameter["monitorId"]');
			expect(urlFor(monitorsDescription, 'getChange')).toContain('$parameter["changeId"]');
		});
	});

	// ─── create: discriminators + nested body via send.property ──────────────────
	describe('create — required core fields', () => {
		it('name is required, scoped to create, sends body "name"', () => {
			const f = getTopField(monitorsDescription, 'name')!;
			expect(f.required).toBe(true);
			expect(showsForOperations(f)).toEqual(['create']);
			expect(sendOf(f)).toMatchObject({ type: 'body', property: 'name' });
		});

		it('targetType is an options discriminator (page/sitemap/extract) → target.type', () => {
			const f = getTopField(monitorsDescription, 'targetType')!;
			expect(f.type).toBe('options');
			expect((f.options as { value: string }[]).map((o) => o.value).sort()).toEqual([
				'extract',
				'page',
				'sitemap',
			]);
			expect(sendOf(f)).toMatchObject({ type: 'body', property: 'target.type' });
			expect(showsForOperations(f)).toEqual(['create']);
		});

		it('targetUrl is required for create and sends target.url', () => {
			const f = getTopField(monitorsDescription, 'targetUrl')!;
			expect(f.required).toBe(true);
			expect(sendOf(f)).toMatchObject({ type: 'body', property: 'target.url' });
		});

		it('changeDetectionType is an options discriminator (exact/semantic) → change_detection.type', () => {
			const f = getTopField(monitorsDescription, 'changeDetectionType')!;
			expect(f.type).toBe('options');
			expect((f.options as { value: string }[]).map((o) => o.value).sort()).toEqual([
				'exact',
				'semantic',
			]);
			expect(sendOf(f)).toMatchObject({ type: 'body', property: 'change_detection.type' });
		});

		it('schedule frequency + unit send schedule.frequency / schedule.unit', () => {
			const freq = getTopField(monitorsDescription, 'scheduleFrequency')!;
			const unit = getTopField(monitorsDescription, 'scheduleUnit')!;
			expect(freq.type).toBe('number');
			expect(sendOf(freq)).toMatchObject({ type: 'body', property: 'schedule.frequency' });
			expect((unit.options as { value: string }[]).map((o) => o.value).sort()).toEqual([
				'days',
				'hours',
				'minutes',
			]);
			expect(sendOf(unit)).toMatchObject({ type: 'body', property: 'schedule.unit' });
		});

		it('schedule.type is sent as the constant "interval" via a hidden field', () => {
			const f = getTopField(monitorsDescription, 'scheduleType')!;
			expect(f.type).toBe('hidden');
			expect(f.default).toBe('interval');
			expect(sendOf(f)).toMatchObject({ type: 'body', property: 'schedule.type' });
		});
	});

	describe('create — conditional target sub-fields', () => {
		it('normalizeWhitespace shows only for target page → target.normalize_whitespace', () => {
			const f = getTopField(monitorsDescription, 'normalizeWhitespace')!;
			expect(f.type).toBe('boolean');
			expect((f.displayOptions?.show as Record<string, string[]>).targetType).toEqual(['page']);
			expect(sendOf(f)).toMatchObject({ property: 'target.normalize_whitespace' });
		});

		it('followSubdomains + instructions + schema show only for target extract', () => {
			for (const [name, prop] of [
				['followSubdomains', 'target.follow_subdomains'],
				['extractPrompt', 'target.instructions'],
				['extractSchema', 'target.schema'],
			] as const) {
				const f = getTopField(monitorsDescription, name)!;
				expect((f.displayOptions?.show as Record<string, string[]>).targetType).toEqual(['extract']);
				expect(sendOf(f)!.property).toBe(prop);
			}
		});

		it('extractSchema parses JSON before sending', () => {
			const f = getTopField(monitorsDescription, 'extractSchema')!;
			expect(f.type).toBe('json');
			expect(sendOf(f)!.value).toContain('JSON.parse');
		});

		it('extract max depth / max pages show only for target extract, as numbers', () => {
			for (const [name, prop] of [
				['extractMaxDepth', 'target.max_depth'],
				['extractMaxPages', 'target.max_pages'],
			] as const) {
				const f = getTopField(monitorsDescription, name)!;
				expect(f).toBeDefined();
				expect(f.type).toBe('number');
				expect((f.displayOptions?.show as Record<string, string[]>).targetType).toEqual(['extract']);
				expect(sendOf(f)!.property).toBe(prop);
			}
		});

		it('sitemap exclude/include/max_urls show only for target sitemap', () => {
			const exclude = getTopField(monitorsDescription, 'sitemapExclude')!;
			expect(exclude).toBeDefined();
			expect((exclude.displayOptions?.show as Record<string, string[]>).targetType).toEqual([
				'sitemap',
			]);
			expect(sendOf(exclude)!.property).toBe('target.exclude');
			expect(sendOf(exclude)!.value).toContain('split');

			const include = getTopField(monitorsDescription, 'sitemapInclude')!;
			expect(include).toBeDefined();
			expect((include.displayOptions?.show as Record<string, string[]>).targetType).toEqual([
				'sitemap',
			]);
			expect(sendOf(include)!.property).toBe('target.include');
			expect(sendOf(include)!.value).toContain('split');

			const maxUrls = getTopField(monitorsDescription, 'sitemapMaxUrls')!;
			expect(maxUrls).toBeDefined();
			expect(maxUrls.type).toBe('number');
			expect((maxUrls.displayOptions?.show as Record<string, string[]>).targetType).toEqual([
				'sitemap',
			]);
			expect(sendOf(maxUrls)!.property).toBe('target.max_urls');
		});
	});

	describe('create — conditional semantic fields', () => {
		it('semanticQuery shows only for semantic detection → change_detection.query, required', () => {
			const f = getTopField(monitorsDescription, 'semanticQuery')!;
			expect((f.displayOptions?.show as Record<string, string[]>).changeDetectionType).toEqual([
				'semantic',
			]);
			expect(f.required).toBe(true);
			expect(sendOf(f)!.property).toBe('change_detection.query');
		});

		it('confidenceThreshold shows only for semantic → change_detection.confidence_threshold', () => {
			const f = getTopField(monitorsDescription, 'confidenceThreshold')!;
			expect(f.type).toBe('number');
			expect((f.displayOptions?.show as Record<string, string[]>).changeDetectionType).toEqual([
				'semantic',
			]);
			expect(sendOf(f)!.property).toBe('change_detection.confidence_threshold');
		});
	});

	describe('create — optional webhook + tags', () => {
		it('webhookUrl sends webhook.url', () => {
			const f = getAdditionalField(monitorsDescription, 'webhookUrl')!;
			expect(f).toBeDefined();
			expect(sendOf(f)!.property).toBe('webhook.url');
		});

		it('tags splits csv into a string array on body key "tags"', () => {
			const f = getAdditionalField(monitorsDescription, 'tags')!;
			expect(f).toBeDefined();
			const body = f.routing?.request?.body as Record<string, string> | undefined;
			const send = sendOf(f);
			const expr = body?.tags ?? send?.value ?? '';
			expect(expr).toContain('split');
		});
	});

	// ─── update: all-optional mutable fields ─────────────────────────────────────
	describe('update fields', () => {
		it('status is options active/paused → body "status"', () => {
			const f = anyField('updStatus')!;
			expect(f).toBeDefined();
			expect((f.options as { value: string }[]).map((o) => o.value).sort()).toEqual([
				'active',
				'paused',
			]);
			expect(sendOf(f)!.property).toBe('status');
		});

		it('update fields collection is scoped to the update operation only', () => {
			const coll = monitorsDescription.find(
				(p) => p.name === 'additionalFields' && showsForOperations(p).includes('update'),
			)!;
			expect(showsForOperations(coll)).toEqual(['update']);
		});

		it.each([
			['updName', 'name'],
			['updWebhookUrl', 'webhook.url'],
			['updQuery', 'change_detection.query'],
			['updExtractInstructions', 'target.instructions'],
			['updExtractSchema', 'target.schema'],
		])('update field %s sends body path %s', (name, prop) => {
			const f = anyField(name)!;
			expect(f).toBeDefined();
			expect(sendOf(f)!.property).toBe(prop);
		});

		it('update extract schema is JSON and parses before sending', () => {
			const f = anyField('updExtractSchema')!;
			expect(f.type).toBe('json');
			expect(sendOf(f)!.value).toContain('JSON.parse');
		});

		it('update schedule is a fixedCollection that always injects the required schedule.type', () => {
			const f = anyField('updSchedule')!;
			expect(f).toBeDefined();
			expect(f.type).toBe('fixedCollection');
			const expr = (f.routing?.request?.body as Record<string, string>).schedule;
			expect(expr).toContain('type: "interval"');
			expect(expr).toContain('frequency');
			expect(expr).toContain('unit');
		});

		it('updWebhookRemove clears the webhook by sending null', () => {
			const f = anyField('updWebhookRemove')!;
			expect(f).toBeDefined();
			expect(f.type).toBe('boolean');
			expect((f.routing?.request?.body as Record<string, string>).webhook).toContain('null');
		});

		it('updChangeDetectionType is an options discriminator (exact/semantic) → change_detection.type', () => {
			const f = anyField('updChangeDetectionType')!;
			expect(f).toBeDefined();
			expect(f.type).toBe('options');
			expect((f.options as { value: string }[]).map((o) => o.value).sort()).toEqual([
				'exact',
				'semantic',
			]);
			expect(sendOf(f)!.property).toBe('change_detection.type');
		});

		it('updTargetType is an options discriminator (page/sitemap/extract) → target.type', () => {
			const f = anyField('updTargetType')!;
			expect(f).toBeDefined();
			expect(f.type).toBe('options');
			expect((f.options as { value: string }[]).map((o) => o.value).sort()).toEqual([
				'extract',
				'page',
				'sitemap',
			]);
			expect(sendOf(f)!.property).toBe('target.type');
		});

		it.each([
			['updSitemapMaxUrls', 'target.max_urls'],
			['updExtractMaxDepth', 'target.max_depth'],
			['updExtractMaxPages', 'target.max_pages'],
			['updExtractInstructions', 'target.instructions'],
		])('update parity field %s sends body path %s', (name, prop) => {
			const f = anyField(name)!;
			expect(f).toBeDefined();
			expect(sendOf(f)!.property).toBe(prop);
		});

		it.each([
			['updSitemapExclude', 'target.exclude'],
			['updSitemapInclude', 'target.include'],
		])('update parity field %s splits csv into %s', (name, prop) => {
			const f = anyField(name)!;
			expect(f).toBeDefined();
			expect(sendOf(f)!.property).toBe(prop);
			expect(sendOf(f)!.value).toContain('split');
		});
	});

	// ─── list / changes / runs filters + pagination ──────────────────────────────
	describe('list filters', () => {
		it.each([
			['status', ['active', 'failed', 'paused']],
			['target_type', ['extract', 'page', 'sitemap']],
			['change_detection_type', ['exact', 'semantic']],
		])('list %s filter is an options field with the SDK enum', (key, values) => {
			const f = getAdditionalField(monitorsDescription, key)!;
			expect(f).toBeDefined();
			expect((f.options as { value: string }[]).map((o) => o.value).sort()).toEqual(values);
			expect((f.routing?.request?.qs as Record<string, string>)[key]).toBeDefined();
		});

		it('run-status filters use the run enum queued/running/completed/failed', () => {
			const f = anyField('runStatus')!;
			expect(f).toBeDefined();
			expect((f.options as { value: string }[]).map((o) => o.value).sort()).toEqual([
				'completed',
				'failed',
				'queued',
				'running',
			]);
		});

		it('cursor + limit pagination exist and route to qs', () => {
			for (const key of ['cursor', 'limit']) {
				const f = getAdditionalField(monitorsDescription, key)!;
				expect(f).toBeDefined();
				expect((f.routing?.request?.qs as Record<string, string>)[key]).toBeDefined();
			}
		});

		it('since/until/tag/monitor_id filters route to qs', () => {
			for (const key of ['since', 'until', 'tag', 'monitor_id']) {
				const f = getAdditionalField(monitorsDescription, key)!;
				expect(f).toBeDefined();
				expect((f.routing?.request?.qs as Record<string, string>)[key]).toBeDefined();
			}
		});
	});
});
