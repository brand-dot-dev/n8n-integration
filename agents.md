# Agent Context — n8n-nodes-context-dev

## What this repo is

An n8n community node for the [Context.dev API](https://docs.context.dev). It exposes brand intelligence, web scraping, AI data extraction, industry classification, and utility (cache warming) operations as n8n workflow steps.

The node is **declarative-style** — no `execute()` method. All API calls are described as `INodeProperties[]` arrays with `routing` metadata. n8n's HTTP engine handles the actual requests.

---

## Directory structure

```
credentials/
  ContextdevApi.credentials.ts   — API key credential (Bearer auth)
  contextdev.svg                 — Credential icon

nodes/ContextDev/
  ContextDev.node.ts             — Main node: imports all resources, defines requestDefaults
  ContextDev.node.json           — Codex (categories, aliases, docs link)
  context-dev-logo.svg           — Node icon
  resources/
    brand/index.ts               — Brand Intelligence (7 ops, all GET /brand/*)
    web/
      index.ts                   — Operation dropdown + barrel import
      scraping.ts                — URL-based ops: scrapeMd, scrapeHtml, scrapeImages, crawl, scrapeSitemap
      brand.ts                   — Domain-based brand ops: screenshot, styleguide, fonts, competitors
      searchExtract.ts           — search (POST /web/search) + extract (POST /web/extract)
    aiDataExtraction/index.ts    — AI Query, Extract Products, Extract Single Product
    industry/index.ts            — Classify NAICS (GET /web/naics), Classify SIC (GET /web/sic)
    utility/index.ts             — Prefetch by Domain/Email (POST /brand/prefetch*)

tests/
  helpers.ts                     — Shared test utilities (getOperation, urlFor, getAdditionalField, etc.)
  brand.test.ts                  — 40+ assertions for brand resource
  web.test.ts                    — 55+ assertions for web resource (routing, migration, scoping)
  aiDataExtraction.test.ts       — 30+ assertions for AI resource
  industry.test.ts               — 25+ assertions including migration URL checks
  utility.test.ts                — 20+ assertions for utility resource
  node.test.ts                   — Node-level: subtitle, inputs/outputs, manifest, codex
  credentials.test.ts            — Credential structure and auth header
```

---

## Source of truth

The **TypeScript SDK** is authoritative for endpoint URLs, HTTP methods, and parameter names:

```
/Users/main/Projects/n8n-contextdev/context-typescript-sdk/src/resources/
  brand.ts   industry.ts   ai.ts   web.ts   utility.ts
```

When in doubt about a param name (camelCase vs snake_case), endpoint path, or whether a field is GET qs vs POST body — read the SDK first.

---

## Key architectural rules

### Routing types
- **GET** operations send params via `routing: { request: { qs: { key: '={{ $value }}' } } }`
- **POST** operations send params via `routing: { request: { body: { key: '={{ $value }}' } } }`
- When a shared optional field (e.g. `timeoutMS`) applies to both GET and POST operations, it must be **duplicated** with different `name` values (e.g. `timeoutMS` and `timeoutMSPost`) — one qs, one body. Do not share routing across method types.

### displayOptions scoping
- Every field **must** have `displayOptions.show.resource: ['<resource>']` AND `operation: [...]` to scope it correctly
- Inside `additionalFields` collections, inner fields use `displayOptions.show['/operation']` (note the leading slash)
- Multiple `additionalFields` blocks are allowed — each scoped to a different set of operations

### n8n lint rules (enforced by `npm run lint`)
- Operation `options` array must be alphabetically sorted by `name`
- `additionalFields` items must be alphabetically sorted by `displayName`
- `action` strings must be sentence case
- Every operation option must have an `action` field (required for `usableAsTool: true`)
- No trailing period on `description` fields in operation options
- Credential classes must have an `icon` property

### All fields need a `default`
n8n crashes on load if any `INodeProperties` is missing `default`. Every field, including inside `additionalFields`, must have `default`.

---

## Adding a new operation

1. Find the correct resource file (or create one under `nodes/ContextDev/resources/`)
2. Add the operation to the `options` array — alphabetically by `name`
3. Add required input fields scoped to the new operation
4. Add optional fields inside the `additionalFields` collection — alphabetically by `displayName`
5. Check the SDK for the exact param names and HTTP method
6. Run `npm run lint` and fix any issues
7. Add tests to the corresponding `tests/*.test.ts` file — at minimum: routing URL/method, required field existence, key name sent

## Adding a new resource

1. Create `nodes/ContextDev/resources/<name>/index.ts`
2. Export a `<name>Description: INodeProperties[]` array
3. Import and spread it in `ContextDev.node.ts`
4. Add the resource option to the Resource dropdown (alphabetical order)
5. Add a `tests/<name>.test.ts`

---

## Running things

```bash
npm install          # install deps
npm test             # run 246 Jest tests (no API key needed)
npm run lint         # n8n ESLint rules
npm run build        # compile TypeScript → dist/
```

Tests are purely structural — they read `INodeProperties[]` arrays and assert on routing, scoping, and field types. No HTTP calls, no mocking, no API key required.

---

## Common gotchas

- **camelCase params**: the API uses camelCase for most params (`timeoutMS`, `maxAgeMs`, `maxSpeed`, `numCompetitors`, `queryFanout`). Don't snake_case them.
- **`timeoutMS` not `timeout_ms`**: this trips up anyone coming from the Python SDK which uses `timeoutMS` too but looks like it might be snake_case.
- **GET scrape ops are GET not POST**: `scrapeMd`, `scrapeHtml`, `scrapeImages` are all GET with params in query string. The old node had them wrong as POST.
- **NAICS/SIC live under `/web/`**: `GET /web/naics` and `GET /web/sic` — not `/brand/naics`.
- **Screenshot/Styleguide/Fonts/Competitors live under `/web/`**: all moved from `/brand/*` to `/web/*`.
- **`fixedCollection` routing**: `data_to_extract` in AI Query routes via `'={{ $value.datapoint }}'` — the `.datapoint` accesses the named group inside the fixedCollection.
- **`markdownOptions.enabled`**: uses `routing: { send: { type: 'body', property: 'markdownOptions.enabled' } }` — not a nested object literal (which wouldn't evaluate expressions).
