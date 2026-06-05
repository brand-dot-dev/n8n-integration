import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { brandDescription } from './resources/brand';
import { webDescription } from './resources/web';
import { aiDataExtractionDescription } from './resources/aiDataExtraction';
import { industryDescription } from './resources/industry';
import { utilityDescription } from './resources/utility';

export class ContextDev implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Context.dev',
		name: 'contextDev',
		icon: 'file:context-dev-logo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Web scraping, brand intelligence, and AI data extraction via Context.dev',
		defaults: {
			name: 'Context.dev',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'contextdevApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.context.dev/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				integration_name: 'n8n',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'AI Data Extraction', value: 'aiDataExtraction' },
					{ name: 'Brand Intelligence', value: 'brand' },
					{ name: 'Industry Classification', value: 'industry' },
					{ name: 'Utility', value: 'utility' },
					{ name: 'Web Scraping', value: 'web' },
				],
				default: 'brand',
			},
			...brandDescription,
			...webDescription,
			...aiDataExtractionDescription,
			...industryDescription,
			...utilityDescription,
		],
	};
}
