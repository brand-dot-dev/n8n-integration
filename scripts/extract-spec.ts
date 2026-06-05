/**
 * Extracts the API contract from the TypeScript SDK resource files.
 * Produces spec.json — the authoritative source for live tests.
 *
 * Usage: npx ts-node scripts/extract-spec.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SDK_DIR = path.resolve(__dirname, '../../context-typescript-sdk/src/resources');
const OUT_FILE = path.resolve(__dirname, '../spec.json');

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParamField {
	name: string;
	type: string;
	required: boolean;
}

interface Endpoint {
	resource: string;
	sdkMethod: string;
	httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
	path: string;
	paramsInterface: string;
	responseInterface: string;
	params: ParamField[];
}

// ─── Parsers ──────────────────────────────────────────────────────────────────

/**
 * Extract all method → (httpMethod, path, paramsType, responseType) from a resource class.
 *
 * Handles both single-line and multi-line method signatures like:
 *   retrieve(query: BrandRetrieveParams, ...): APIPromise<BrandRetrieveResponse> {
 *     return this._client.get('/brand/retrieve', { query, ...options });
 *   }
 */
function extractMethods(src: string, resource: string): Endpoint[] {
	const endpoints: Endpoint[] = [];

	// Match method blocks: name(...): APIPromise<Response> { return this._client.METHOD('path'...
	// We scan for `this._client.get/post/etc` and walk back to find the method name and params
	const clientCallRe = /this\._client\.(get|post|put|delete|patch)\s*\(\s*'([^']+)'/g;
	let match: RegExpExecArray | null;

	while ((match = clientCallRe.exec(src)) !== null) {
		const httpMethod = match[1].toUpperCase() as Endpoint['httpMethod'];
		const apiPath = match[2];
		const callPos = match.index;

		// Walk back from the client call to find the enclosing method signature
		const before = src.slice(0, callPos);
		// Find the last method-like declaration before this call
		const methodRe = /(\w+)\s*\(\s*\n?\s*(?:body|query):\s*(\w+)/g;
		let methodMatch: RegExpExecArray | null;
		let lastMethod: { name: string; paramsType: string } | null = null;

		const searchArea = before.slice(Math.max(0, before.length - 800));
		methodRe.lastIndex = 0;
		while ((methodMatch = methodRe.exec(searchArea)) !== null) {
			lastMethod = { name: methodMatch[1], paramsType: methodMatch[2] };
		}

		// Also try single-line param style: methodName(params: ParamsType,
		const singleLineRe = /(\w+)\s*\(\s*(?:body|query|params):\s*(\w+)/g;
		singleLineRe.lastIndex = 0;
		while ((methodMatch = singleLineRe.exec(searchArea)) !== null) {
			lastMethod = { name: methodMatch[1], paramsType: methodMatch[2] };
		}

		if (!lastMethod) continue;

		// Find the response type: APIPromise<ResponseType>
		const responseMatch = /APIPromise<(\w+)>/.exec(before.slice(Math.max(0, before.length - 400)));
		const responseType = responseMatch ? responseMatch[1] : 'unknown';

		// Skip constructor and non-API methods
		if (['constructor', 'get', 'post', 'put', 'delete', 'patch'].includes(lastMethod.name)) continue;

		endpoints.push({
			resource,
			sdkMethod: lastMethod.name,
			httpMethod,
			path: apiPath,
			paramsInterface: lastMethod.paramsType,
			responseInterface: responseType,
			params: [],
		});
	}

	return endpoints;
}

/**
 * Extract fields from an interface declaration.
 * Handles: fieldName: type  (required) and  fieldName?: type  (optional)
 *
 * Skips nested namespace/interface re-exports and nested objects.
 */
function extractInterfaceFields(src: string, interfaceName: string): ParamField[] {
	// Find the interface block — stop at the matching closing brace
	const startRe = new RegExp(`export interface ${interfaceName}\\s*\\{`);
	const startMatch = startRe.exec(src);
	if (!startMatch) return [];

	let depth = 0;
	let i = startMatch.index + startMatch[0].length - 1; // position of opening {
	const end = src.length;
	let blockEnd = i;

	// Walk forward to find matching }
	for (; i < end; i++) {
		if (src[i] === '{') depth++;
		if (src[i] === '}') {
			depth--;
			if (depth === 0) {
				blockEnd = i;
				break;
			}
		}
	}

	const block = src.slice(startMatch.index + startMatch[0].length, blockEnd);
	const fields: ParamField[] = [];

	// Match field declarations — only top-level (depth 0 within the block)
	// fieldName?: type  or  fieldName: type
	// Skip JSDoc comment lines and nested interfaces
	const lines = block.split('\n');
	let innerDepth = 0;

	for (const line of lines) {
		const trimmed = line.trim();

		// Track depth for nested objects
		innerDepth += (trimmed.match(/\{/g) || []).length;
		innerDepth -= (trimmed.match(/\}/g) || []).length;

		// Only parse top-level fields
		if (innerDepth > 0) continue;
		if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
		if (trimmed.startsWith('export') || trimmed.startsWith('declare')) continue;

		// Match: name?: type  or  name: type
		const fieldRe = /^(\w+)(\?)?:\s*(.+?);?\s*$/;
		const m = fieldRe.exec(trimmed);
		if (!m) continue;

		const [, name, optional, rawType] = m;
		// Skip 'export' keyword matches and common TS keywords
		if (['export', 'import', 'type', 'interface', 'class', 'extends', 'implements'].includes(name)) continue;

		fields.push({
			name,
			type: rawType.trim().replace(/;$/, ''),
			required: !optional,
		});
	}

	return fields;
}

/**
 * For union Params types (e.g. AIExtractProductsParams = ByDomain | ByDirectURL),
 * resolve to the first variant's interface fields.
 */
function resolveUnionParams(src: string, typeName: string): string | null {
	const unionRe = new RegExp(`export type ${typeName}\\s*=\\s*(\\w+)`);
	const m = unionRe.exec(src);
	return m ? m[1] : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
	const resourceFiles = ['brand', 'web', 'ai', 'industry', 'utility'];
	const allEndpoints: Endpoint[] = [];

	for (const resource of resourceFiles) {
		const filePath = path.join(SDK_DIR, `${resource}.ts`);
		const src = fs.readFileSync(filePath, 'utf-8');

		const endpoints = extractMethods(src, resource);

		for (const ep of endpoints) {
			let paramsName = ep.paramsInterface;

			// Handle union types (e.g. AIExtractProductsParams = ByDomain | ByDirectURL)
			const resolved = resolveUnionParams(src, paramsName);
			if (resolved) {
				// Use the ByDomain variant as canonical
				const domainVariant = resolved.includes('ByDomain') ? resolved : resolved;
				paramsName = `${ep.paramsInterface}.${domainVariant}`;
				// Try to find the nested interface
				const nested = resolveUnionParams(src, ep.paramsInterface);
				if (nested) {
					ep.params = extractInterfaceFields(src, nested);
				}
			} else {
				ep.params = extractInterfaceFields(src, paramsName);
			}

			allEndpoints.push(ep);
		}
	}

	// Deduplicate by path + httpMethod (some methods appear via inheritance)
	const seen = new Set<string>();
	const unique = allEndpoints.filter((ep) => {
		const key = `${ep.httpMethod}:${ep.path}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});

	// Sort by resource then path
	unique.sort((a, b) => a.resource.localeCompare(b.resource) || a.path.localeCompare(b.path));

	const spec = {
		generated: new Date().toISOString(),
		sdk_source: SDK_DIR,
		endpoint_count: unique.length,
		endpoints: unique,
	};

	fs.writeFileSync(OUT_FILE, JSON.stringify(spec, null, 2));
	console.log(`✓ Wrote ${unique.length} endpoints to spec.json`);

	// Print summary table
	console.log('\n  Method  Path');
	console.log('  ──────  ────');
	for (const ep of unique) {
		const required = ep.params.filter((p) => p.required).map((p) => p.name).join(', ') || '—';
		console.log(`  ${ep.httpMethod.padEnd(6)}  ${ep.path.padEnd(40)} required: ${required}`);
	}
}

main();
