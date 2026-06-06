import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['utility'] };

export const utilityDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Prefetch by Domain',
				value: 'prefetch',
				action: 'Warm cache for a domain before retrieval',
				description: 'Signal that you will fetch brand data for this domain soon to reduce latency',
				routing: { request: { method: 'POST', url: '/brand/prefetch' } },
			},
			{
				name: 'Prefetch by Email',
				value: 'prefetchByEmail',
				action: 'Warm cache for a domain via email address',
				description:
					'Same as prefetch but accepts an email — extracts and validates the domain. Free/disposable emails are rejected.',
				routing: { request: { method: 'POST', url: '/brand/prefetch-by-email' } },
			},
		],
		default: 'prefetch',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: ['prefetch'] } },
		default: '',
		placeholder: 'stripe.com',
		routing: { request: { body: { domain: '={{ $value }}' } } },
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: { show: { ...show, operation: ['prefetchByEmail'] } },
		default: '',
		placeholder: 'contact@stripe.com',
		description:
			'Free email providers (gmail.com, yahoo.com) and disposable addresses are not allowed',
		routing: { request: { body: { email: '={{ $value }}' } } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...show, operation: ['prefetch', 'prefetchByEmail'] } },
		options: [
			{
				displayName: 'Timeout (Ms)',
				name: 'timeoutMS',
				type: 'number',
				default: 30000,
				typeOptions: { minValue: 1, maxValue: 300000 },
				routing: { request: { body: { timeoutMS: '={{ $value }}' } } },
			},
		],
	},
];
