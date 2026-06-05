/**
 * Extracts the API contract from the TypeScript SDK resource files.
 * Produces spec.json — used by live tests to verify one-to-one response shape.
 *
 * Usage: npx ts-node --compiler-options '{"module":"commonjs"}' scripts/extract-spec.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const SDK_DIR = path.resolve(__dirname, '../../context-typescript-sdk/src/resources');
const OUT_FILE = path.resolve(__dirname, '../spec.json');

// ─── Types ───────────────────────────────────────────────────────────────────

interface Field {
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
	params: Field[];
	responseFields: Field[];
}

// ─── Interface field extractor ────────────────────────────────────────────────

function extractInterfaceFields(src: string, interfaceName: string): Field[] {
	const startRe = new RegExp(`export interface ${interfaceName}\\s*\\{`);
	const startMatch = startRe.exec(src);
	if (!startMatch) return [];

	// Find the matching closing brace
	let depth = 0;
	let blockEnd = startMatch.index;
	for (let i = startMatch.index + startMatch[0].length - 1; i < src.length; i++) {
		if (src[i] === '{') depth++;
		if (src[i] === '}') {
			depth--;
			if (depth === 0) { blockEnd = i; break; }
		}
	}

	const block = src.slice(startMatch.index + startMatch[0].length, blockEnd);
	const fields: Field[] = [];
	let innerDepth = 0;

	for (const line of block.split('\n')) {
		const t = line.trim();
		innerDepth += (t.match(/\{/g) || []).length;
		innerDepth -= (t.match(/\}/g) || []).length;
		if (innerDepth > 0) continue;
		if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) continue;
		if (t.startsWith('export') || t.startsWith('declare') || t.startsWith('[')) continue;

		const m = /^(\w+)(\?)?:\s*(.+?);?\s*$/.exec(t);
		if (!m) continue;
		const [, name, optional, rawType] = m;
		if (['export', 'import', 'type', 'interface', 'class'].includes(name)) continue;

		fields.push({ name, type: rawType.trim().replace(/;$/, ''), required: !optional });
	}

	return fields;
}

// ─── Method extractor ─────────────────────────────────────────────────────────

function extractMethods(src: string, resource: string): Endpoint[] {
	const endpoints: Endpoint[] = [];
	const clientCallRe = /this\._client\.(get|post|put|delete|patch)\s*\(\s*'([^']+)'/g;
	let match: RegExpExecArray | null;

	while ((match = clientCallRe.exec(src)) !== null) {
		const httpMethod = match[1].toUpperCase() as Endpoint['httpMethod'];
		const apiPath = match[2];
		const before = src.slice(0, match.index);
		const searchArea = before.slice(Math.max(0, before.length - 800));

		// Find method name + params type
		let lastMethod: { name: string; paramsType: string } | null = null;
		for (const re of [
			/(\w+)\s*\(\s*\n?\s*(?:body|query):\s*(\w+)/g,
			/(\w+)\s*\(\s*(?:body|query|params):\s*(\w+)/g,
		]) {
			re.lastIndex = 0;
			let m2: RegExpExecArray | null;
			while ((m2 = re.exec(searchArea)) !== null) {
				lastMethod = { name: m2[1], paramsType: m2[2] };
			}
		}
		if (!lastMethod) continue;
		if (['constructor', 'get', 'post', 'put', 'delete', 'patch'].includes(lastMethod.name)) continue;

		// Find response type
		const responseMatch = /APIPromise<(\w+)>/.exec(before.slice(Math.max(0, before.length - 400)));
		const responseType = responseMatch ? responseMatch[1] : 'unknown';

		endpoints.push({
			resource,
			sdkMethod: lastMethod.name,
			httpMethod,
			path: apiPath,
			paramsInterface: lastMethod.paramsType,
			responseInterface: responseType,
			params: [],
			responseFields: [],
		});
	}

	return endpoints;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
	const resourceFiles = ['brand', 'web', 'ai', 'industry', 'utility'];
	const allEndpoints: Endpoint[] = [];

	for (const resource of resourceFiles) {
		const src = fs.readFileSync(path.join(SDK_DIR, `${resource}.ts`), 'utf-8');
		const endpoints = extractMethods(src, resource);

		for (const ep of endpoints) {
			// Params — handle union types (e.g. AIExtractProductsParams = ByDomain | ByDirectURL)
			const unionRe = new RegExp(`export type ${ep.paramsInterface}\\s*=\\s*(\\w+)`);
			const unionMatch = unionRe.exec(src);
			const paramsName = unionMatch ? unionMatch[1] : ep.paramsInterface;
			ep.params = extractInterfaceFields(src, paramsName);

			// Response fields — top-level only
			ep.responseFields = extractInterfaceFields(src, ep.responseInterface);

			allEndpoints.push(ep);
		}
	}

	// Deduplicate by path + method
	const seen = new Set<string>();
	const unique = allEndpoints.filter((ep) => {
		const key = `${ep.httpMethod}:${ep.path}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});

	unique.sort((a, b) => a.resource.localeCompare(b.resource) || a.path.localeCompare(b.path));

	const spec = {
		generated: new Date().toISOString(),
		endpoint_count: unique.length,
		endpoints: unique,
	};

	fs.writeFileSync(OUT_FILE, JSON.stringify(spec, null, 2));
	console.log(`✓ Wrote ${unique.length} endpoints to spec.json\n`);

	for (const ep of unique) {
		const req = ep.params.filter(p => p.required).map(p => p.name).join(', ') || '—';
		const res = ep.responseFields.map(p => p.name).join(', ') || '—';
		console.log(`  ${ep.httpMethod.padEnd(6)} ${ep.path}`);
		console.log(`         params: ${req}`);
		console.log(`         response: ${res}\n`);
	}
}

main();
