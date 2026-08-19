#!/usr/bin/env node
/**
 * Live conformance suite for this n8n node.
 *
 * Requests are assembled from the BUILT NODE'S OWN ROUTING (dist/) rather than a hand-written
 * client, so a green run is evidence about the node you are about to publish.
 *
 *   npm run build
 *   CONTEXT_DEV_API_KEY=sk-... node tests/live/run-live.mjs
 *
 * Flags:
 *   --only <text>          run operations whose resource/operation/label matches
 *   --include-cache-warm   also run cache-warming operations (they consume credits)
 *   --include-mutating     also run operations that create or change data
 *   --json <file>          write a machine-readable report
 *   --verbose              print each request and a response excerpt
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const has = (k) => argv.includes(k);

const API_KEY = process.env.CONTEXT_DEV_API_KEY || arg('--key', '');
if (!API_KEY) {
  console.error('Missing API key. Set CONTEXT_DEV_API_KEY or pass --key.');
  process.exit(2);
}

const NODE_DIST = join(ROOT, "dist/nodes/ContextDev/ContextDev.node.js");
if (!existsSync(NODE_DIST)) {
  console.error('Built node not found at ' + NODE_DIST + '\nRun: npm run build');
  process.exit(2);
}

// ── load the node exactly as n8n would ─────────────────────────────────────────────────────────
const mod = await import(pathToFileURL(NODE_DIST).href);
const NodeClass = mod["ContextDev"] || Object.values(mod).find((v) => typeof v === 'function');
if (typeof NodeClass !== 'function') {
  console.error('Could not find the node class in ' + NODE_DIST);
  process.exit(2);
}
const description = new NodeClass().description;
const properties = description.properties;
const baseURL = description.requestDefaults?.baseURL;
const staticHeaders = { ...(description.requestDefaults?.headers || {}) };

// ── read the node's routing ────────────────────────────────────────────────────────────────────
const showOf = (f) => f.displayOptions?.show || {};
const opsOf = (f, ns) => { const a = showOf(f)['/operation'] || showOf(f).operation; return a ? a.map((v) => ns + '::' + v) : null; };

// operation catalogue: resource::operation → { method, url }
const catalogue = new Map();
for (const f of properties) {
  if (f.name !== 'operation') continue;
  const res = (showOf(f).resource || [])[0];
  for (const o of f.options || []) {
    const r = o.routing?.request;
    if (r?.url) catalogue.set(res + '::' + o.value, { method: r.method, url: r.url, label: o.name, headers: r.headers || {} });
  }
}

// field routing: which key a field sends, and where
function routedKey(field) {
  const r = field.routing?.request;
  if (r?.qs) return { where: 'qs', key: Object.keys(r.qs)[0] };
  if (r?.body && typeof r.body === 'object') return { where: 'body', key: Object.keys(r.body)[0] };
  if (field.routing?.send?.property) return { where: 'body', key: field.routing.send.property };
  if (Array.isArray(field.routing?.send?.preSend)) return { where: 'binary', key: '' };
  return null;
}

// resource::operation → [{ where, key, fieldName }]
const wiring = new Map();
function record(ops, entry) { for (const op of ops) { if (!wiring.has(op)) wiring.set(op, []); wiring.get(op).push(entry); } }
for (const f of properties) {
  if (f.name === 'operation' || f.name === 'resource') continue;
  const res = (showOf(f).resource || [])[0];
  if (!res) continue;
  const scope = opsOf(f, res) || [...catalogue.keys()].filter((k) => k.startsWith(res + '::'));
  const isColl = f.type === 'collection' || f.type === 'fixedCollection';
  const routed = routedKey(f);
  if (isColl && !routed) {
    for (const sub of f.options || []) {
      const subScope = opsOf(sub, res) || scope;
      const subRouted = routedKey(sub);
      if (subRouted) record(subScope, { ...subRouted, fieldName: sub.name });
    }
    continue;
  }
  if (routed) record(scope, { ...routed, fieldName: f.name });
}

// ── fixtures ───────────────────────────────────────────────────────────────────────────────────
const doc = JSON.parse(readFileSync(join(HERE, 'fixtures.json'), 'utf8'));
const fixtures = doc.fixtures;
const TAGS = (arg('--tag') ? [arg('--tag')] : doc.tags || []);
const only = arg('--only');
const selected = [];
const skipped = [];
const lifecycleMembers = new Set();
for (const lc of (doc.lifecycles || [])) {
  for (const k of [lc.create, lc.delete]) if (k) lifecycleMembers.add(k.includes('::') ? k : k.replace('.', '::'));
}
for (const fx of fixtures) {
  const key = fx.resource + '::' + fx.operation;
  const why =
    lifecycleMembers.has(key) ? 'runs in the ' + 'lifecycle phase' :
    !catalogue.has(key) ? 'not in the built node'
    : fx.needsBinary ? 'binary upload — supply a file to test'
    : fx.needsValues ? 'needs values: ' + fx.needsValues.join(', ')
    : fx.risk === 'needs-id' ? 'needs an existing record id'
    : fx.risk === 'mutating' && !has('--include-mutating') ? 'mutating (--include-mutating)'
    : fx.risk === 'cache-warm' && !has('--include-cache-warm') ? 'cache-warm (--include-cache-warm)'
    : only && !(fx.resource + ' ' + fx.operation + ' ' + (fx.label || '')).toLowerCase().includes(only.toLowerCase()) ? 'filtered out'
    : null;
  if (why) skipped.push({ ...fx, why }); else selected.push(fx);
}

// ── request assembly (mirrors n8n's declarative routing) ───────────────────────────────────────
function setDeep(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  for (const p of parts.slice(0, -1)) cur = cur[p] ??= {};
  cur[parts.at(-1)] = value;
}
function buildRequest(fx) {
  const entry = catalogue.get(fx.resource + '::' + fx.operation);
  let path = entry.url;
  const missingPathParams = [];
  if (path.startsWith('=')) {
    // n8n URL expression: /monitors/{{ $parameter["monitorId"] }}. The field name is camelCased
    // while API ids are snake_case, so try both spellings before giving up.
    const snake = (n) => n.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
    path = path.slice(1).replace(/\{\{\s*\$parameter\["([^"]+)"\]\s*\}\}/g, (_, n) => {
      const v = fx.args[n] ?? fx.args[snake(n)];
      // An unresolved path param silently truncates the URL — /monitors/{id} becomes /monitors/,
      // which hits the LIST endpoint and returns a misleading 200. Refuse to send instead.
      if (v === undefined || v === null || v === '') { missingPathParams.push(n); return ''; }
      return encodeURIComponent(v);
    });
  }
  if (missingPathParams.length) return { unresolved: missingPathParams };
  const qs = new URLSearchParams();
  const body = {};
  let hasBody = false;
  for (const w of wiring.get(fx.resource + '::' + fx.operation) || []) {
    if (!(w.key in fx.args)) continue;
    const v = fx.args[w.key];
    if (w.where === 'qs') qs.set(w.key, typeof v === 'boolean' ? String(v) : String(v));
    else if (w.where === 'body') { setDeep(body, w.key, v); hasBody = true; }
  }
  // any fixture arg not wired to a field still belongs on the wire — dotted keys go to the body.
  // Path params are the exception: they were already consumed by the URL, and echoing them into
  // the body makes the API reject the request with "unrecognized key".
  const camel = (n) => n.replace(/_(.)/g, (_, c) => c.toUpperCase());
  const pathNames = new Set();
  for (const m of String(entry.url).matchAll(/\$parameter\["([^"]+)"\]/g)) { pathNames.add(m[1]); pathNames.add(m[1].replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()); }
  for (const [k, v] of Object.entries(fx.args)) {
    const known = (wiring.get(fx.resource + '::' + fx.operation) || []).some((w) => w.key === k);
    if (known) continue;
    if (pathNames.has(k) || pathNames.has(camel(k))) continue;
    if (entry.method === 'GET' || entry.method === 'DELETE') qs.set(k, String(v));
    else { setDeep(body, k, v); hasBody = true; }
  }
  // Tag every request the API accepts tags on, so this suite's traffic is separable from real
  // usage in the vendor's dashboard. Only applied where the node actually wires a tags field.
  if (TAGS.length) {
    const tagWire = (wiring.get(fx.resource + '::' + fx.operation) || []).find((w) => w.key === 'tags');
    if (tagWire && !('tags' in fx.args)) {
      if (tagWire.where === 'qs') qs.set('tags', TAGS.join(','));
      else setDeep(body, 'tags', TAGS), (hasBody = true);
    }
  }
  const q = qs.toString();
  return {
    method: entry.method,
    url: baseURL + path + (q ? '?' + q : ''),
    headers: { ...staticHeaders, ...entry.headers, Authorization: 'Bearer ' + API_KEY },
    body: hasBody ? JSON.stringify(body) : undefined,
  };
}

// ── sending ────────────────────────────────────────────────────────────────────────────────────
// A 429 says nothing about the node — it says the account's rate limit was reached. Retrying with
// backoff keeps rate limiting from masquerading as a conformance failure, and (critically) keeps a
// throttled cleanup from stranding records on the account.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DELAY = Number(arg('--delay', '0'));
const RETRIES = Number(arg('--retries', '3'));
async function send(req) {
  let res, text = '';
  for (let attempt = 0; ; attempt++) {
    res = await fetch(req.url, { method: req.method, headers: req.headers, body: req.body });
    text = await res.text();
    if (res.status !== 429 || attempt >= RETRIES) break;
    const retryAfter = Number(res.headers.get('retry-after'));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2000 * (attempt + 1));
  }
  if (DELAY) await sleep(DELAY);
  return { status: res.status, text };
}

// ── run ────────────────────────────────────────────────────────────────────────────────────────
const C = process.stdout.isTTY ? { g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', d: '\x1b[2m', b: '\x1b[1m', x: '\x1b[0m' }
                               : { g: '', r: '', y: '', d: '', b: '', x: '' };
const results = [];
let lastResource = null;

console.log('');
console.log(C.b + description.displayName + ' — live conformance' + C.x);
console.log(C.d + baseURL + '  ·  ' + selected.length + ' to run, ' + skipped.length + ' skipped' + (TAGS.length ? '  ·  tagged ' + TAGS.join(',') : '') + C.x);
console.log('');

for (const fx of selected) {
  if (fx.resource !== lastResource) { console.log(C.b + fx.resource + C.x); lastResource = fx.resource; }
  const req = buildRequest(fx);
  const started = Date.now();
  let status = 0, ok = false, note = '', bodyText = '';
  if (req.unresolved) {
    results.push({ ...fx, status: 0, ok: false, ms: 0, note: 'unresolved path param: ' + req.unresolved.join(', ') });
    console.log('  ' + C.r + '✗' + C.x + ' ' + (fx.label || fx.operation).slice(0, 44).padEnd(44) + C.r + '  unresolved path param: ' + req.unresolved.join(', ') + C.x);
    continue;
  }
  try {
    const sent = await send(req);
    status = sent.status;
    bodyText = sent.text;
    ok = fx.expect.statuses.includes(status);
    if (!ok) {
      // an API's error payload may nest objects or arrays (field-level validation); stringify
      // rather than letting it render as [object Object]
      try {
        const j = JSON.parse(bodyText);
        const raw = j.message ?? j.error ?? j.detail ?? j;
        note = (typeof raw === 'string' ? raw : JSON.stringify(raw)).slice(0, 160);
      } catch { note = bodyText.slice(0, 160).replace(/\s+/g, ' '); }
    }
  } catch (e) { note = e.message.slice(0, 80); }
  const ms = Date.now() - started;
  results.push({ ...fx, status, ok, ms, note });
  const mark = ok ? C.g + '✓' + C.x : C.r + '✗' + C.x;
  const label = (fx.label || fx.operation).slice(0, 44).padEnd(44);
  console.log('  ' + mark + ' ' + label + C.d + String(status).padEnd(5) + String(ms).padStart(5) + 'ms' + C.x + (note ? '  ' + C.r + note + C.x : ''));
  if (has('--verbose')) {
    console.log('      ' + C.d + req.method + ' ' + req.url.replace(API_KEY, '***') + C.x);
    if (req.body) console.log('      ' + C.d + req.body.slice(0, 160) + C.x);
    if (bodyText) console.log('      ' + C.d + bodyText.slice(0, 200).replace(/\s+/g, ' ') + C.x);
  }
}

// ── lifecycles ─────────────────────────────────────────────────────────────────────────────────
// Operations bound to a record id cannot be tested against an empty account: there is nothing to
// reference. A lifecycle creates one record, lets every dependent operation run against it, then
// deletes it in a finally block so a mid-run failure still cleans up.
const lifecycles = doc.lifecycles || [];
if (has('--include-mutating') && lifecycles.length) {
  const byKey = new Map(fixtures.map((f) => [f.resource + '::' + f.operation, f]));
  const norm = (k) => (k.includes('::') ? k : k.replace('.', '::'));
  const findId = (obj, want) => {
    // prefer the configured path, else the first id-ish key anywhere in the payload
    const seen = [obj];
    while (seen.length) {
      const cur = seen.shift();
      if (!cur || typeof cur !== 'object') continue;
      for (const [k, v] of Object.entries(cur)) {
        if (typeof v === 'string' && (k === want || k === 'id' || /(^|_)id$/.test(k))) return v;
        if (v && typeof v === 'object') seen.push(v);
      }
    }
    return null;
  };

  for (const lc of lifecycles) {
    const createFx = byKey.get(norm(lc.create));
    if (!createFx) { console.log('\n' + C.y + 'lifecycle ' + lc.name + ': create fixture ' + lc.create + ' not found' + C.x); continue; }
    console.log('');
    console.log(C.b + 'lifecycle: ' + lc.name + C.x);

    const captured = {};
    let createdId = null;
    try {
      const req = buildRequest(createFx);
      const started = Date.now();
      const sent = await send(req);
      const text = sent.text;
      const ms = Date.now() - started;
      const ok = [200, 201, 202].includes(sent.status);
      let note = '';
      if (!ok) { try { const j = JSON.parse(text); const raw = j.message ?? j.error ?? j; note = (typeof raw === 'string' ? raw : JSON.stringify(raw)).slice(0, 160); } catch { note = text.slice(0, 160); } }
      results.push({ ...createFx, status: sent.status, ok, ms, note });
      console.log('  ' + (ok ? C.g + '✓' + C.x : C.r + '✗' + C.x) + ' ' + (createFx.label || lc.create).slice(0, 44).padEnd(44) + C.d + String(sent.status).padEnd(5) + String(ms).padStart(5) + 'ms' + C.x + (note ? '  ' + C.r + note + C.x : ''));
      if (!ok) continue;

      const parsed = JSON.parse(text);
      for (const idName of lc.captures || []) {
        const v = findId(parsed, idName);
        if (v) { captured[idName] = v; createdId = createdId || v; }
      }
      if (!Object.keys(captured).length) { console.log('  ' + C.y + 'no id found in the create response — dependants stay skipped' + C.x); continue; }
      console.log('  ' + C.d + Object.entries(captured).map(([k, v]) => k + '=' + v).join('  ') + C.x);

      // every fixture whose missing values are now all satisfied becomes runnable
      for (const fx of fixtures) {
        if (fx === createFx || (lc.delete && fx.resource + '::' + fx.operation === norm(lc.delete))) continue;
        const needs = fx.needsValues || [];
        if (!needs.length || !needs.every((n) => n in captured)) continue;
        if (fx.risk === 'mutating' && !has('--include-mutating')) continue;
        const resolved = { ...fx, args: { ...fx.args, ...captured } };
        const r2 = buildRequest(resolved);
        if (r2.unresolved) {
          results.push({ ...fx, status: 0, ok: false, ms: 0, note: 'unresolved path param: ' + r2.unresolved.join(', ') });
          console.log('    ' + C.r + '✗' + C.x + ' ' + (fx.label || fx.operation).slice(0, 42).padEnd(42) + C.r + '  unresolved: ' + r2.unresolved.join(', ') + C.x);
          continue;
        }
        const t0 = Date.now();
        let st = 0, ok2 = false, note2 = '';
        try {
          const sent2 = await send(r2);
          st = sent2.status;
          const tt = sent2.text;
          ok2 = fx.expect.statuses.includes(st) || [200, 201, 202, 204].includes(st);
          if (!ok2) { try { const j = JSON.parse(tt); const raw = j.message ?? j.error ?? j; note2 = (typeof raw === 'string' ? raw : JSON.stringify(raw)).slice(0, 160); } catch { note2 = tt.slice(0, 160); } }
        } catch (e) { note2 = e.message.slice(0, 120); }
        const ms2 = Date.now() - t0;
        results.push({ ...fx, status: st, ok: ok2, ms: ms2, note: note2 });
        const idx = skipped.findIndex((sk) => sk.resource === fx.resource && sk.operation === fx.operation);
        if (idx >= 0) skipped.splice(idx, 1);
        console.log('    ' + (ok2 ? C.g + '✓' + C.x : C.r + '✗' + C.x) + ' ' + (fx.label || fx.operation).slice(0, 42).padEnd(42) + C.d + String(st).padEnd(5) + String(ms2).padStart(5) + 'ms' + C.x + (note2 ? '  ' + C.r + note2 + C.x : ''));
      }
    } finally {
      // a lifecycle with no delete leaves a record behind every run — say so, loudly, rather than
      // letting the account quietly fill up
      if (!lc.delete && Object.keys(captured).length) {
        console.log('  ' + C.y + 'no cleanup for ' + lc.name + ' — ' + Object.entries(captured).map(([k, v]) => k + '=' + v).join(' ') + ' remains on the account' + C.x);
        if (lc._note) console.log('  ' + C.d + lc._note + C.x);
      }
      // cleanup runs even if a dependant threw — never leave records behind
      if (lc.delete && Object.keys(captured).length) {
        const delFx = byKey.get(norm(lc.delete));
        if (delFx) {
          const resolved = { ...delFx, args: { ...delFx.args, ...captured } };
          try {
            const rd = buildRequest(resolved);
            const rr = await send(rd);
            const okd = [200, 202, 204].includes(rr.status);
            results.push({ ...delFx, status: rr.status, ok: okd, ms: 0, note: okd ? '' : 'cleanup failed' });
            console.log('  ' + (okd ? C.g + '✓' + C.x : C.r + '✗' + C.x) + ' ' + ('cleanup: ' + (delFx.label || lc.delete)).slice(0, 44).padEnd(44) + C.d + String(rr.status) + C.x);
          } catch (e) {
            console.log('  ' + C.r + '✗ cleanup threw: ' + e.message.slice(0, 80) + C.x);
            console.log('  ' + C.r + 'LEFTOVER ' + lc.name + ' ' + JSON.stringify(captured) + C.x);
          }
        }
      }
    }
  }
}

// ── report ─────────────────────────────────────────────────────────────────────────────────────
const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;
console.log('');
console.log(C.b + 'Result' + C.x + '  ' + C.g + passed + ' passed' + C.x + (failed ? '  ' + C.r + failed + ' failed' + C.x : '') + C.d + '  ' + skipped.length + ' skipped' + C.x);

if (skipped.length) {
  console.log('');
  console.log(C.d + 'Skipped:' + C.x);
  const byReason = new Map();
  for (const s of skipped) { if (!byReason.has(s.why)) byReason.set(s.why, []); byReason.get(s.why).push(s.label || s.operation); }
  for (const [why, ops] of byReason) console.log('  ' + C.d + why + ' — ' + ops.length + C.x + (has('--verbose') ? '\n      ' + ops.join(', ') : ''));
}

const jsonOut = arg('--json');
if (jsonOut) {
  writeFileSync(jsonOut, JSON.stringify({
    node: description.displayName, baseURL, ranAt: new Date().toISOString(),
    passed, failed, skipped: skipped.length,
    results: results.map(({ resource, operation, label, status, ok, ms, note }) => ({ resource, operation, label, status, ok, ms, note })),
    skippedDetail: skipped.map(({ resource, operation, label, why }) => ({ resource, operation, label, why })),
  }, null, 2) + '\n');
  console.log('');
  console.log(C.d + 'report → ' + jsonOut + C.x);
}
console.log('');
process.exit(failed ? 1 : 0);
