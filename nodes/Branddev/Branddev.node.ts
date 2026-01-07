import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { brandDescription } from './resources/brand';
import { naicsDescription } from './resources/naics';
import { screenshotStyleguideDescription } from './resources/screenshot';

export class Branddev implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Brand.dev',
		name: 'branddev',
		icon: 'file:brand-dev-logo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Retrieve brand data from Brand.dev API',
		defaults: {
			name: 'Brand.dev',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'branddevApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.brand.dev/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Brand',
						value: 'brand',
					},
					{
						name: 'Industry Classification',
						value: 'naics',
					},
					{
						name: 'Screenshot / Styleguide',
						value: 'screenshotStyleguide',
					},
				],
				default: 'brand',
			},
			...brandDescription,
			...naicsDescription,
			...screenshotStyleguideDescription,
		],
	};
}
