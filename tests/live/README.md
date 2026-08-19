# Live conformance suite

Exercises every operation this node exposes against the real API and prints a pass/fail line per
operation. Requests are assembled from the **built node's own routing** (`dist/`) rather than a
separate client, so a green run is evidence about the artifact you are about to publish.

## Run it

```sh
npm run build
CONTEXT_DEV_API_KEY=sk-... node tests/live/run-live.mjs
```

| Flag | Effect |
|---|---|
| `--only <text>` | run just the operations matching a resource, operation or label |
| `--include-cache-warm` | also run cache-warming operations (these consume credits) |
| `--include-mutating` | also run operations that create or change data |
| `--json <file>` | write a machine-readable report |
| `--verbose` | print each request, response excerpt, and the full skip list |

Exit code is non-zero if any operation fails, so it drops straight into CI.

## What runs by default

Only read-only operations with complete arguments — 33 of 53. Everything else is
listed under **Skipped** with the reason:

- **needs values** — a required parameter has no sample value in `fixtures.json`
- **needs an existing record id** — the path contains an id (`/monitors/{monitor_id}`)
- **mutating** / **cache-warm** — opt in with the flags above
- **binary upload** — supply a file to exercise it

## Adding coverage

`fixtures.json` is a plain list. To enable an operation, fill in its `args` and remove the
`needsValues` marker. To test an id-bound operation, paste a real id into `args` and change
`risk` to `read`. Keep expectations semantic — status codes, not response snapshots — so the suite
does not go red every time the API adds a field.

A deliberate plan-gated status (a `403` for a feature your key does not include) belongs in
`expect.statuses` so it reads as an allowed result rather than a failure.

## Lifecycles

`lifecycles` in `fixtures.json` cover operations bound to a record id, which cannot be tested
against an empty account. Each one creates a record, lets every dependent operation run against the
captured id, then deletes it in a `finally` block so a mid-run failure still cleans up. They only
run with `--include-mutating`.

A lifecycle without a `delete` leaves its record behind on every run — the runner prints a warning
naming what remains. Rate limiting is retried with backoff (`--retries`, `--delay`) specifically so
a throttled cleanup does not strand records.
