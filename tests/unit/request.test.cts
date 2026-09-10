import assert from 'node:assert/strict';
import test from 'node:test';
import { parseJsonObject } from '../../nodes/Branddev/execute';
import { buildLegacyRequest } from '../../nodes/Branddev/v1/request';
import { findContextOperation } from '../../nodes/Branddev/v2/operations';
import { buildContextRequest } from '../../nodes/Branddev/v2/request';

test('builds authenticated current API requests without legacy hosts', () => {
	const operation = findContextOperation('news', 'searchCompanyNews');
	assert.ok(operation);

	const request = buildContextRequest(operation, {
		body: { searchBy: { type: 'entity', entity: { type: 'domain', domain: 'context.dev' } } },
	});

	assert.equal(request.baseURL, 'https://api.context.dev/v1');
	assert.equal(request.url, '/news/search');
	assert.equal(request.method, 'POST');
	assert.equal(request.headers?.integration_name, 'n8n');
	assert.equal(request.headers?.['Content-Type'], 'application/json');
});

test('encodes path parameters and preserves array query parameters', () => {
	const operation = findContextOperation('monitors', 'listMonitorChanges');
	assert.ok(operation);

	const request = buildContextRequest(operation, {
		pathParameters: { monitor_id: 'monitor/with spaces' },
		query: {
			tag: ['pricing', 'production'],
			since: '2026-09-01T00:00:00Z',
			filter: { active: true },
		},
	});

	assert.equal(request.url, '/monitors/monitor%2Fwith%20spaces/changes');
	assert.deepEqual(request.qs, {
		tag: ['pricing', 'production'],
		since: '2026-09-01T00:00:00Z',
		filter: '{"active":true}',
	});
	assert.equal(request.arrayFormat, 'repeat');
});

test('uses binary request bodies and idempotency headers correctly', () => {
	const operation = findContextOperation('parsing', 'parseFile');
	assert.ok(operation);
	const binary = Buffer.from('document');

	const request = buildContextRequest(operation, {
		binary,
		mimeType: 'application/pdf',
		query: { extension: 'pdf', includeLinks: true },
		idempotencyKey: 'parse-once',
	});

	assert.equal(request.body, binary);
	assert.equal(request.headers?.['Content-Type'], 'application/pdf');
	assert.equal(request.headers?.['Idempotency-Key'], 'parse-once');
});

test('keeps version 1 workflow routes compatible while using the Context.dev host', () => {
	const request = buildLegacyRequest({
		resource: 'brand',
		operation: 'retrieveByTicker',
		ticker: 'AAPL',
		additionalFields: { ticker_exchange: 'NASDAQ', timeoutMS: 30000 },
	});

	assert.equal(request.baseURL, 'https://api.context.dev/v1');
	assert.equal(request.url, '/brand/retrieve-by-ticker');
	assert.equal(request.method, 'GET');
	assert.deepEqual(request.qs, { ticker: 'AAPL', ticker_exchange: 'NASDAQ', timeoutMS: 30000 });
});

test('parses JSON object parameters and rejects non-object values', () => {
	assert.deepEqual(parseJsonObject('{"query":"Context.dev"}', 'Request Body'), {
		data: { query: 'Context.dev' },
	});
	assert.match(parseJsonObject('[1,2]', 'Request Body').error ?? '', /must be a JSON object/);
	assert.match(parseJsonObject('{', 'Request Body').error ?? '', /must contain valid JSON/);
});
