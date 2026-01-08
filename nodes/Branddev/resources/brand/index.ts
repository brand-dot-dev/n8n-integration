import type { INodeProperties } from 'n8n-workflow';

const showOnlyForBrand = {
	resource: ['brand'],
};

export const brandDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForBrand,
		},
		options: [
			{
				name: 'Identify From Transaction',
				value: 'identifyByTransaction',
				action: 'Identify brand from transaction data',
				description: 'Identify brands from transaction information with optional geographic and industry context. <a href="https://docs.brand.dev/api-reference/retrieve-brand/identify-brand-from-transaction-data" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/transaction_identifier',
					},
				},
			},
			{
				name: 'Retrieve by Company Name',
				value: 'retrieveByName',
				action: 'Retrieve brand data by company name',
				description: 'Search for company by name and retrieve brand data. <a href="https://docs.brand.dev/api-reference/retrieve-brand/retrieve-brand-data-by-company-name" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/retrieve-by-name',
					},
				},
			},
			{
				name: 'Retrieve by Domain',
				value: 'retrieve',
				action: 'Retrieve brand data by domain',
				description: 'Get brand information including logos, colors, and more. <a href="https://docs.brand.dev/api-reference/retrieve-brand/retrieve-brand-data-by-domain" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/retrieve',
					},
				},
			},
			{
				name: 'Retrieve by Email',
				value: 'retrieveByEmail',
				action: 'Retrieve brand data by email address',
				description: 'Extract domain from email and retrieve brand data (excludes free/disposable emails). <a href="https://docs.brand.dev/api-reference/retrieve-brand/retrieve-brand-data-by-email-address" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/retrieve-by-email',
					},
				},
			},
			{
				name: 'Retrieve by ISIN',
				value: 'retrieveByIsin',
				action: 'Retrieve brand data by ISIN',
				description: 'Look up company by ISIN and retrieve brand data. <a href="https://docs.brand.dev/api-reference/retrieve-brand/retrieve-brand-data-by-isin" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/retrieve-by-isin',
					},
				},
			},
			{
				name: 'Retrieve by Stock Ticker',
				value: 'retrieveByTicker',
				action: 'Retrieve brand data by stock ticker',
				description: 'Look up company by stock ticker symbol and retrieve brand data. <a href="https://docs.brand.dev/api-reference/retrieve-brand/retrieve-brand-data-by-stock-ticker" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/retrieve-by-ticker',
					},
				},
			},
			{
				name: 'Retrieve Simplified by Domain',
				value: 'retrieveSimplified',
				action: 'Retrieve simplified brand data by domain',
				description: 'Get essential brand information (domain, title, colors, logos, backdrops) optimized for speed. <a href="https://docs.brand.dev/api-reference/retrieve-brand/retrieve-simplified-brand-data-by-domain" target="_blank">View docs</a>.',
				routing: {
					request: {
						method: 'GET',
						url: '/brand/retrieve-simplified',
					},
				},
			},
		],
		default: 'retrieve',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForBrand,
				operation: ['retrieve'],
			},
		},
		default: '',
		placeholder: 'example.com',
		description: 'The domain to retrieve brand information for',
		routing: {
			request: {
				qs: {
					domain: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Company Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForBrand,
				operation: ['retrieveByName'],
			},
		},
		default: '',
		placeholder: 'Apple Inc',
		description: 'Company name to search for (3-30 characters)',
		routing: {
			request: {
				qs: {
					name: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForBrand,
				operation: ['retrieveByEmail'],
			},
		},
		default: '',
		placeholder: 'contact@example.com',
		description: 'Email address to extract domain from. Free email providers (gmail.com, yahoo.com) and disposable addresses are not allowed.',
		routing: {
			request: {
				qs: {
					email: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Stock Ticker',
		name: 'ticker',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForBrand,
				operation: ['retrieveByTicker'],
			},
		},
		default: '',
		placeholder: 'AAPL',
		description: 'Stock ticker symbol (1-15 characters, letters/numbers/dots only)',
		routing: {
			request: {
				qs: {
					ticker: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'ISIN',
		name: 'isin',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForBrand,
				operation: ['retrieveByIsin'],
			},
		},
		default: '',
		placeholder: 'US0378331005',
		description: 'International Securities Identification Number',
		routing: {
			request: {
				qs: {
					isin: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Domain',
		name: 'simplifiedDomain',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForBrand,
				operation: ['retrieveSimplified'],
			},
		},
		default: '',
		placeholder: 'example.com',
		description: 'The domain to retrieve simplified brand information for',
		routing: {
			request: {
				qs: {
					domain: '={{ $value }}',
				},
			},
		},
	},
	{
		displayName: 'Transaction Title',
		name: 'transaction_title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				...showOnlyForBrand,
				operation: ['identifyByTransaction'],
			},
		},
		default: '',
		placeholder: 'STARBUCKS STORE #12345',
		description: 'The transaction title or merchant name from the transaction data',
		routing: {
			request: {
				qs: {
					transaction_info: '={{ $value }}',
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
				...showOnlyForBrand,
				operation: ['retrieve', 'retrieveByName', 'retrieveByEmail', 'retrieveByTicker', 'retrieveByIsin', 'retrieveSimplified', 'identifyByTransaction'],
			},
		},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				displayOptions: {
					show: {
						'/operation': ['identifyByTransaction'],
					},
				},
				default: '',
				placeholder: 'San Francisco',
				description: 'City where the transaction occurred',
				routing: {
					request: {
						qs: {
							city: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				displayOptions: {
					show: {
						'/operation': ['identifyByTransaction'],
					},
				},
				default: '',
				placeholder: 'United States',
				description: 'Country where the transaction occurred',
				routing: {
					request: {
						qs: {
							country: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Country GL',
				name: 'country_gl',
				type: 'string',
				displayOptions: {
					show: {
						'/operation': ['identifyByTransaction'],
					},
				},
				default: '',
				placeholder: 'us',
				description: 'ISO 3166-1 alpha-2 country code for geographic search prioritization (e.g., us, gb, ca)',
				routing: {
					request: {
						qs: {
							country_gl: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Force Language',
				name: 'force_language',
				type: 'options',
				default: 'english',
				description: 'Force the language of the retrieved brand data',
				options: [
					{ name: 'Albanian', value: 'albanian' },
					{ name: 'Arabic', value: 'arabic' },
					{ name: 'Azeri', value: 'azeri' },
					{ name: 'Bengali', value: 'bengali' },
					{ name: 'Bulgarian', value: 'bulgarian' },
					{ name: 'Cebuano', value: 'cebuano' },
					{ name: 'Croatian', value: 'croatian' },
					{ name: 'Czech', value: 'czech' },
					{ name: 'Danish', value: 'danish' },
					{ name: 'Dutch', value: 'dutch' },
					{ name: 'English', value: 'english' },
					{ name: 'Estonian', value: 'estonian' },
					{ name: 'Farsi', value: 'farsi' },
					{ name: 'Finnish', value: 'finnish' },
					{ name: 'French', value: 'french' },
					{ name: 'German', value: 'german' },
					{ name: 'Hausa', value: 'hausa' },
					{ name: 'Hawaiian', value: 'hawaiian' },
					{ name: 'Hindi', value: 'hindi' },
					{ name: 'Hungarian', value: 'hungarian' },
					{ name: 'Icelandic', value: 'icelandic' },
					{ name: 'Indonesian', value: 'indonesian' },
					{ name: 'Italian', value: 'italian' },
					{ name: 'Kazakh', value: 'kazakh' },
					{ name: 'Kyrgyz', value: 'kyrgyz' },
					{ name: 'Latin', value: 'latin' },
					{ name: 'Latvian', value: 'latvian' },
					{ name: 'Lithuanian', value: 'lithuanian' },
					{ name: 'Macedonian', value: 'macedonian' },
					{ name: 'Mongolian', value: 'mongolian' },
					{ name: 'Nepali', value: 'nepali' },
					{ name: 'Norwegian', value: 'norwegian' },
					{ name: 'Pashto', value: 'pashto' },
					{ name: 'Pidgin', value: 'pidgin' },
					{ name: 'Polish', value: 'polish' },
					{ name: 'Portuguese', value: 'portuguese' },
					{ name: 'Romanian', value: 'romanian' },
					{ name: 'Russian', value: 'russian' },
					{ name: 'Serbian', value: 'serbian' },
					{ name: 'Slovak', value: 'slovak' },
					{ name: 'Slovenian', value: 'slovenian' },
					{ name: 'Spanish', value: 'spanish' },
					{ name: 'Swedish', value: 'swedish' },
					{ name: 'Turkish', value: 'turkish' },
					{ name: 'Ukrainian', value: 'ukrainian' },
					{ name: 'Uzbek', value: 'uzbek' },
					{ name: 'Vietnamese', value: 'vietnamese' },
				],
				routing: {
					request: {
						qs: {
							force_language: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Latitude',
				name: 'latitude',
				type: 'number',
				displayOptions: {
					show: {
						'/operation': ['identifyByTransaction'],
					},
				},
				default: 0,
				placeholder: '37.7749',
				description: 'Latitude coordinate of the transaction location',
				routing: {
					request: {
						qs: {
							latitude: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Longitude',
				name: 'longitude',
				type: 'number',
				displayOptions: {
					show: {
						'/operation': ['identifyByTransaction'],
					},
				},
				default: 0,
				placeholder: '-122.4194',
				description: 'Longitude coordinate of the transaction location',
				routing: {
					request: {
						qs: {
							longitude: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'MCC (Merchant Category Code)',
				name: 'mcc',
				type: 'string',
				displayOptions: {
					show: {
						'/operation': ['identifyByTransaction'],
					},
				},
				default: '',
				placeholder: '5814',
				description: 'Merchant Category Code (4-digit code) for business category context',
				routing: {
					request: {
						qs: {
							mcc: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Postal Code',
				name: 'postal_code',
				type: 'string',
				displayOptions: {
					show: {
						'/operation': ['identifyByTransaction'],
					},
				},
				default: '',
				placeholder: '94103',
				description: 'Postal or ZIP code of the transaction location',
				routing: {
					request: {
						qs: {
							postal_code: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Speed Optimized',
				name: 'speed_optimized',
				type: 'boolean',
				default: false,
				description: 'Whether to optimize for speed by skipping time-consuming operations. Results in faster response but less comprehensive data.',
				routing: {
					request: {
						qs: {
							speed_optimized: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				displayOptions: {
					show: {
						'/operation': ['identifyByTransaction'],
					},
				},
				default: '',
				placeholder: 'CA',
				description: 'State or province where the transaction occurred',
				routing: {
					request: {
						qs: {
							state: '={{ $value }}',
						},
					},
				},
			},
			{
				displayName: 'Ticker Exchange',
				name: 'ticker_exchange',
				type: 'options',
				displayOptions: {
					show: {
						'/operation': ['retrieveByTicker'],
					},
				},
				default: 'AMEX',
				description: 'Stock exchange for the ticker (defaults to NASDAQ if not specified)',
				options: [
					{ name: 'AMEX', value: 'AMEX' },
					{ name: 'AMS (Amsterdam)', value: 'AMS' },
					{ name: 'ASX (Australia)', value: 'ASX' },
					{ name: 'BME (Madrid)', value: 'BME' },
					{ name: 'BSE (Bombay)', value: 'BSE' },
					{ name: 'BVC (Colombia)', value: 'BVC' },
					{ name: 'CBOE', value: 'CBOE' },
					{ name: 'CPH (Copenhagen)', value: 'CPH' },
					{ name: 'DFM (Dubai)', value: 'DFM' },
					{ name: 'FSX (Frankfurt)', value: 'FSX' },
					{ name: 'HKSE (Hong Kong)', value: 'HKSE' },
					{ name: 'ICE', value: 'ICE' },
					{ name: 'IST (Istanbul)', value: 'IST' },
					{ name: 'JPX (Tokyo)', value: 'JPX' },
					{ name: 'KSC (Korea)', value: 'KSC' },
					{ name: 'LSE (London)', value: 'LSE' },
					{ name: 'MCX (Moscow)', value: 'MCX' },
					{ name: 'MEX (Mexico)', value: 'MEX' },
					{ name: 'MIL (Milan)', value: 'MIL' },
					{ name: 'NASDAQ', value: 'NASDAQ' },
					{ name: 'NSE (India)', value: 'NSE' },
					{ name: 'NYSE', value: 'NYSE' },
					{ name: 'NZX (New Zealand)', value: 'NZX' },
					{ name: 'OSL (Oslo)', value: 'OSL' },
					{ name: 'SGX (Singapore)', value: 'SGX' },
					{ name: 'SHZ (Shenzhen)', value: 'SHZ' },
					{ name: 'SSE (Shanghai)', value: 'SSE' },
					{ name: 'STO (Stockholm)', value: 'STO' },
					{ name: 'SWX (Switzerland)', value: 'SWX' },
					{ name: 'TSX (Toronto)', value: 'TSX' },
					{ name: 'TWSE (Taiwan)', value: 'TWSE' },
					{ name: 'VSE (Vienna)', value: 'VSE' },
				],
				routing: {
					request: {
						qs: {
							ticker_exchange: '={{ $value }}',
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
