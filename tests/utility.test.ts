import { utilityDescription } from '../nodes/ContextDev/resources/utility';
import {
	getOperations,
	urlFor,
	methodFor,
	getTopField,
	getAdditionalField,
	usesBodyRouting,
	showsForOperations,
	bodyKeyFor,
} from './helpers';

describe('utility resource', () => {
	// ─── Existence ─────────────────────────────────────────────────────────────

	it('exists as an array (new resource — not in old node)', () => {
		expect(Array.isArray(utilityDescription)).toBe(true);
		expect(utilityDescription.length).toBeGreaterThan(0);
	});

	// ─── Operations ────────────────────────────────────────────────────────────

	describe('operations', () => {
		it('has exactly 2 operations', () => {
			expect(getOperations(utilityDescription)).toHaveLength(2);
		});

		it('has no duplicate operation values', () => {
			const values = getOperations(utilityDescription).map((o) => o.value);
			expect(new Set(values).size).toBe(values.length);
		});

		it('every operation has an action defined', () => {
			const missing = getOperations(utilityDescription).filter((o) => !o.action);
			expect(missing).toHaveLength(0);
		});

		it('operation property has noDataExpression: true', () => {
			const op = utilityDescription.find((p) => p.name === 'operation');
			expect(op?.noDataExpression).toBe(true);
		});
	});

	// ─── Routing ───────────────────────────────────────────────────────────────

	describe('routing', () => {
		it('prefetch → POST /brand/prefetch', () => {
			expect(methodFor(utilityDescription, 'prefetch')).toBe('POST');
			expect(urlFor(utilityDescription, 'prefetch')).toBe('/brand/prefetch');
		});

		it('prefetchByEmail → POST /brand/prefetch-by-email', () => {
			expect(methodFor(utilityDescription, 'prefetchByEmail')).toBe('POST');
			expect(urlFor(utilityDescription, 'prefetchByEmail')).toBe('/brand/prefetch-by-email');
		});
	});

	// ─── Required fields ───────────────────────────────────────────────────────

	describe('required fields', () => {
		it('domain exists and is required', () => {
			const field = getTopField(utilityDescription, 'domain');
			expect(field).toBeDefined();
			expect(field?.required).toBe(true);
		});

		it('email exists and is required', () => {
			const field = getTopField(utilityDescription, 'email');
			expect(field).toBeDefined();
			expect(field?.required).toBe(true);
		});
	});

	// ─── displayOptions scoping ────────────────────────────────────────────────

	describe('displayOptions scoping', () => {
		it('domain shows only for prefetch', () => {
			const field = getTopField(utilityDescription, 'domain')!;
			expect(showsForOperations(field)).toEqual(['prefetch']);
		});

		it('email shows only for prefetchByEmail', () => {
			const field = getTopField(utilityDescription, 'email')!;
			expect(showsForOperations(field)).toEqual(['prefetchByEmail']);
		});
	});

	// ─── Field routing ─────────────────────────────────────────────────────────

	describe('field routing — POST body', () => {
		it('domain uses body routing', () => {
			const field = getTopField(utilityDescription, 'domain')!;
			expect(usesBodyRouting(field)).toBe(true);
		});

		it('email uses body routing', () => {
			const field = getTopField(utilityDescription, 'email')!;
			expect(usesBodyRouting(field)).toBe(true);
		});
	});

	// ─── Field types ───────────────────────────────────────────────────────────

	describe('field types', () => {
		it('domain is type string', () => {
			expect(getTopField(utilityDescription, 'domain')?.type).toBe('string');
		});

		it('email is type string', () => {
			expect(getTopField(utilityDescription, 'email')?.type).toBe('string');
		});

		it('timeoutMS is type number', () => {
			expect(getAdditionalField(utilityDescription, 'timeoutMS')?.type).toBe('number');
		});
	});

	// ─── additionalFields ──────────────────────────────────────────────────────

	describe('additionalFields', () => {
		it('contains timeoutMS', () => {
			expect(getAdditionalField(utilityDescription, 'timeoutMS')).toBeDefined();
		});
	});

	// ─── Routing key names ────────────────────────────────────────────────────

	describe('routing key names match API param names', () => {
		it('domain field sends key "domain"', () => {
			const field = getTopField(utilityDescription, 'domain')!;
			expect(bodyKeyFor(field)).toBe('domain');
		});

		it('email field sends key "email"', () => {
			const field = getTopField(utilityDescription, 'email')!;
			expect(bodyKeyFor(field)).toBe('email');
		});
	});

	// ─── All fields have defaults ──────────────────────────────────────────────

	describe('all fields have a default value', () => {
		it('no top-level field is missing default', () => {
			const missing = utilityDescription
				.filter((p) => p.name !== 'operation')
				.filter((p) => p.default === undefined);
			expect(missing.map((p) => p.name)).toEqual([]);
		});
	});
});
