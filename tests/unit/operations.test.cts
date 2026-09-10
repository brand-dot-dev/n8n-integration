import assert from 'node:assert/strict';
import test from 'node:test';
import { Branddev } from '../../nodes/Branddev/Branddev.node';
import {
	contextOperations,
	contextResources,
	findContextOperation,
} from '../../nodes/Branddev/v2/operations';

test('the latest node version exposes every Context.dev resource', () => {
	const node = new Branddev();

	assert.deepEqual(node.description.version, [1, 2]);
	assert.equal(node.description.defaultVersion, 2);
	assert.equal(node.description.displayName, 'Context.dev');
	assert.equal(node.description.name, 'branddev');
	assert.deepEqual(
		contextResources.map(({ value }) => value),
		[
			'webScraping',
			'webExtraction',
			'brandIntelligence',
			'news',
			'parsing',
			'people',
			'monitors',
			'batch',
			'webhooks',
			'utility',
		],
	);
});

test('the public operation catalog is complete and unambiguous', () => {
	const identifiers = contextOperations.map(({ resource, value }) => `${resource}:${value}`);
	const routes = contextOperations.map(({ method, path }) => `${method} ${path}`);

	assert.equal(contextOperations.length, 45);
	assert.equal(new Set(identifiers).size, identifiers.length);
	assert.equal(new Set(routes).size, routes.length);
	assert.equal(routes.includes('POST /news/search'), true);
	assert.equal(
		routes.some((route) => route.includes('/answers')),
		false,
	);
	assert.equal(findContextOperation('news', 'searchCompanyNews')?.path, '/news/search');
});
