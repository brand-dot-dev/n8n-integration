# Agent context — n8n-nodes-context-dev

## Read this first

`nodes/` and `credentials/` are kept in lockstep with the Context.dev API contract and are
maintained as a set, not file by file. Before changing anything under them, open an issue describing
the mismatch you found — a local edit to one resource file is likely to be replaced wholesale the
next time the node is synced to the API.

Safe to edit directly: `package.json`, `.github/`, `CHANGELOG.md`, `tests/live/fixtures.json`.

## What the node is

A declarative n8n community node: no `execute()` method. Every operation is an entry in an
`INodeProperties[]` array with `routing` metadata, and n8n's HTTP engine performs the request.

- **53 operations** across 9 resources
- Base URL `https://api.context.dev/v1`, bearer auth
- One file per resource under `nodes/ContextDev/resources/`

| Resource | Display name | Operations |
|---|---|---|
| `news` | News | 1 |
| `parsing` | Parsing | 1 |
| `webScraping` | Web Scraping | 7 |
| `webExtraction` | Web Extraction | 9 |
| `people` | People | 2 |
| `brandIntelligence` | Brand Intelligence | 9 |
| `utility` | Utility | 3 |
| `monitors` | Monitors | 15 |
| `batch` | Batch | 6 |

## Layout

```
credentials/
  ContextdevApi.credentials.ts   — API key credential + credential test
nodes/ContextDev/
  ContextDev.node.ts        — node class: resource dropdown, requestDefaults, spreads
  ContextDev.node.json      — n8n codex: categories, docs link, search aliases
  resources/<name>/index.ts     — INodeProperties[] for one resource
tests/live/
  run-live.mjs                  — live conformance runner (drives the built node in dist/)
  fixtures.json                 — per-operation arguments and expected statuses
```

## Routing conventions

- query params → `routing.request.qs`; booleans serialise as `"true"`/`"false"`
- body params → `routing.send.property` with the dotted path
- deep-object query → a `collection` field whose sub-fields are the leaf segments
- path params → no field routing; the operation URL interpolates `$parameter["name"]`
- raw binary bodies → a binary input plus a `sendBinaryBody` preSend hook
- optional fields use omit-empty expressions so an unset field is never sent

## Verifying a change

```sh
npm run lint     # n8n eslint rules (must be clean for n8n Cloud verification)
npm run build    # tsc → dist/, copies icons and the codex
CONTEXT_DEV_API_KEY=... npm run test:live    # live conformance against the real API
```

The live suite assembles its requests from the **built node in `dist/`**, so it tests the artifact
that ships rather than a parallel client. Read-only operations run by default; see
`tests/live/README.md`.

## Common traps

- Editing a resource file to add a single operation. Resource files are maintained as a set against
  the API contract; a one-off addition here will not survive the next sync.
- Renaming an operation `value` or the credential `name`. These are load-bearing identifiers:
  changing one breaks every saved workflow or credential in the wild.
- Adding an assertion that restates the API contract (endpoint URLs, enum values, parameter names).
  Those are verified upstream before the node is synced; a copy here only goes stale.
