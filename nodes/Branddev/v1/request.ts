import type { IDataObject, IHttpRequestOptions } from 'n8n-workflow';
import { CONTEXT_API_BASE_URL } from '../v2/operations';

export interface LegacyRequestParameters {
	resource: string;
	operation: string;
	domain?: string;
	name?: string;
	email?: string;
	ticker?: string;
	isin?: string;
	simplifiedDomain?: string;
	transaction_title?: string;
	input?: string;
	additionalFields?: IDataObject;
}

export function buildLegacyRequest(parameters: LegacyRequestParameters): IHttpRequestOptions {
	const operation = legacyOperations[`${parameters.resource}:${parameters.operation}`];
	if (!operation) {
		throw new Error(`Unsupported legacy operation: ${parameters.resource}/${parameters.operation}`);
	}

	const request: IHttpRequestOptions = {
		baseURL: CONTEXT_API_BASE_URL,
		url: operation.path,
		method: operation.method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			integration_name: 'n8n',
		},
		json: true,
	};
	const input = primaryInput(parameters);
	const payload = compact({ ...input, ...parameters.additionalFields });

	if (operation.method === 'POST') {
		request.body = payload;
	} else {
		request.qs = payload;
	}

	return request;
}

const legacyOperations: Record<string, { method: 'GET' | 'POST'; path: string }> = {
	'brand:identifyByTransaction': { method: 'GET', path: '/brand/transaction_identifier' },
	'brand:retrieve': { method: 'GET', path: '/brand/retrieve' },
	'brand:retrieveByName': { method: 'GET', path: '/brand/retrieve-by-name' },
	'brand:retrieveByEmail': { method: 'GET', path: '/brand/retrieve-by-email' },
	'brand:retrieveByTicker': { method: 'GET', path: '/brand/retrieve-by-ticker' },
	'brand:retrieveByIsin': { method: 'GET', path: '/brand/retrieve-by-isin' },
	'brand:retrieveSimplified': { method: 'GET', path: '/brand/retrieve-simplified' },
	'naics:classify': { method: 'GET', path: '/brand/naics' },
	'aiDataExtraction:extractFromWebsite': { method: 'POST', path: '/brand/ai/products' },
	'screenshotStyleguide:capture': { method: 'GET', path: '/brand/screenshot' },
	'screenshotStyleguide:extractStyleguide': { method: 'GET', path: '/brand/styleguide' },
	'screenshotStyleguide:extractFonts': { method: 'GET', path: '/brand/fonts' },
};

function primaryInput(parameters: LegacyRequestParameters): IDataObject {
	if (parameters.resource === 'brand') {
		return brandInput(parameters);
	}
	if (parameters.resource === 'naics') {
		return { input: parameters.input };
	}
	if (parameters.resource === 'aiDataExtraction') {
		return { domain: parameters.domain };
	}
	if (parameters.resource === 'screenshotStyleguide') {
		return { domain: parameters.domain };
	}
	return {};
}

function brandInput(parameters: LegacyRequestParameters): IDataObject {
	switch (parameters.operation) {
		case 'retrieve':
			return { domain: parameters.domain };
		case 'retrieveByName':
			return { name: parameters.name };
		case 'retrieveByEmail':
			return { email: parameters.email };
		case 'retrieveByTicker':
			return { ticker: parameters.ticker };
		case 'retrieveByIsin':
			return { isin: parameters.isin };
		case 'retrieveSimplified':
			return { domain: parameters.simplifiedDomain };
		case 'identifyByTransaction':
			return { transaction_info: parameters.transaction_title };
		default:
			return {};
	}
}

function compact(value: IDataObject): IDataObject {
	return Object.fromEntries(
		Object.entries(value).filter(
			([, fieldValue]) => fieldValue !== undefined && fieldValue !== null && fieldValue !== '',
		),
	);
}
