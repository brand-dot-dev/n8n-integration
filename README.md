# Context.dev for n8n

Use the public [Context.dev API](https://context.dev) in n8n workflows to search and scrape the live web, extract structured data, monitor websites, process batches, find company news, parse documents, and enrich brand or person data.

The npm package remains named `n8n-nodes-branddev` so existing installations and workflows continue to upgrade normally. New nodes use the Context.dev name and the current production API at `https://api.context.dev/v1`.

## Installation

In n8n, open **Settings → Community Nodes**, select **Install**, and enter:

```text
n8n-nodes-branddev
```

See n8n's [community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) for self-hosted installation options.

## Credentials

1. Create a Context.dev account at [context.dev](https://context.dev).
2. Copy an API key from the [Context.dev dashboard](https://context.dev/home).
3. In n8n, create a **Context.dev API** credential and paste the key.

The credential check calls a read-only account-limits endpoint and does not create work or consume web-data credits.

## Operations

The current node version tracks every operation in the [public API reference](https://docs.context.dev/api-reference).

| Resource           | Operations                                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Web Scraping       | Scrape Markdown, scrape HTML, scrape images, crawl a sitemap, crawl a website, search the web, and take screenshots  |
| Web Extraction     | Extract structured data, styleguides, fonts, NAICS/SIC classifications, and one or many products                     |
| Brand Intelligence | Retrieve a brand by domain, name, email, ticker, direct URL, or transaction; search brands                           |
| News               | Search current company news by name, domain, ticker, or ISIN                                                         |
| Parsing            | Convert binary PDF, Office, image, text, code, and data files into Markdown                                          |
| People             | Enrich a person from email, social profiles, name, company, education, or location clues                             |
| Monitors           | Create, list, retrieve, update, delete, run, and inspect monitors, runs, changes, usage, limits, and webhook secrets |
| Batch              | Submit, list, retrieve, cancel, delete, and read results for scrape or crawl batches                                 |
| Webhooks           | List, retrieve, inspect attempts for, and retry webhook deliveries                                                   |
| Utility            | Prefetch brand or styleguide data                                                                                    |

## Using JSON inputs

Current operations accept the same JSON objects documented by the API. Every operation starts with a valid minimal example that can be edited or replaced with an n8n expression.

For example, **News → Search Company News** starts with:

```json
{
	"searchBy": {
		"type": "entity",
		"entity": {
			"type": "domain",
			"domain": "context.dev"
		}
	},
	"limit": 10
}
```

To get a timestamped YouTube transcript, choose **Web Scraping → Scrape Markdown** and pass the video URL:

```json
{
	"url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

For path-based operations, IDs are separate required fields and are URL-encoded automatically. Destructive operations require an explicit confirmation toggle. Batch submission and webhook retry also expose an optional idempotency key.

## Parsing files

The **Parsing → Parse File** operation reads binary data produced by a previous n8n node. Set **Input Binary Field** to that field's name (usually `data`). The node sends the bytes directly, infers the extension from n8n's binary metadata when possible, and enforces the API's 25 MiB limit before upload.

## Workflow compatibility

- New Context.dev nodes default to version 2 and use only current public endpoints.
- Existing version 1 Brand.dev nodes retain their saved resources, operations, and request shapes.
- The internal node and credential identifiers are unchanged, so upgrading does not orphan saved workflows or credentials.
- All requests use `https://api.context.dev/v1`; the old `api.brand.dev` hostname is no longer emitted.

## Development

Use Node.js 24 for the current n8n development server.

```bash
npm ci
npm run check
npm run dev
```

`npm run check` runs n8n's strict Cloud-compatible lint rules, unit and execution tests, a live contract comparison against Context.dev's published OpenAPI document, a production build, and a production-dependency audit.

## Resources

- [Context.dev documentation](https://docs.context.dev)
- [Context.dev API reference](https://docs.context.dev/api-reference)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Issue tracker](https://github.com/context-dot-dev/n8n-integration/issues)

## License

[MIT](LICENSE)
