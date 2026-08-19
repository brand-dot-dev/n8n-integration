import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { newsDescription } from './resources/news';
import { parsingDescription } from './resources/parsing';
import { webScrapingDescription } from './resources/webScraping';
import { webExtractionDescription } from './resources/webExtraction';
import { peopleDescription } from './resources/people';
import { brandIntelligenceDescription } from './resources/brandIntelligence';
import { utilityDescription } from './resources/utility';
import { monitorsDescription } from './resources/monitors';
import { batchDescription } from './resources/batch';

export class ContextDev implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Context.dev',
		name: 'contextDev',
		icon: 'file:contextDev.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Context.dev API',
		defaults: { name: 'Context.dev' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'contextdevApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.context.dev/v1',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json', "integration_name": 'n8n' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
						{ name: 'Batch', value: 'batch' },
						{ name: 'Brand Intelligence', value: 'brandIntelligence' },
						{ name: 'Monitor', value: 'monitors' },
						{ name: 'News', value: 'news' },
						{ name: 'Parsing', value: 'parsing' },
						{ name: 'Person', value: 'people' },
						{ name: 'Utility', value: 'utility' },
						{ name: 'Web Extraction', value: 'webExtraction' },
						{ name: 'Web Scraping', value: 'webScraping' },
				],
				default: 'news',
			},
				...newsDescription,
				...parsingDescription,
				...webScrapingDescription,
				...webExtractionDescription,
				...peopleDescription,
				...brandIntelligenceDescription,
				...utilityDescription,
				...monitorsDescription,
				...batchDescription,
		],
	};
}
