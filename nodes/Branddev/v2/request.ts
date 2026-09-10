import type { IDataObject, IHttpRequestOptions } from 'n8n-workflow';
import { CONTEXT_API_BASE_URL, type ContextOperationDefinition } from './operations';

interface ContextRequestInput {
	body?: IDataObject;
	query?: IDataObject;
	pathParameters?: Record<string, string>;
	binary?: Buffer;
	mimeType?: string;
	idempotencyKey?: string;
}

export function buildContextRequest(
	operation: ContextOperationDefinition,
	input: ContextRequestInput,
): IHttpRequestOptions {
	const headers: IDataObject = {
		Accept: 'application/json',
		integration_name: 'n8n',
	};
	const request: IHttpRequestOptions = {
		baseURL: CONTEXT_API_BASE_URL,
		url: interpolatePath(operation.path, input.pathParameters ?? {}),
		method: operation.method,
		headers,
		json: true,
	};

	if (input.query && Object.keys(input.query).length > 0) {
		request.qs = normalizeQuery(input.query);
		request.arrayFormat = 'repeat';
	}

	if (input.binary) {
		request.body = input.binary;
		headers['Content-Type'] = input.mimeType || 'application/octet-stream';
	} else if (input.body && Object.keys(input.body).length > 0) {
		request.body = input.body;
		headers['Content-Type'] = 'application/json';
	}

	if (input.idempotencyKey) {
		headers['Idempotency-Key'] = input.idempotencyKey;
	}

	return request;
}

function interpolatePath(pathTemplate: string, pathParameters: Record<string, string>): string {
	return pathTemplate.replace(/\{([^}]+)\}/g, (_match: string, parameterName: string) => {
		const value = pathParameters[parameterName];
		if (!value) {
			throw new Error(`Missing required path parameter: ${parameterName}`);
		}
		return encodeURIComponent(value);
	});
}

function normalizeQuery(query: IDataObject): IDataObject {
	return Object.fromEntries(
		Object.entries(query)
			.filter(([, value]) => value !== undefined && value !== null && value !== '')
			.map(([key, value]) => [
				key,
				shouldStringifyQueryValue(value) ? JSON.stringify(value) : value,
			]),
	);
}

function shouldStringifyQueryValue(value: unknown): boolean {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}
