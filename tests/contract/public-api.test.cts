import assert from 'node:assert/strict';
import test from 'node:test';
import { contextOperations, type ContextRequestKind } from '../../nodes/Branddev/v2/operations';

const DEFAULT_OPENAPI_URL = 'https://docs.context.dev/openapi.json';

test('the node matches the latest public Context.dev OpenAPI contract', async () => {
	const response = await fetch(process.env.CONTEXT_OPENAPI_URL ?? DEFAULT_OPENAPI_URL);
	assert.equal(response.ok, true, `OpenAPI download failed with HTTP ${response.status}`);
	const specification = (await response.json()) as OpenApiSpecification;
	const documentedOperations = readDocumentedOperations(specification);
	const nodeOperations = contextOperations.map(({ method, path }) => `${method} ${path}`).sort();

	assert.deepEqual(nodeOperations, [...documentedOperations.keys()].sort());

	for (const operation of contextOperations) {
		const documented = documentedOperations.get(`${operation.method} ${operation.path}`);
		assert.ok(
			documented,
			`${operation.method} ${operation.path} is missing from the OpenAPI document`,
		);
		assert.equal(
			operation.requestKind,
			documented.requestKind,
			`${operation.method} ${operation.path} request kind drifted`,
		);
		assert.deepEqual(
			operation.pathParameters ?? [],
			documented.pathParameters,
			`${operation.method} ${operation.path} path parameters drifted`,
		);
		assert.equal(
			operation.supportsIdempotencyKey ?? false,
			documented.supportsIdempotencyKey,
			`${operation.method} ${operation.path} idempotency support drifted`,
		);
		validateRequiredExample(
			operation.example,
			documented.requiredInputGroups,
			`${operation.method} ${operation.path}`,
		);
	}
});

interface OpenApiSpecification {
	paths: Record<string, Record<string, OpenApiOperation>>;
	components?: { schemas?: Record<string, OpenApiSchema> };
}

interface OpenApiOperation {
	parameters?: Array<{ $ref?: string; in?: string; name?: string; required?: boolean }>;
	requestBody?: { content?: Record<string, { schema?: OpenApiSchema }> };
}

interface OpenApiSchema {
	$ref?: string;
	required?: string[];
	oneOf?: OpenApiSchema[];
}

interface DocumentedOperation {
	requestKind: ContextRequestKind;
	pathParameters: string[];
	requiredInputGroups: string[][];
	supportsIdempotencyKey: boolean;
}

function readDocumentedOperations(
	specification: OpenApiSpecification,
): Map<string, DocumentedOperation> {
	const operations = new Map<string, DocumentedOperation>();
	for (const [path, pathItem] of Object.entries(specification.paths)) {
		for (const method of ['delete', 'get', 'patch', 'post', 'put']) {
			const operation = pathItem[method];
			if (!operation) continue;
			const parameters = operation.parameters?.filter((parameter) => !parameter.$ref) ?? [];
			const contentTypes = Object.keys(operation.requestBody?.content ?? {});
			const pathParameters = parameters
				.filter((parameter) => parameter.in === 'path' && parameter.required)
				.map((parameter) => parameter.name as string);
			const requiredQueryInput = parameters
				.filter((parameter) => parameter.in === 'query' && parameter.required)
				.map((parameter) => parameter.name as string);
			const operationRequestKind = requestKind(parameters, contentTypes);
			operations.set(`${method.toUpperCase()} ${path}`, {
				requestKind: operationRequestKind,
				pathParameters,
				requiredInputGroups:
					operationRequestKind === 'body'
						? requiredBodyInputGroups(specification, operation)
						: [requiredQueryInput],
				supportsIdempotencyKey: parameters.some(
					(parameter) => parameter.in === 'header' && parameter.name === 'Idempotency-Key',
				),
			});
		}
	}
	return operations;
}

function requestKind(
	parameters: Array<{ in?: string }>,
	contentTypes: string[],
): ContextRequestKind {
	if (contentTypes.some((contentType) => contentType !== 'application/json')) return 'binary';
	if (contentTypes.includes('application/json')) return 'body';
	if (parameters.some((parameter) => parameter.in === 'query')) return 'query';
	return 'none';
}

function validateRequiredExample(
	example: Record<string, unknown> | undefined,
	requiredInputGroups: string[][],
	operation: string,
): void {
	const matchingGroup = requiredInputGroups.find((requiredInput) =>
		requiredInput.every((parameterName) => example?.[parameterName] !== undefined),
	);
	assert.ok(matchingGroup, `${operation} example does not satisfy any required input shape`);
}

function requiredBodyInputGroups(
	specification: OpenApiSpecification,
	operation: OpenApiOperation,
): string[][] {
	const schema = operation.requestBody?.content?.['application/json']?.schema;
	if (!schema) return [[]];
	const resolvedSchema = resolveSchema(specification, schema);
	return (
		resolvedSchema.oneOf?.map(
			(candidate) => resolveSchema(specification, candidate).required ?? [],
		) ?? [resolvedSchema.required ?? []]
	);
}

function resolveSchema(specification: OpenApiSpecification, schema: OpenApiSchema): OpenApiSchema {
	if (!schema.$ref) return schema;
	const schemaName = schema.$ref.split('/').at(-1);
	return schemaName ? (specification.components?.schemas?.[schemaName] ?? schema) : schema;
}
