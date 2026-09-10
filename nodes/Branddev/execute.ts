import {
	NodeApiError,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type IHttpRequestOptions,
	type JsonObject,
} from 'n8n-workflow';
import { buildLegacyRequest, type LegacyRequestParameters } from './v1/request';
import { findContextOperation, type ContextOperationDefinition } from './v2/operations';
import { buildContextRequest } from './v2/request';

const MAX_PARSE_BYTES = 25 * 1024 * 1024;

export async function executeBranddev(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const inputItems = this.getInputData();
	const outputItems: INodeExecutionData[] = [];

	for (let itemIndex = 0; itemIndex < inputItems.length; itemIndex++) {
		try {
			const request =
				this.getNode().typeVersion === 1
					? buildLegacyNodeRequest.call(this, itemIndex)
					: await buildCurrentNodeRequest.call(this, itemIndex);
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'branddevApi',
				request,
			);
			outputItems.push(...normalizeResponse(response, itemIndex));
		} catch (error) {
			if (this.continueOnFail()) {
				outputItems.push({ json: { error: errorMessage(error) }, pairedItem: { item: itemIndex } });
				continue;
			}
			if (error instanceof NodeOperationError) {
				throw new NodeOperationError(this.getNode(), error.message, { itemIndex });
			}
			throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
		}
	}

	return [outputItems];
}

function buildLegacyNodeRequest(this: IExecuteFunctions, itemIndex: number): IHttpRequestOptions {
	return buildLegacyRequest({
		resource: this.getNodeParameter('resource', itemIndex) as string,
		operation: this.getNodeParameter('operation', itemIndex) as string,
		domain: this.getNodeParameter('domain', itemIndex, '') as string,
		name: this.getNodeParameter('name', itemIndex, '') as string,
		email: this.getNodeParameter('email', itemIndex, '') as string,
		ticker: this.getNodeParameter('ticker', itemIndex, '') as string,
		isin: this.getNodeParameter('isin', itemIndex, '') as string,
		simplifiedDomain: this.getNodeParameter('simplifiedDomain', itemIndex, '') as string,
		transaction_title: this.getNodeParameter('transaction_title', itemIndex, '') as string,
		input: this.getNodeParameter('input', itemIndex, '') as string,
		additionalFields: this.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject,
	} satisfies LegacyRequestParameters);
}

async function buildCurrentNodeRequest(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const resource = this.getNodeParameter('resource', itemIndex) as string;
	const operationValue = this.getNodeParameter('operation', itemIndex) as string;
	const operation = findContextOperation(resource, operationValue);
	if (!operation) {
		throw new NodeOperationError(
			this.getNode(),
			`Unsupported Context.dev operation: ${resource}/${operationValue}`,
			{ itemIndex },
		);
	}

	if (
		operation.requiresConfirmation &&
		!this.getNodeParameter('confirmOperation', itemIndex, false)
	) {
		throw new NodeOperationError(
			this.getNode(),
			`Confirm ${operation.name.toLowerCase()} before running it`,
			{ itemIndex },
		);
	}

	const pathParameters = Object.fromEntries(
		(operation.pathParameters ?? []).map((parameterName) => [
			parameterName,
			this.getNodeParameter(parameterName, itemIndex) as string,
		]),
	);
	const idempotencyKey = operation.supportsIdempotencyKey
		? (this.getNodeParameter('idempotencyKey', itemIndex, '') as string)
		: undefined;

	if (operation.requestKind === 'binary') {
		return buildBinaryRequest.call(this, operation, pathParameters, idempotencyKey, itemIndex);
	}

	return buildContextRequest(operation, {
		pathParameters,
		idempotencyKey,
		body:
			operation.requestKind === 'body'
				? readJsonParameter.call(this, 'requestBody', itemIndex)
				: undefined,
		query:
			operation.requestKind === 'query'
				? readJsonParameter.call(this, 'queryParameters', itemIndex)
				: undefined,
	});
}

async function buildBinaryRequest(
	this: IExecuteFunctions,
	operation: ContextOperationDefinition,
	pathParameters: Record<string, string>,
	idempotencyKey: string | undefined,
	itemIndex: number,
): Promise<IHttpRequestOptions> {
	const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
	const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
	const binary = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
	if (binary.byteLength > MAX_PARSE_BYTES) {
		throw new NodeOperationError(this.getNode(), 'The file exceeds the 25 MiB parsing limit', {
			itemIndex,
		});
	}
	const query = readJsonParameter.call(this, 'queryParameters', itemIndex);
	if (!query.extension && binaryData.fileExtension) {
		query.extension = binaryData.fileExtension;
	}

	return buildContextRequest(operation, {
		pathParameters,
		idempotencyKey,
		query,
		binary,
		mimeType: binaryData.mimeType,
	});
}

export function parseJsonObject(
	value: unknown,
	parameterName: string,
): { data?: IDataObject; error?: string } {
	if (typeof value === 'string') {
		try {
			return parseJsonObject(JSON.parse(value) as unknown, parameterName);
		} catch (error) {
			return { error: `${parameterName} must contain valid JSON: ${errorMessage(error)}` };
		}
	}
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return { data: value as IDataObject };
	}
	return { error: `${parameterName} must be a JSON object` };
}

function readJsonParameter(
	this: IExecuteFunctions,
	parameterName: string,
	itemIndex: number,
): IDataObject {
	const value = this.getNodeParameter(parameterName, itemIndex, {});
	const result = parseJsonObject(value, parameterName);
	if (result.error) {
		throw new NodeOperationError(this.getNode(), result.error, { itemIndex });
	}
	return result.data ?? {};
}

function normalizeResponse(response: unknown, itemIndex: number): INodeExecutionData[] {
	const values = Array.isArray(response) ? response : [response];
	if (values.length === 0) {
		return [{ json: { data: [] }, pairedItem: { item: itemIndex } }];
	}
	return values.map((value) => ({
		json:
			value && typeof value === 'object' && !Array.isArray(value)
				? (value as IDataObject)
				: { data: value as never },
		pairedItem: { item: itemIndex },
	}));
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
