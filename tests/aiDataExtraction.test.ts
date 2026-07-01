import { aiDataExtractionDescription } from '../nodes/ContextDev/resources/aiDataExtraction';
import {
	getOperations,
	urlFor,
	methodFor,
	getTopField,
	getAllTopFields,
	getAdditionalField,
	usesBodyRouting,
	showsForOperations,
	additionalFieldShowsFor,
	getFixedCollectionValues,
	bodyKeyFor,
} from './helpers';

describe('aiDataExtraction resource', () => {
	// ─── Operations ────────────────────────────────────────────────────────────

	describe('operations', () => {
		it('has exactly 3 operations', () => {
			expect(getOperations(aiDataExtractionDescription)).toHaveLength(3);
		});

		it('has no duplicate operation values', () => {
			const values = getOperations(aiDataExtractionDescription).map((o) => o.value);
			expect(new Set(values).size).toBe(values.length);
		});

		it('every operation has an action defined (required for usableAsTool)', () => {
			const missing = getOperations(aiDataExtractionDescription).filter((o) => !o.action);
			expect(missing).toHaveLength(0);
		});

		it('operation property has noDataExpression: true', () => {
			const op = aiDataExtractionDescription.find((p) => p.name === 'operation');
			expect(op?.noDataExpression).toBe(true);
		});
	});

	// ─── Routing ───────────────────────────────────────────────────────────────

	describe('routing', () => {
		const cases: [string, string, string][] = [
			['aiQuery', 'POST', '/brand/ai/query'],
			['extractProducts', 'POST', '/brand/ai/products'],
			['extractProduct', 'POST', '/brand/ai/product'],
		];

		test.each(cases)('%s → %s %s', (op, method, url) => {
			expect(methodFor(aiDataExtractionDescription, op)).toBe(method);
			expect(urlFor(aiDataExtractionDescription, op)).toBe(url);
		});
	});

	// ─── Required fields ───────────────────────────────────────────────────────

	describe('required fields', () => {
		it('domain is required for aiQuery', () => {
			const field = getAllTopFields(aiDataExtractionDescription, 'domain').find((f) =>
				showsForOperations(f).includes('aiQuery'),
			);
			expect(field?.required).toBe(true);
		});

		it('domain is optional for extractProducts (directUrl is an alternative)', () => {
			const field = getAllTopFields(aiDataExtractionDescription, 'domain').find((f) =>
				showsForOperations(f).includes('extractProducts'),
			);
			expect(field?.required).toBeFalsy();
		});

		it('directUrl is optional for extractProducts (domain is an alternative)', () => {
			const field = getTopField(aiDataExtractionDescription, 'directUrl');
			expect(field?.required).toBeFalsy();
		});

		it('url is required for extractProduct', () => {
			const field = getTopField(aiDataExtractionDescription, 'url');
			expect(field?.required).toBe(true);
		});

		it('data_to_extract is required for aiQuery', () => {
			const field = getTopField(aiDataExtractionDescription, 'data_to_extract');
			expect(field?.required).toBe(true);
		});
	});

	// ─── displayOptions scoping ────────────────────────────────────────────────

	describe('displayOptions scoping', () => {
		it('domain (aiQuery variant) shows only for aiQuery', () => {
			const domainField = getAllTopFields(aiDataExtractionDescription, 'domain').find((f) =>
				showsForOperations(f).includes('aiQuery'),
			)!;
			expect(showsForOperations(domainField)).toEqual(['aiQuery']);
		});

		it('domain (extractProducts variant) shows only for extractProducts', () => {
			const domainField = getAllTopFields(aiDataExtractionDescription, 'domain').find((f) =>
				showsForOperations(f).includes('extractProducts'),
			)!;
			expect(showsForOperations(domainField)).toEqual(['extractProducts']);
		});

		it('directUrl shows only for extractProducts', () => {
			const field = getTopField(aiDataExtractionDescription, 'directUrl')!;
			expect(showsForOperations(field)).toEqual(['extractProducts']);
		});

		it('url shows only for extractProduct', () => {
			const field = getTopField(aiDataExtractionDescription, 'url')!;
			expect(showsForOperations(field)).toEqual(['extractProduct']);
		});

		it('data_to_extract shows only for aiQuery', () => {
			const field = getTopField(aiDataExtractionDescription, 'data_to_extract')!;
			expect(showsForOperations(field)).toEqual(['aiQuery']);
		});
	});

	// ─── Field routing ─────────────────────────────────────────────────────────

	describe('field routing — all POST, all body', () => {
		it('domain uses body routing', () => {
			const field = getAllTopFields(aiDataExtractionDescription, 'domain').find((f) =>
				showsForOperations(f).includes('aiQuery'),
			)!;
			expect(usesBodyRouting(field)).toBe(true);
		});

		it('url uses body routing', () => {
			const field = getTopField(aiDataExtractionDescription, 'url')!;
			expect(usesBodyRouting(field)).toBe(true);
		});

		it('data_to_extract uses body routing', () => {
			const field = getTopField(aiDataExtractionDescription, 'data_to_extract')!;
			expect(usesBodyRouting(field)).toBe(true);
		});

		it('directUrl uses body routing to directUrl', () => {
			const field = getTopField(aiDataExtractionDescription, 'directUrl')!;
			expect(usesBodyRouting(field)).toBe(true);
			expect(bodyKeyFor(field)).toBe('directUrl');
		});
	});

	// ─── data_to_extract fixedCollection ──────────────────────────────────────

	describe('data_to_extract fixedCollection', () => {
		it('is type fixedCollection', () => {
			const field = getTopField(aiDataExtractionDescription, 'data_to_extract');
			expect(field?.type).toBe('fixedCollection');
		});

		it('has multipleValues: true', () => {
			const field = getTopField(aiDataExtractionDescription, 'data_to_extract');
			expect(field?.typeOptions?.multipleValues).toBe(true);
		});

		it('datapoint_type options include text, number, date, boolean, list, url', () => {
			const values = getFixedCollectionValues(aiDataExtractionDescription, 'data_to_extract');
			const typeField = values.find((v) => v.name === 'datapoint_type');
			expect(typeField).toBeDefined();
			const optionValues = (typeField!.options as { value: string }[]).map((o) => o.value);
			expect(optionValues).toContain('text');
			expect(optionValues).toContain('number');
			expect(optionValues).toContain('date');
			expect(optionValues).toContain('boolean');
			expect(optionValues).toContain('list');
			expect(optionValues).toContain('url');
		});

		it('datapoint_list_type field exists (for when type is list)', () => {
			const values = getFixedCollectionValues(aiDataExtractionDescription, 'data_to_extract');
			expect(values.find((v) => v.name === 'datapoint_list_type')).toBeDefined();
		});

		it('datapoint_list_type offers the full SDK enum incl. list + text', () => {
			const values = getFixedCollectionValues(aiDataExtractionDescription, 'data_to_extract');
			const lt = values.find((v) => v.name === 'datapoint_list_type')!;
			const opts = (lt.options as { value: string }[]).map((o) => o.value).sort();
			expect(opts).toEqual(['boolean', 'date', 'list', 'number', 'object', 'string', 'text', 'url']);
		});

		it('has datapoint_name, datapoint_description, datapoint_example fields', () => {
			const values = getFixedCollectionValues(aiDataExtractionDescription, 'data_to_extract');
			const names = values.map((v) => v.name);
			expect(names).toContain('datapoint_name');
			expect(names).toContain('datapoint_description');
			expect(names).toContain('datapoint_example');
		});

		it('has a datapoint_object_schema field of type json (used when list_type is object)', () => {
			const values = getFixedCollectionValues(aiDataExtractionDescription, 'data_to_extract');
			const field = values.find((v) => v.name === 'datapoint_object_schema');
			expect(field).toBeDefined();
			expect(field?.type).toBe('json');
		});

		it('data_to_extract routing still maps into body.data_to_extract', () => {
			const field = getTopField(aiDataExtractionDescription, 'data_to_extract')!;
			expect(bodyKeyFor(field)).toBe('data_to_extract');
		});
	});

	// ─── additionalFields ──────────────────────────────────────────────────────

	describe('additionalFields', () => {
		it('specific_pages is type multiOptions', () => {
			const field = getAdditionalField(aiDataExtractionDescription, 'specific_pages');
			expect(field?.type).toBe('multiOptions');
		});

		it('specific_pages options include home_page, pricing, about_us, blog, careers, contact_us, faq', () => {
			const field = getAdditionalField(aiDataExtractionDescription, 'specific_pages')!;
			const optionValues = (field.options as { value: string }[]).map((o) => o.value);
			expect(optionValues).toContain('home_page');
			expect(optionValues).toContain('pricing');
			expect(optionValues).toContain('about_us');
			expect(optionValues).toContain('blog');
			expect(optionValues).toContain('careers');
			expect(optionValues).toContain('contact_us');
			expect(optionValues).toContain('faq');
		});

		it('specific_pages is scoped to aiQuery only', () => {
			const field = getAdditionalField(aiDataExtractionDescription, 'specific_pages')!;
			expect(additionalFieldShowsFor(field)).toEqual(['aiQuery']);
		});

		it('maxProducts is scoped to extractProducts only', () => {
			const field = getAdditionalField(aiDataExtractionDescription, 'maxProducts')!;
			expect(additionalFieldShowsFor(field)).toEqual(['extractProducts']);
		});

		it('timeoutMS exists', () => {
			expect(getAdditionalField(aiDataExtractionDescription, 'timeoutMS')).toBeDefined();
		});

		it('maxAgeMs exists, is type number, and routes to body.maxAgeMs', () => {
			const field = getAdditionalField(aiDataExtractionDescription, 'maxAgeMs')!;
			expect(field).toBeDefined();
			expect(field.type).toBe('number');
			expect(bodyKeyFor(field)).toBe('maxAgeMs');
		});

		it('maxAgeMs is scoped to extractProduct and extractProducts only', () => {
			const field = getAdditionalField(aiDataExtractionDescription, 'maxAgeMs')!;
			const ops = additionalFieldShowsFor(field);
			expect(ops.sort()).toEqual(['extractProduct', 'extractProducts'].sort());
		});
	});

	// ─── All fields have defaults ──────────────────────────────────────────────

	describe('all fields have a default value', () => {
		it('no top-level field is missing default', () => {
			const missing = aiDataExtractionDescription
				.filter((p) => p.name !== 'operation')
				.filter((p) => p.default === undefined);
			expect(missing.map((p) => p.name)).toEqual([]);
		});
	});
});
