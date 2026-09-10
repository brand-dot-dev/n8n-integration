import {
	NodeConnectionTypes,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeProperties,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { executeBranddev } from './execute';
import { brandDescription } from './resources/brand';
import { naicsDescription } from './resources/naics';
import { productDescription } from './resources/aiDataExtraction';
import { screenshotStyleguideDescription } from './resources/screenshot';
import { contextProperties } from './v2/properties';

const legacyProperties = withVersion(1, [
	...brandDescription,
	...naicsDescription,
	...productDescription,
	...screenshotStyleguideDescription,
]);

export class Branddev implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Context.dev',
		name: 'branddev',
		icon: {
			light: 'file:brand-dev-logo.svg',
			dark: 'file:brand-dev-logo.dark.svg',
		},
		group: ['transform'],
		version: [1, 2],
		defaultVersion: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Search, scrape, extract, monitor, and enrich live web data with Context.dev',
		documentationUrl: 'https://docs.context.dev',
		defaults: {
			name: 'Context.dev',
		},
		parameterPane: 'wide',
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'branddevApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { '@version': [1] } },
				options: [
					{
						name: 'Retrieve Brand',
						value: 'brand',
					},
					{
						name: 'Industry Classification',
						value: 'naics',
					},
					{
						name: 'AI Data Extraction',
						value: 'aiDataExtraction',
					},
					{
						name: 'Screenshot / Styleguide',
						value: 'screenshotStyleguide',
					},
				],
				default: 'brand',
			},
			...legacyProperties,
			...contextProperties,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return executeBranddev.call(this);
	}
}

function withVersion(version: number, properties: INodeProperties[]): INodeProperties[] {
	return properties.map((property) => ({
		...property,
		displayOptions: {
			...property.displayOptions,
			show: {
				...property.displayOptions?.show,
				'@version': [version],
			},
		},
	}));
}
