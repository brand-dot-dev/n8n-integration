import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';
import { contextOperations, contextResources, type ContextOperationDefinition } from './operations';

export const contextProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { '@version': [2] } },
		options: [...contextResources],
		default: 'webScraping',
	},
	...createOperationProperties(),
	...contextOperations.flatMap(operationInputProperties),
];

function createOperationProperties(): INodeProperties[] {
	return [
		operationProperty('webScraping', 'scrapeMarkdown'),
		operationProperty('webExtraction', 'extractStructuredData'),
		operationProperty('brandIntelligence', 'retrieveBrand'),
		operationProperty('news', 'searchCompanyNews'),
		operationProperty('parsing', 'parseFile'),
		operationProperty('people', 'enrichPerson'),
		operationProperty('monitors', 'createMonitor'),
		operationProperty('batch', 'submitBatch'),
		operationProperty('webhooks', 'listDeliveries'),
		operationProperty('utility', 'prefetchData'),
	];
}

function operationProperty(resource: string, defaultOperation: string): INodeProperties {
	const options: INodePropertyOptions[] = contextOperations
		.filter((operation) => operation.resource === resource)
		.map((operation) => ({
			name: operation.name,
			value: operation.value,
			action: operation.action,
			description: `${operation.description}. <a href="https://docs.context.dev/api-reference" target="_blank">View API reference</a>.`,
		}));

	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { '@version': [2], resource: [resource] } },
		options,
		default: defaultOperation,
	};
}

function operationInputProperties(operation: ContextOperationDefinition): INodeProperties[] {
	const displayOptions = {
		show: {
			'@version': [2],
			resource: [operation.resource],
			operation: [operation.value],
		},
	};
	const properties: INodeProperties[] = (operation.pathParameters ?? []).map((parameterName) => ({
		displayName: pathParameterDisplayName(parameterName),
		name: parameterName,
		type: 'string',
		required: true,
		default: '',
		displayOptions,
		description: `The ${pathParameterDisplayName(parameterName).toLowerCase()} used in the request path`,
	}));

	if (operation.requestKind === 'body') {
		properties.push({
			displayName: 'Request Body',
			name: 'requestBody',
			type: 'json',
			required: Object.keys(operation.example ?? {}).length > 0,
			default: JSON.stringify(operation.example ?? {}, null, 2),
			displayOptions,
			description: 'JSON request body matching the public Context.dev API schema',
		});
	}

	if (operation.requestKind === 'query') {
		properties.push({
			displayName: 'Query Parameters',
			name: 'queryParameters',
			type: 'json',
			required: Object.keys(operation.example ?? {}).length > 0,
			default: JSON.stringify(operation.example ?? {}, null, 2),
			displayOptions,
			description: 'JSON object containing the documented query parameters',
		});
	}

	if (operation.requestKind === 'binary') {
		properties.push(
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				required: true,
				default: 'data',
				displayOptions,
				description: 'Name of the input field containing the binary file',
			},
			{
				displayName: 'Parse Options',
				name: 'queryParameters',
				type: 'json',
				default: JSON.stringify({ includeLinks: true, includeImages: false }, null, 2),
				displayOptions,
				description:
					'Optional parse query parameters, including extension, OCR, PDF range, and zero data retention',
			},
		);
	}

	if (operation.supportsIdempotencyKey) {
		properties.push({
			displayName: 'Idempotency Key',
			name: 'idempotencyKey',
			type: 'string',
			default: '',
			displayOptions,
			description: 'Optional unique key that makes retries safe without creating duplicate work',
		});
	}

	if (operation.requiresConfirmation) {
		properties.push({
			displayName: 'Confirm Operation',
			name: 'confirmOperation',
			type: 'boolean',
			default: false,
			displayOptions,
			description: `Whether to confirm the ${operation.name.toLowerCase()} operation`,
		});
	}

	return properties;
}

function pathParameterDisplayName(parameterName: string): string {
	return parameterName
		.split('_')
		.map((part) => (part === 'id' ? 'ID' : `${part[0].toUpperCase()}${part.slice(1)}`))
		.join(' ');
}
