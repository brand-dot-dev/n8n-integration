import { ContextdevApi } from '../credentials/ContextdevApi.credentials';

describe('ContextdevApi credential', () => {
	const cred = new ContextdevApi();

	// ─── Identity ──────────────────────────────────────────────────────────────

	describe('identity', () => {
		it('name is contextdevApi', () => {
			expect(cred.name).toBe('contextdevApi');
		});

		it('name is NOT branddevApi (old name)', () => {
			expect(cred.name).not.toBe('branddevApi');
		});

		it('displayName is Context.dev API', () => {
			expect(cred.displayName).toBe('Context.dev API');
		});

		it('documentationUrl points to context.dev not brand.dev', () => {
			expect(cred.documentationUrl).toContain('context.dev');
			expect(cred.documentationUrl).not.toContain('brand.dev');
		});
	});

	// ─── Properties ────────────────────────────────────────────────────────────

	describe('properties', () => {
		it('has an apiKey field', () => {
			const field = cred.properties.find((p) => p.name === 'apiKey');
			expect(field).toBeDefined();
		});

		it('apiKey is type string', () => {
			const field = cred.properties.find((p) => p.name === 'apiKey')!;
			expect(field.type).toBe('string');
		});

		it('apiKey is password type (masked in UI)', () => {
			const field = cred.properties.find((p) => p.name === 'apiKey')!;
			expect(field.typeOptions?.password).toBe(true);
		});

		it('apiKey has a default value', () => {
			const field = cred.properties.find((p) => p.name === 'apiKey')!;
			expect(field.default).toBeDefined();
		});
	});

	// ─── Authentication ────────────────────────────────────────────────────────

	describe('authentication', () => {
		it('uses generic auth type', () => {
			expect(cred.authenticate?.type).toBe('generic');
		});

		it('injects Authorization Bearer header', () => {
			const headers = (cred.authenticate as { properties: { headers: Record<string, string> } })
				.properties?.headers;
			expect(headers?.Authorization).toBeDefined();
			expect(headers?.Authorization).toContain('Bearer');
		});

		it('injects integration_name: n8n header', () => {
			const headers = (cred.authenticate as { properties: { headers: Record<string, string> } })
				.properties?.headers;
			expect(headers?.integration_name).toBe('n8n');
		});
	});

	// ─── Test request ──────────────────────────────────────────────────────────

	describe('credential test request', () => {
		const testReq = (cred.test as { request: { baseURL?: string; url?: string } }).request;

		it('test baseURL points to api.context.dev', () => {
			expect(testReq.baseURL).toContain('context.dev');
		});

		it('test baseURL does NOT point to api.brand.dev', () => {
			expect(testReq.baseURL).not.toContain('brand.dev');
		});

		it('test URL is a brand retrieve endpoint', () => {
			expect(testReq.url).toContain('/brand/retrieve');
		});
	});
});
