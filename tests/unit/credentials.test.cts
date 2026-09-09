import assert from 'node:assert/strict';
import test from 'node:test';
import { BranddevApi } from '../../credentials/BranddevApi.credentials';

test('credentials use current Context.dev branding and a read-only test request', () => {
	const credentials = new BranddevApi();

	assert.equal(credentials.name, 'branddevApi');
	assert.equal(credentials.displayName, 'Context.dev API');
	assert.equal(credentials.documentationUrl, 'https://docs.context.dev/quickstart');
	assert.equal(credentials.test.request.baseURL, 'https://api.context.dev/v1');
	assert.equal(credentials.test.request.url, '/monitors/limits');
	assert.equal(credentials.properties[0].placeholder, 'ctxt_secret_...');
});
