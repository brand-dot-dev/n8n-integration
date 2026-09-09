import assert from 'node:assert/strict';
import test from 'node:test';
import type { IDataObject, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { executeBranddev } from '../../nodes/Branddev/execute';

test('executes a current News request and preserves item pairing', async () => {
	const requests: IHttpRequestOptions[] = [];
	const context = executionContext({
		version: 2,
		parameters: {
			resource: 'news',
			operation: 'searchCompanyNews',
			requestBody: JSON.stringify({
				searchBy: { type: 'entity', entity: { type: 'domain', domain: 'context.dev' } },
			}),
		},
		response: { data: [{ title: 'Context.dev launches News API' }] },
		requests,
	});

	const output = await executeBranddev.call(context);

	assert.equal(requests.length, 1);
	assert.equal(requests[0].url, '/news/search');
	assert.deepEqual(output, [
		[
			{
				json: { data: [{ title: 'Context.dev launches News API' }] },
				pairedItem: { item: 0 },
			},
		],
	]);
});

test('executes existing version 1 workflows against their legacy route', async () => {
	const requests: IHttpRequestOptions[] = [];
	const context = executionContext({
		version: 1,
		parameters: {
			resource: 'brand',
			operation: 'retrieve',
			domain: 'context.dev',
			additionalFields: { timeoutMS: 30000 },
		},
		response: { domain: 'context.dev' },
		requests,
	});

	await executeBranddev.call(context);

	assert.equal(requests[0].url, '/brand/retrieve');
	assert.equal(requests[0].method, 'GET');
	assert.deepEqual(requests[0].qs, { domain: 'context.dev', timeoutMS: 30000 });
});

test('sends n8n binary data to the parse endpoint and infers its extension', async () => {
	const requests: IHttpRequestOptions[] = [];
	const binary = Buffer.from('%PDF');
	const context = executionContext({
		version: 2,
		parameters: {
			resource: 'parsing',
			operation: 'parseFile',
			binaryPropertyName: 'document',
			queryParameters: '{"includeLinks":true}',
		},
		response: { markdown: '# Document' },
		requests,
		binary,
	});

	await executeBranddev.call(context);

	assert.equal(requests[0].url, '/parse');
	assert.equal(requests[0].body, binary);
	assert.deepEqual(requests[0].qs, { includeLinks: true, extension: 'pdf' });
	assert.equal(requests[0].headers?.['Content-Type'], 'application/pdf');
});

interface ExecutionContextOptions {
	version: number;
	parameters: IDataObject;
	response: unknown;
	requests: IHttpRequestOptions[];
	binary?: Buffer;
}

function executionContext(options: ExecutionContextOptions): IExecuteFunctions {
	return {
		getInputData: () => [{ json: {} }],
		getNode: () => ({
			id: 'context-node',
			name: 'Context.dev',
			type: 'n8n-nodes-branddev.branddev',
			typeVersion: options.version,
			position: [0, 0],
			parameters: options.parameters,
		}),
		getNodeParameter: (name: string, _itemIndex: number, fallback?: unknown) =>
			options.parameters[name] ?? fallback,
		continueOnFail: () => false,
		helpers: {
			httpRequestWithAuthentication: async (
				_credentialsType: string,
				request: IHttpRequestOptions,
			) => {
				options.requests.push(request);
				return options.response;
			},
			assertBinaryData: () => ({
				data: 'unused',
				mimeType: 'application/pdf',
				fileExtension: 'pdf',
			}),
			getBinaryDataBuffer: async () => options.binary ?? Buffer.alloc(0),
		},
	} as unknown as IExecuteFunctions;
}
