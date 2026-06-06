import { industryDescription } from '../nodes/ContextDev/resources/industry';
import {
	getOperations,
	urlFor,
	methodFor,
	allUrls,
	getTopField,
	getAdditionalField,
	usesQsRouting,
	showsForOperations,
	additionalFieldShowsFor,
	qsKeyFor,
} from './helpers';

describe('industry resource', () => {
	// ─── Operations ────────────────────────────────────────────────────────────

	describe('operations', () => {
		it('has exactly 2 operations', () => {
			expect(getOperations(industryDescription)).toHaveLength(2);
		});

		it('has no duplicate operation values', () => {
			const values = getOperations(industryDescription).map((o) => o.value);
			expect(new Set(values).size).toBe(values.length);
		});

		it('every operation has an action defined', () => {
			const missing = getOperations(industryDescription).filter((o) => !o.action);
			expect(missing).toHaveLength(0);
		});

		it('operation property has noDataExpression: true', () => {
			const op = industryDescription.find((p) => p.name === 'operation');
			expect(op?.noDataExpression).toBe(true);
		});
	});

	// ─── Routing — correct URLs ────────────────────────────────────────────────

	describe('routing — correct URLs', () => {
		it('retrieveNaics → GET /web/naics', () => {
			expect(methodFor(industryDescription, 'retrieveNaics')).toBe('GET');
			expect(urlFor(industryDescription, 'retrieveNaics')).toBe('/web/naics');
		});

		it('retrieveSic → GET /web/sic', () => {
			expect(methodFor(industryDescription, 'retrieveSic')).toBe('GET');
			expect(urlFor(industryDescription, 'retrieveSic')).toBe('/web/sic');
		});
	});

	// ─── Migration — old wrong URLs are gone ──────────────────────────────────

	describe('migration — old wrong URLs do not exist', () => {
		it('no operation routes to /brand/naics (old)', () => {
			expect(allUrls(industryDescription)).not.toContain('/brand/naics');
		});

		it('no operation routes to /brand/sic (old)', () => {
			expect(allUrls(industryDescription)).not.toContain('/brand/sic');
		});
	});

	// ─── Required fields ───────────────────────────────────────────────────────

	describe('required fields', () => {
		it('input field exists and is required', () => {
			const field = getTopField(industryDescription, 'input');
			expect(field).toBeDefined();
			expect(field?.required).toBe(true);
		});

		it('input is type string', () => {
			expect(getTopField(industryDescription, 'input')?.type).toBe('string');
		});

		it('input uses qs routing', () => {
			const field = getTopField(industryDescription, 'input')!;
			expect(usesQsRouting(field)).toBe(true);
		});
	});

	// ─── displayOptions scoping ────────────────────────────────────────────────

	describe('displayOptions scoping', () => {
		it('input shows for both retrieveNaics and retrieveSic', () => {
			const field = getTopField(industryDescription, 'input')!;
			const ops = showsForOperations(field);
			expect(ops).toContain('retrieveNaics');
			expect(ops).toContain('retrieveSic');
		});

		it('SIC type param only shows for retrieveSic', () => {
			const field = getAdditionalField(industryDescription, 'type')!;
			expect(additionalFieldShowsFor(field)).toEqual(['retrieveSic']);
		});
	});

	// ─── additionalFields ──────────────────────────────────────────────────────

	describe('additionalFields', () => {
		it('contains maxResults', () => {
			expect(getAdditionalField(industryDescription, 'maxResults')).toBeDefined();
		});

		it('maxResults is type number', () => {
			expect(getAdditionalField(industryDescription, 'maxResults')?.type).toBe('number');
		});

		it('contains minResults', () => {
			expect(getAdditionalField(industryDescription, 'minResults')).toBeDefined();
		});

		it('SIC dataset type param has original_sic and latest_sec options', () => {
			const field = getAdditionalField(industryDescription, 'type')!;
			expect(field).toBeDefined();
			const values = (field.options as { value: string }[]).map((o) => o.value);
			expect(values).toContain('original_sic');
			expect(values).toContain('latest_sec');
		});

		it('contains timeoutMS', () => {
			expect(getAdditionalField(industryDescription, 'timeoutMS')).toBeDefined();
		});
	});

	// ─── Routing key names ────────────────────────────────────────────────────

	describe('routing key names match API param names', () => {
		it('input field sends key "input"', () => {
			const field = getTopField(industryDescription, 'input')!;
			expect(qsKeyFor(field)).toBe('input');
		});
	});

	// ─── All fields have defaults ──────────────────────────────────────────────

	describe('all fields have a default value', () => {
		it('no top-level field is missing default', () => {
			const missing = industryDescription
				.filter((p) => p.name !== 'operation')
				.filter((p) => p.default === undefined);
			expect(missing.map((p) => p.name)).toEqual([]);
		});
	});
});
