import type { IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';

/**
 * preSend hook for operations whose request body is raw bytes (application/octet-stream and
 * friends). Reads the item's binary property, sends the buffer as the body, and replaces the
 * node's default JSON Content-Type with the file's own mime type.
 */
export async function sendBinaryBody(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const propertyName = (this.getNodeParameter('binaryPropertyName') as string) || 'data';
	const binary = this.helpers.assertBinaryData(propertyName);
	requestOptions.body = await this.helpers.getBinaryDataBuffer(propertyName);
	requestOptions.headers = {
		...requestOptions.headers,
		'Content-Type': binary.mimeType || 'application/octet-stream',
	};
	// the buffer is already the payload — stop the client from JSON-serialising it
	requestOptions.json = false;
	return requestOptions;
}

export const parsingDescription: INodeProperties[] = [
		{
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			displayOptions: { show: { resource: ['parsing'] } },
			options: [
			{ name: 'Parse Bytes', value: 'parseBytes', action: 'Parse bytes', description: 'Converts raw text, source code, web/data, PDF, Microsoft Office, and image bytes into LLM-usable Markdown', routing: { request: { method: 'POST', url: '/parse' } } },
			],
			default: 'parseBytes',
		},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: { show: { resource: ['parsing'], operation: ['parseBytes'] } },
		description: 'Name of the binary property containing the file to send as the request body (accepts application/octet-stream, application/pdf, */*)',
		routing: { send: { preSend: [sendBinaryBody] } },
	},
	{
		displayName: 'PDF',
		name: 'pdf',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['parsing'], operation: ['parseBytes'] } },
		options: [
			{
				displayName: 'Start',
				name: 'start',
				type: 'number',
				default: 1,
				typeOptions: {"minValue":1},
				description: 'First 1-based PDF page to parse. When omitted, parsing starts at the first page.',
			},
			{
				displayName: 'End',
				name: 'end',
				type: 'number',
				default: 1,
				typeOptions: {"minValue":1},
				description: 'Last 1-based PDF page to parse. When omitted, parsing ends at the last page. Must be greater than or equal to start when both are provided.',
			},
		],
		routing: { request: { qs: { "pdf": '={{ $value }}' } } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['parsing'], operation: ['parseBytes'] } },
		options: [
			{
				displayName: 'Client',
				name: 'client',
				type: 'string',
				default: "",
				description: 'Optional client identifier used for usage attribution',
				routing: { request: { qs: { "client": '={{ $value || undefined }}' } } },
			},
			{
				displayName: 'Extension',
				name: 'extension',
				type: 'options',
				default: "txt",
				options: [{ name: 'Atom', value: "atom" }, { name: 'Bash', value: "bash" }, { name: 'Bmp', value: "bmp" }, { name: 'Cjs', value: "cjs" }, { name: 'CSS', value: "css" }, { name: 'Csv', value: "csv" }, { name: 'Doc', value: "doc" }, { name: 'Docx', value: "docx" }, { name: 'Fish', value: "fish" }, { name: 'Gif', value: "gif" }, { name: 'Htm', value: "htm" }, { name: 'HTML', value: "html" }, { name: 'Java', value: "java" }, { name: 'Jpe', value: "jpe" }, { name: 'Jpeg', value: "jpeg" }, { name: 'Jpg', value: "jpg" }, { name: 'Js', value: "js" }, { name: 'JSON', value: "json" }, { name: 'Jsonl', value: "jsonl" }, { name: 'Jsx', value: "jsx" }, { name: 'Less', value: "less" }, { name: 'Markdown', value: "markdown" }, { name: 'Md', value: "md" }, { name: 'Mjs', value: "mjs" }, { name: 'Ndjson', value: "ndjson" }, { name: 'Pbm', value: "pbm" }, { name: 'PDF', value: "pdf" }, { name: 'Pgm', value: "pgm" }, { name: 'Php', value: "php" }, { name: 'Png', value: "png" }, { name: 'Pnm', value: "pnm" }, { name: 'Pot', value: "pot" }, { name: 'Potm', value: "potm" }, { name: 'Potx', value: "potx" }, { name: 'Ppm', value: "ppm" }, { name: 'Pps', value: "pps" }, { name: 'Ppsm', value: "ppsm" }, { name: 'Ppsx', value: "ppsx" }, { name: 'Ppt', value: "ppt" }, { name: 'Pptm', value: "pptm" }, { name: 'Pptx', value: "pptx" }, { name: 'Py', value: "py" }, { name: 'Rb', value: "rb" }, { name: 'Rss', value: "rss" }, { name: 'Rtf', value: "rtf" }, { name: 'Sass', value: "sass" }, { name: 'Scss', value: "scss" }, { name: 'Sh', value: "sh" }, { name: 'Srt', value: "srt" }, { name: 'Styl', value: "styl" }, { name: 'Svg', value: "svg" }, { name: 'Text', value: "text" }, { name: 'Tif', value: "tif" }, { name: 'Tiff', value: "tiff" }, { name: 'Ts', value: "ts" }, { name: 'Tsv', value: "tsv" }, { name: 'Tsx', value: "tsx" }, { name: 'Txt', value: "txt" }, { name: 'Webp', value: "webp" }, { name: 'Xhtml', value: "xhtml" }, { name: 'Xls', value: "xls" }, { name: 'Xlsb', value: "xlsb" }, { name: 'Xlsm', value: "xlsm" }, { name: 'Xlsx', value: "xlsx" }, { name: 'Xltm', value: "xltm" }, { name: 'Xltx', value: "xltx" }, { name: 'Xml', value: "xml" }, { name: 'Yaml', value: "yaml" }, { name: 'Yml', value: "yml" }, { name: 'Zsh', value: "zsh" }],
				description: 'Optional file extension hint, such as PDF, docx, xlsx, pptx, HTML, JSON, csv, md, py, rtf, jpg, png, or txt',
				routing: { request: { qs: { "extension": '={{ $value || undefined }}' } } },
			},
			{
				displayName: 'Include Images',
				name: 'includeImages',
				type: 'boolean',
				default: false,
				description: 'Whether include image references in Markdown output',
				routing: { request: { qs: { "includeImages": '={{ $value ? "true" : "false" }}' } } },
			},
			{
				displayName: 'Include Links',
				name: 'includeLinks',
				type: 'boolean',
				default: true,
				description: 'Whether preserve hyperlinks in Markdown output',
				routing: { request: { qs: { "includeLinks": '={{ $value ? "true" : "false" }}' } } },
			},
			{
				displayName: 'OCR',
				name: 'ocr',
				type: 'boolean',
				default: false,
				description: 'Whether true for PDF inputs, OCR the selected pages that have no usable text layer (scans), replacing each recovered page\'s text with the OCR result while pages with a real text layer keep it. PDF.start/PDF.end limit the inclusive page range. Billed at 1 credit per page OCR actually recovered, on top of the base request cost. When false, no OCR runs.',
				routing: { request: { qs: { "ocr": '={{ $value ? "true" : "false" }}' } } },
			},
			{
				displayName: 'Shorten Base64 Images',
				name: 'shortenBase64Images',
				type: 'boolean',
				default: true,
				description: 'Whether shorten base64-encoded image data in the Markdown output',
				routing: { request: { qs: { "shortenBase64Images": '={{ $value ? "true" : "false" }}' } } },
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: "",
				description: 'Optional tags for tracking usage. Up to 20 tags, each 1 to 50 characters.',
				routing: { request: { qs: { "tags": '={{ $value || undefined }}' } } },
			},
			{
				displayName: 'Use Main Content Only',
				name: 'useMainContentOnly',
				type: 'boolean',
				default: false,
				description: 'Whether extract only the main content from HTML-like inputs',
				routing: { request: { qs: { "useMainContentOnly": '={{ $value ? "true" : "false" }}' } } },
			},
			{
				displayName: 'ZDR',
				name: 'zdr',
				type: 'options',
				default: "disabled",
				options: [{ name: 'Disabled', value: "disabled" }, { name: 'Enabled', value: "enabled" }],
				description: 'Set to enabled to bypass shared caches and omit request and response content from retained usage logs. Requires zero data retention to be enabled for your organization (contact support@context.dev), otherwise the request fails with ZDR_NOT_ENABLED. Successful ZDR responses include X-Context-ZDR: true.',
				routing: { request: { qs: { "zdr": '={{ $value || undefined }}' } } },
			},
		],
	},
];
