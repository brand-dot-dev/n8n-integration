# n8n-nodes-context-dev

n8n community node for the [Context.dev](https://context.dev) API — brand intelligence, web scraping, AI extraction, monitoring, and web databases.



**53 operations** across 9 resources, covering the full Context.dev API surface.

## Installation

In n8n, go to **Settings → Community nodes → Install** and enter:

```
n8n-nodes-context-dev
```

Or install it manually:

```sh
npm install n8n-nodes-context-dev
```

## Credentials

1. Get an API key from [context.dev](https://context.dev).
2. In n8n, add a new **Context.dev API** credential.
3. Paste the key. The credential's built-in test verifies it immediately.

The key is sent as a bearer token on every request.

## Operations

### News

| Operation | Endpoint |
|---|---|
| Search company news | `POST /news/search` |

### Parsing

| Operation | Endpoint |
|---|---|
| Parse Bytes | `POST /parse` |

### Web Scraping

| Operation | Endpoint |
|---|---|
| Crawl Sitemap | `GET /web/scrape/sitemap` |
| Crawl Website & Scrape Markdown | `POST /web/crawl` |
| Scrape HTML | `GET /web/scrape/html` |
| Scrape Images | `GET /web/scrape/images` |
| Scrape Markdown | `GET /web/scrape/markdown` |
| Scrape Screenshot | `GET /web/screenshot` |
| Web Search | `POST /web/search` |

### Web Extraction

| Operation | Endpoint |
|---|---|
| Classify NAICS industries | `GET /web/naics` |
| Classify SIC industries | `GET /web/sic` |
| Extract a single product from a URL | `POST /brand/ai/product` |
| Extract products from a brand's website | `POST /brand/ai/products` |
| Extract Structured Website Data | `POST /web/extract` |
| Find website competitors | `GET /web/competitors` |
| Query website data using AI | `POST /brand/ai/query` |
| Scrape Fonts | `GET /web/fonts` |
| Scrape Styleguide | `GET /web/styleguide` |

### People

| Operation | Endpoint |
|---|---|
| Enrich Person | `POST /people/enrich` |
| Retrieve Person | `POST /people/retrieve` |

### Brand Intelligence

| Operation | Endpoint |
|---|---|
| Brand Search | `GET /brand/search` |
| Identify brand from transaction data | `GET /brand/transaction_identifier` |
| Retrieve brand data | `POST /brand/retrieve` |
| Retrieve brand data by company name | `GET /brand/retrieve-by-name` |
| Retrieve brand data by domain | `GET /brand/retrieve` |
| Retrieve brand data by email address | `GET /brand/retrieve-by-email` |
| Retrieve brand data by ISIN | `GET /brand/retrieve-by-isin` |
| Retrieve brand data by stock ticker | `GET /brand/retrieve-by-ticker` |
| Retrieve simplified brand data by domain | `GET /brand/retrieve-simplified` |

### Utility

| Operation | Endpoint |
|---|---|
| Prefetch brand data by email | `POST /brand/prefetch-by-email` |
| Prefetch brand data for a domain | `POST /brand/prefetch` |
| Prefetch data | `POST /utility/prefetch` |

### Monitors

| Operation | Endpoint |
|---|---|
| Create a monitor | `POST /monitors` |
| Delete a monitor | `DELETE /monitors/{monitor_id}` |
| Get a change | `GET /monitors/changes/{change_id}` |
| Get a monitor | `GET /monitors/{monitor_id}` |
| List changes | `GET /monitors/changes` |
| List changes for a monitor | `GET /monitors/{monitor_id}/changes` |
| List monitor runs | `GET /monitors/{monitor_id}/runs` |
| List monitors | `GET /monitors` |
| List runs | `GET /monitors/runs` |
| Monitor credit usage | `GET /monitors/credit-usage` |
| Monitor limits | `GET /monitors/limits` |
| Retrieve a monitor run | `GET /monitors/{monitor_id}/runs/{run_id}` |
| Rotate a monitor webhook secret | `POST /monitors/{monitor_id}/webhook/rotate-secret` |
| Run a monitor now | `POST /monitors/{monitor_id}/run` |
| Update a monitor | `PATCH /monitors/{monitor_id}` |

### Batch

| Operation | Endpoint |
|---|---|
| Cancel a batch | `POST /batch/{batch_id}/cancel` |
| Delete a batch | `DELETE /batch/{batch_id}` |
| Get a batch | `GET /batch/{batch_id}` |
| Get batch results | `GET /batch/{batch_id}/results` |
| List batches | `GET /batch/list` |
| Submit a batch | `POST /batch/submit` |

## Testing against the live API

The package ships a conformance suite that exercises the node's operations against the real API and
prints a pass/fail line for each. Requests are assembled from the **built node's own routing**, so a
green run is evidence about the published artifact rather than a parallel client.

```sh
npm run build
CONTEXT_DEV_API_KEY=your-key npm run test:live
```

Read-only operations run by default; cache-warming and mutating ones are opt-in. See
[`tests/live/README.md`](tests/live/README.md) for flags and for enabling the operations that need
record ids or sample values.

## Compatibility

Requires n8n with `n8nNodesApiVersion: 1`. The node is declarative — every operation is described
as routing metadata and executed by n8n's HTTP engine, with no custom execute step.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Context.dev API documentation](https://docs.context.dev)
- Support: hello@context.dev

## License

MIT
