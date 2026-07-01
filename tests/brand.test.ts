import { brandDescription } from '../nodes/ContextDev/resources/brand';
import {
	getOperations,
	urlFor,
	methodFor,
	getTopField,
	getAllTopFields,
	getAdditionalField,
	usesQsRouting,
	showsForOperations,
	additionalFieldShowsFor,
	qsKeyFor,
} from './helpers';

describe('brand resource', () => {
	// ─── Operations ────────────────────────────────────────────────────────────

	describe('operations', () => {
		it('has exactly 7 operations', () => {
			expect(getOperations(brandDescription)).toHaveLength(7);
		});

		it('has no duplicate operation values', () => {
			const values = getOperations(brandDescription).map((o) => o.value);
			expect(new Set(values).size).toBe(values.length);
		});

		it('every operation has an action defined (required for usableAsTool)', () => {
			const missing = getOperations(brandDescription).filter((o) => !o.action);
			expect(missing).toHaveLength(0);
		});

		it('operation property has noDataExpression: true', () => {
			const op = brandDescription.find((p) => p.name === 'operation');
			expect(op?.noDataExpression).toBe(true);
		});
	});

	// ─── Routing ───────────────────────────────────────────────────────────────

	describe('routing', () => {
		const cases: [string, string, string][] = [
			['retrieve', 'GET', '/brand/retrieve'],
			['retrieveByEmail', 'GET', '/brand/retrieve-by-email'],
			['retrieveByName', 'GET', '/brand/retrieve-by-name'],
			['retrieveByTicker', 'GET', '/brand/retrieve-by-ticker'],
			['retrieveByIsin', 'GET', '/brand/retrieve-by-isin'],
			['retrieveSimplified', 'GET', '/brand/retrieve-simplified'],
			['identifyFromTransaction', 'GET', '/brand/transaction_identifier'],
		];

		test.each(cases)('%s → %s %s', (op, method, url) => {
			expect(methodFor(brandDescription, op)).toBe(method);
			expect(urlFor(brandDescription, op)).toBe(url);
		});
	});

	// ─── Required fields ───────────────────────────────────────────────────────

	describe('required fields exist and are marked required', () => {
		const cases: [string][] = [
			['domain'],
			['email'],
			['name'],
			['ticker'],
			['isin'],
			['transaction_info'],
		];

		test.each(cases)('%s is required', (fieldName) => {
			const field = getTopField(brandDescription, fieldName);
			expect(field).toBeDefined();
			expect(field?.required).toBe(true);
		});
	});

	// ─── displayOptions scoping ────────────────────────────────────────────────

	describe('displayOptions scoping — fields show for correct operations', () => {
		it('domain shows for retrieve and retrieveSimplified only', () => {
			const fields = getAllTopFields(brandDescription, 'domain');
			// Could be one field covering both, or two separate fields
			const allOps = fields.flatMap((f) => showsForOperations(f));
			expect(allOps).toContain('retrieve');
			expect(allOps).toContain('retrieveSimplified');
			expect(allOps).not.toContain('retrieveByEmail');
			expect(allOps).not.toContain('retrieveByTicker');
			expect(allOps).not.toContain('identifyFromTransaction');
		});

		it('email shows only for retrieveByEmail', () => {
			const field = getTopField(brandDescription, 'email')!;
			expect(showsForOperations(field)).toEqual(['retrieveByEmail']);
		});

		it('name shows only for retrieveByName', () => {
			const field = getTopField(brandDescription, 'name')!;
			expect(showsForOperations(field)).toEqual(['retrieveByName']);
		});

		it('ticker shows only for retrieveByTicker', () => {
			const field = getTopField(brandDescription, 'ticker')!;
			expect(showsForOperations(field)).toEqual(['retrieveByTicker']);
		});

		it('isin shows only for retrieveByIsin', () => {
			const field = getTopField(brandDescription, 'isin')!;
			expect(showsForOperations(field)).toEqual(['retrieveByIsin']);
		});

		it('transaction_info shows only for identifyFromTransaction', () => {
			const field = getTopField(brandDescription, 'transaction_info')!;
			expect(showsForOperations(field)).toEqual(['identifyFromTransaction']);
		});
	});

	// ─── Field routing ─────────────────────────────────────────────────────────

	describe('all required fields use qs routing (GET params)', () => {
		const cases = ['domain', 'email', 'name', 'ticker', 'isin', 'transaction_info'];

		test.each(cases)('%s uses qs routing', (fieldName) => {
			const field = getTopField(brandDescription, fieldName)!;
			expect(usesQsRouting(field)).toBe(true);
		});
	});

	// ─── Field types ───────────────────────────────────────────────────────────

	describe('field types', () => {
		it('domain is type string', () => {
			expect(getTopField(brandDescription, 'domain')?.type).toBe('string');
		});

		it('email is type string', () => {
			expect(getTopField(brandDescription, 'email')?.type).toBe('string');
		});

		it('ticker is type string', () => {
			expect(getTopField(brandDescription, 'ticker')?.type).toBe('string');
		});

		it('timeoutMS in additionalFields is type number', () => {
			expect(getAdditionalField(brandDescription, 'timeoutMS')?.type).toBe('number');
		});

		it('maxSpeed in additionalFields is type boolean', () => {
			expect(getAdditionalField(brandDescription, 'maxSpeed')?.type).toBe('boolean');
		});

		it('maxAgeMs in additionalFields is type number', () => {
			expect(getAdditionalField(brandDescription, 'maxAgeMs')?.type).toBe('number');
		});
	});

	// ─── additionalFields ──────────────────────────────────────────────────────

	describe('additionalFields', () => {
		it('contains maxSpeed (not old speed_optimized)', () => {
			expect(getAdditionalField(brandDescription, 'maxSpeed')).toBeDefined();
			expect(getAdditionalField(brandDescription, 'speed_optimized')).toBeUndefined();
		});

		it('contains maxAgeMs', () => {
			expect(getAdditionalField(brandDescription, 'maxAgeMs')).toBeDefined();
		});

		it('contains timeoutMS', () => {
			expect(getAdditionalField(brandDescription, 'timeoutMS')).toBeDefined();
		});

		it('contains force_language', () => {
			expect(getAdditionalField(brandDescription, 'force_language')).toBeDefined();
		});

		it('transaction-only fields (mcc, city, phone, high_confidence_only) have /operation scoped to identifyFromTransaction', () => {
			const txFields = ['mcc', 'city', 'phone', 'high_confidence_only'];
			for (const name of txFields) {
				const field = getAdditionalField(brandDescription, name);
				expect(field).toBeDefined();
				expect(additionalFieldShowsFor(field!)).toEqual(['identifyFromTransaction']);
			}
		});

		it('country_gl is scoped to identifyFromTransaction and retrieveByName (SDK supports both)', () => {
			const field = getAdditionalField(brandDescription, 'country_gl');
			expect(field).toBeDefined();
			const scope = additionalFieldShowsFor(field!);
			expect(scope).toEqual(expect.arrayContaining(['identifyFromTransaction', 'retrieveByName']));
			expect(scope).toHaveLength(2);
		});

		it('country_gl is not scoped to operations whose SDK params lack it (retrieve, retrieveByEmail, retrieveByIsin, retrieveByTicker, retrieveSimplified)', () => {
			const field = getAdditionalField(brandDescription, 'country_gl')!;
			const scope = additionalFieldShowsFor(field);
			expect(scope).not.toContain('retrieve');
			expect(scope).not.toContain('retrieveByEmail');
			expect(scope).not.toContain('retrieveByIsin');
			expect(scope).not.toContain('retrieveByTicker');
			expect(scope).not.toContain('retrieveSimplified');
		});

		it('phone is a string routing qs key "phone"', () => {
			const field = getAdditionalField(brandDescription, 'phone')!;
			expect(field.type).toBe('string');
			expect(qsKeyFor(field)).toBe('phone');
		});

		it('high_confidence_only is a boolean routing qs key "high_confidence_only"', () => {
			const field = getAdditionalField(brandDescription, 'high_confidence_only')!;
			expect(field.type).toBe('boolean');
			expect(qsKeyFor(field)).toBe('high_confidence_only');
		});

		it('ticker_exchange is scoped to retrieveByTicker only', () => {
			const field = getAdditionalField(brandDescription, 'ticker_exchange');
			expect(field).toBeDefined();
			expect(additionalFieldShowsFor(field!)).toEqual(['retrieveByTicker']);
		});

		it('ticker_exchange contains all 72 SDK exchange codes, defaulting to NASDAQ', () => {
			const field = getAdditionalField(brandDescription, 'ticker_exchange')!;
			const values = (field.options as { value: string }[]).map((o) => o.value);
			const expectedCodes = [
				'AMEX', 'AMS', 'AQS', 'ASX', 'ATH', 'BER', 'BME', 'BRU', 'BSE', 'BUD',
				'BUE', 'BVC', 'CBOE', 'CNQ', 'CPH', 'DFM', 'DOH', 'DUB', 'DUS', 'DXE',
				'EGX', 'FSX', 'HAM', 'HEL', 'HKSE', 'HOSE', 'ICE', 'IOB', 'IST', 'JKT',
				'JNB', 'JPX', 'KLS', 'KOE', 'KSC', 'KUW', 'LIS', 'LSE', 'MCX', 'MEX',
				'MIL', 'MUN', 'NASDAQ', 'NEO', 'NSE', 'NYSE', 'NZE', 'OSL', 'OTC', 'PAR',
				'PNK', 'PRA', 'RIS', 'SAO', 'SAU', 'SES', 'SET', 'SGO', 'SHH', 'SHZ',
				'SIX', 'STO', 'STU', 'TAI', 'TAL', 'TLV', 'TSX', 'TSXV', 'TWO', 'VIE',
				'WSE', 'XETRA',
			];
			expect(expectedCodes).toHaveLength(72);
			expect(values.sort()).toEqual([...expectedCodes].sort());
			expect(field.default).toBe('NASDAQ');
		});

		it('ticker_exchange does not contain invalid codes SGX or SSE', () => {
			const field = getAdditionalField(brandDescription, 'ticker_exchange')!;
			const values = (field.options as { value: string }[]).map((o) => o.value);
			expect(values).not.toContain('SGX');
			expect(values).not.toContain('SSE');
		});

		it('ticker_exchange includes representative previously-missing codes', () => {
			const field = getAdditionalField(brandDescription, 'ticker_exchange')!;
			const values = (field.options as { value: string }[]).map((o) => o.value);
			for (const code of ['LIS', 'MIL', 'PAR', 'SIX', 'XETRA', 'OTC', 'TSXV', 'CBOE']) {
				expect(values).toContain(code);
			}
		});
	});

	// ─── Routing key names match API param names ──────────────────────────────

	describe('routing qs key names match API param names', () => {
		it('domain field sends key "domain"', () => {
			const field = getTopField(brandDescription, 'domain')!;
			expect(qsKeyFor(field)).toBe('domain');
		});

		it('email field sends key "email"', () => {
			const field = getTopField(brandDescription, 'email')!;
			expect(qsKeyFor(field)).toBe('email');
		});

		it('name field sends key "name"', () => {
			const field = getTopField(brandDescription, 'name')!;
			expect(qsKeyFor(field)).toBe('name');
		});

		it('ticker field sends key "ticker"', () => {
			const field = getTopField(brandDescription, 'ticker')!;
			expect(qsKeyFor(field)).toBe('ticker');
		});

		it('isin field sends key "isin"', () => {
			const field = getTopField(brandDescription, 'isin')!;
			expect(qsKeyFor(field)).toBe('isin');
		});

		it('transaction_info field sends key "transaction_info"', () => {
			const field = getTopField(brandDescription, 'transaction_info')!;
			expect(qsKeyFor(field)).toBe('transaction_info');
		});
	});

	// ─── All fields have defaults ──────────────────────────────────────────────

	describe('all fields have a default value', () => {
		it('no top-level field is missing default', () => {
			const missing = brandDescription
				.filter((p) => p.name !== 'operation')
				.filter((p) => p.default === undefined);
			expect(missing.map((p) => p.name)).toEqual([]);
		});
	});

	// ─── No brand.dev URLs ─────────────────────────────────────────────────────

	describe('no brand.dev references', () => {
		it('no operation description contains brand.dev', () => {
			const text = getOperations(brandDescription)
				.map((o) => o.description ?? '')
				.join(' ');
			expect(text).not.toContain('brand.dev');
		});
	});
});
