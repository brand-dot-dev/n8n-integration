# n8n-nodes-context-dev

This is an n8n community node that lets you interact with the [Context.dev API](https://context.dev) in your n8n workflows.

Context.dev provides brand intelligence, web scraping, AI-powered data extraction, industry classification, and utility operations — covering millions of brands worldwide.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) | [Operations](#operations) | [Credentials](#credentials) | [Compatibility](#compatibility) | [Differences from Zapier / Make](#differences-from-zapier--make) | [Migrating from n8n-nodes-branddev](#migrating-from-n8n-nodes-branddev) | [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

For the n8n desktop app, go to **Settings** > **Community Nodes** and search for `n8n-nodes-context-dev`.

## Operations

The node exposes five resources. Each resource groups related operations.

### Brand Intelligence

| Operation | Description |
|---|---|
| **Retrieve by Domain** | Get logos, colors, fonts, company info, social media, and more for any domain |
| **Retrieve Simplified** | Faster response returning only domain, title, colors, logos, and backdrops |
| **Retrieve by Company Name** | Search by company name and retrieve full brand data |
| **Retrieve by Email** | Extract domain from email address and retrieve brand data (free/disposable providers blocked) |
| **Retrieve by Stock Ticker** | Look up a company by stock ticker symbol across 12+ global exchanges |
| **Retrieve by ISIN** | Look up a company by International Securities Identification Number |
| **Identify From Transaction** | Match a merchant name from a bank statement to a brand |

**Notable options:** `Force Language` (28 languages), `Max Speed` (faster response, less data), `Max Age` (cache freshness control).

---

### Web Scraping

| Operation | Description |
|---|---|
| **Scrape to Markdown** | Scrape any URL and get back clean markdown content |
| **Scrape HTML** | Scrape any URL and return the raw HTML |
| **Scrape Images** | Extract all images from a webpage including URLs, inline SVGs, and metadata |
| **Crawl Website** | Crawl multiple pages of a website and return markdown for each |
| **Crawl Sitemap** | Parse a domain sitemap and return all discovered page URLs |
| **Extract Structured Data** | Crawl a website and extract data matching a JSON schema you define |
| **Search** | Run a web search and get structured results with optional inline markdown |
| **Screenshot** | Capture a screenshot with options for page type (homepage, pricing, login, etc.) and full-page mode |
| **Extract Styleguide** | Extract colors, typography, spacing, shadows, and UI components from a website |
| **Extract Fonts** | Extract font families, usage statistics, fallbacks, and element counts |
| **Extract Competitors** | Identify direct competitors for a given brand domain |

**Notable options:** `URL Regex` (filter crawl/sitemap URLs), `Max Depth` / `Max Pages` (crawl limits), `Stop After (Ms)` (time-budget for crawls), `Fact Check` (ground extraction in page content), `Full Page Screenshot`, `Handle Cookie Popup`, `Query Fanout` (broaden search recall), `Scrape Results to Markdown`.

---

### AI Data Extraction

| Operation | Description |
|---|---|
| **AI Query** | Define named data points and extract them from any domain using AI |
| **Extract Products** | Extract a product catalog (name, description, pricing, features) from a brand website |
| **Extract Single Product** | Extract structured product data from a specific product page URL |

**AI Query** accepts typed data points (text, number, boolean, date, URL, list) and lets you target specific pages (homepage, pricing, about us, blog, careers, etc.).

---

### Industry Classification

| Operation | Description |
|---|---|
| **Classify NAICS** | Get 2022 NAICS (North American Industry Classification System) codes for a domain or company name |
| **Classify SIC** | Get SIC (Standard Industrial Classification) codes — supports the original 1987 dataset or the latest SEC dataset |

Both operations accept a domain or company name, return results with confidence scores, and support configurable min/max result counts.

---

### Utility

| Operation | Description |
|---|---|
| **Prefetch by Domain** | Warm the cache for a domain before retrieval to reduce latency |
| **Prefetch by Email** | Same as Prefetch by Domain but accepts an email address (free/disposable emails rejected) |

---

## Credentials

To use this node, you need a Context.dev API key:

1. Sign up for a free account at [Context.dev](https://context.dev)
2. Go to your [dashboard](https://app.context.dev) and copy your API key
3. In n8n, create new credentials:
   - Go to **Credentials** > **New**
   - Search for "Context.dev API"
   - Paste your API key

The node will automatically test the credentials by making a test request to the Context.dev API.

## Compatibility

- n8n version 1.0.0 and above
- Requires `n8n-workflow` as a peer dependency

## Usage

### Example: Get Brand Logos and Colors

1. Add the **Context.dev** node to your workflow
2. Select **Brand Intelligence** as the resource
3. Choose **Retrieve by Domain**
4. Enter a domain (e.g., `stripe.com`)
5. The node returns comprehensive brand data including logos (SVG/PNG), brand colors, company description, and social media links

### Example: Scrape a Website to Markdown

1. Select **Web Scraping** as the resource
2. Choose **Scrape to Markdown**
3. Enter a URL (e.g., `https://stripe.com/pricing`)
4. Optionally enable **Main Content Only** to strip navigation and footers

### Example: Extract Structured Data with AI

1. Select **AI Data Extraction** as the resource
2. Choose **AI Query**
3. Enter a domain (e.g., `stripe.com`)
4. Add data points — for example: `company_tagline` (text), `has_free_tier` (boolean), `pricing_tiers` (list)
5. Optionally restrict analysis to specific pages such as Homepage or Pricing

### Example: Crawl a Blog

1. Select **Web Scraping** as the resource
2. Choose **Crawl Website**
3. Enter the site URL (e.g., `https://stripe.com/blog`)
4. Set a **URL Regex** like `^https://stripe\.com/blog/` to stay on-topic
5. Set **Max Pages** and **Stop After (Ms)** to control cost and time

### Tips

- Use **Additional Fields** to customize optional parameters on every operation
- The node supports n8n's **Usable as AI Tool** feature, making it compatible with AI agent workflows
- Combine **Extract Competitors** + **Retrieve by Domain** in a loop to build a competitive intelligence pipeline

## Differences from Zapier / Make

The Context.dev n8n node exposes **more operations** than the equivalent Zapier or Make integrations:

- **Web Scraping** — Zapier/Make do not expose the full scraping suite (crawl, sitemap, markdown, HTML, images, search, structured extraction)
- **AI Data Extraction** — the AI Query and product extraction operations are n8n-exclusive
- **Utility** — prefetch operations for cache warming are available only in n8n
- **Industry Classification** — both NAICS and SIC classification are available; Make only exposes NAICS
- **Brand Intelligence** — all seven lookup methods (domain, simplified, name, email, ticker, ISIN, transaction) are available; Zapier exposes a subset

## Migrating from n8n-nodes-branddev

This package replaces `n8n-nodes-branddev`. The underlying service has migrated from Brand.dev to Context.dev.

### What changed

| | Old (`n8n-nodes-branddev`) | New (`n8n-nodes-context-dev`) |
|---|---|---|
| Package name | `n8n-nodes-branddev` | `n8n-nodes-context-dev` |
| Node name | Brand.dev | Context.dev |
| Credential type | Brand.dev API | Context.dev API |
| API base URL | `https://api.brand.dev/v1` | `https://api.context.dev/v1` |
| Resources | Brand, Industry Classification, Screenshot/Styleguide | Brand Intelligence, Web Scraping, AI Data Extraction, Industry Classification, Utility |

### Migration steps

1. In n8n, go to **Settings** > **Community Nodes** and install `n8n-nodes-context-dev`
2. Uninstall `n8n-nodes-branddev`
3. Create new **Context.dev API** credentials using your Context.dev API key (available at [app.context.dev](https://app.context.dev))
4. In each workflow that used the old Brand.dev node, replace it with the new Context.dev node and re-select the equivalent resource and operation
5. Operations that existed in the old node are preserved under the **Brand Intelligence** resource with the same names — no parameter changes are required for those operations

### Operations that moved resources

The following operations were previously under **Screenshot / Styleguide** and are now under **Web Scraping**:

- Take Screenshot → Screenshot
- Extract Styleguide → Extract Styleguide
- Extract Fonts → Extract Fonts

## Development

To run the test suite:

```bash
npm test
```

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Context.dev API Documentation](https://docs.context.dev)
- [Context.dev API Reference](https://docs.context.dev/api-reference)
- [GitHub Repository](https://github.com/context-dot-dev/n8n-integration)

## License

MIT
