# n8n-nodes-branddev

This is an n8n community node that lets you interact with the [Brand.dev API](https://brand.dev) in your n8n workflows.

Brand.dev provides comprehensive brand data including logos, colors, fonts, screenshots, styleguides, and company information for millions of brands worldwide.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation) | [Operations](#operations) | [Credentials](#credentials) | [Compatibility](#compatibility) | [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

For the n8n desktop app, go to **Settings** > **Community Nodes** and search for `n8n-nodes-branddev`.

## Operations

This node supports the following resources and operations:

### Brand
- **Retrieve by Domain** - Get brand information by domain name
  - Returns logos, colors, fonts, company info, social media, and more
  - Supports 50+ languages via `force_language` parameter
  - Optional speed optimization for faster responses
  - Configurable timeout (1-300,000ms)
  
- **Retrieve by Company Name** - Search for a company by name and retrieve brand data
  - Fuzzy search for company names (3-30 characters)
  - Returns comprehensive brand data
  
- **Retrieve by Email** - Extract domain from email and retrieve brand data
  - Excludes free email providers (gmail.com, yahoo.com, etc.)
  - Blocks disposable email addresses
  
- **Retrieve by Stock Ticker** - Look up company by stock ticker symbol
  - Supports 30+ global stock exchanges (NASDAQ, NYSE, LSE, JPX, HKSE, etc.)
  - Configurable exchange via `ticker_exchange` parameter
  
- **Retrieve by ISIN** - Look up company by International Securities Identification Number
  - Global securities identification
  - Returns full brand data

### Industry Classification (NAICS)
- **Classify Brand** - Get NAICS (North American Industry Classification System) codes for any brand
  - Accepts domain or company name as input
  - Returns 1-10 NAICS codes with confidence scores
  - Configurable min/max results
  - Supports detailed 6-digit NAICS codes

### Screenshot / Styleguide
- **Take Screenshot** - Capture a viewport or full-page screenshot of any website
  - Viewport or full-page screenshots
  - Specific page types (login, pricing, careers, contact, blog, etc.)
  - Quality vs speed optimization
  - Returns high-quality screenshot URL
  
- **Extract Styleguide** - Extract comprehensive design system including colors, typography, spacing, shadows, and components
  - Color palettes with usage statistics
  - Typography scales and font information
  - Spacing and sizing systems
  - Box shadows and border radius values
  - Component patterns and styles
  
- **Extract Fonts** - Get detailed font information including families, usage statistics, and fallbacks
  - Font family detection
  - Usage statistics (element count, word count)
  - Fallback chains
  - Font weights and styles

## Credentials

To use this node, you need a Brand.dev API key:

1. Sign up for a free account at [Brand.dev](https://brand.dev)
2. Go to your [dashboard](https://brand.dev/home) and copy your API key
4. In n8n, create new credentials:
   - Go to **Credentials** > **New**
   - Search for "Brand.dev API"
   - Paste your API key

The node will automatically test the credentials by making a test request to the Brand.dev API.

## Compatibility

This node has been tested with:
- n8n version 1.0.0 and above
- Requires n8n-workflow as a peer dependency

## Usage

### Example: Get Brand Logos and Colors

1. Add the Brand.dev node to your workflow
2. Select **Brand** as the resource
3. Choose **Retrieve by Domain** operation
4. Enter a domain (e.g., `stripe.com`)
5. The node returns comprehensive brand data including:
   - Logos (SVG, PNG formats with different variations)
   - Brand colors (primary, accent, background)
   - Company information
   - Social media links

### Example: Take Website Screenshots

1. Select **Screenshot / Styleguide** as the resource
2. Choose **Take Screenshot** operation
3. Enter a domain and optionally enable full-page screenshot
4. Get a high-quality screenshot URL

### Tips

- Use the **Additional Fields** to customize API requests with optional parameters
- Combine with other n8n nodes to enrich your data pipelines
- The node supports n8n's usable as AI tool feature for AI-powered workflows

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Brand.dev API Documentation](https://docs.brand.dev)
- [Brand.dev API Reference](https://docs.brand.dev/api-reference)
- [GitHub Repository](https://github.com/nikhilrado/brand-dev-n8n)

## License

MIT
