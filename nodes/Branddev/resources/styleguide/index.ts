import type { INodeProperties } from 'n8n-workflow';

const showOnlyForStyleguide = {
	resource: ['styleguide'],
};

export const styleguideDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForStyleguide,
		},
		options: [
			{
				name: 'Extract Styleguide',
				value: 'extract',
				action: 'Extract design system and styleguide from website',
				description: 'Extract comprehensive design system including colors, typography, spacing, shadows, and components. <a href="https://docs.brand.dev/api-reference/screenshot-styleguide/extract-design-system-and-styleguide-from-website" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/styleguide',
					},
				},
			},
		],
		default: 'extract',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForStyleguide,
				operation: ['extract'],
			},
		},
		default: '',
		placeholder: 'example.com',
		description: 'Domain name to extract styleguide from',
		routing: {
			request: {
				qs: {
					domain: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForStyleguide,
				operation: ['extract'],
			},
		},
		options: [
			{
				displayName: 'Prioritize',
				name: 'prioritize',
				type: 'options',
				default: 'quality',
				description: 'Screenshot capture priority for styleguide extraction',
				options: [
					{ name: 'Speed', value: 'speed' },
					{ name: 'Quality', value: 'quality' },
				],
				routing: {
					request: {
						qs: {
							prioritize: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				description: 'Timeout in milliseconds for the request (1-300000ms)',
				typeOptions: {
					minValue: 1,
					maxValue: 300000,
				},
				routing: {
					request: {
						qs: {
							timeoutMS: '={{ $value }}',
						},
					},
				},
			},
		],
	},
];
