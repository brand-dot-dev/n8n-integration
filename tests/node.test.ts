import { NodeConnectionTypes } from 'n8n-workflow';
import { ContextDev } from '../nodes/ContextDev/ContextDev.node';
import nodeJson from '../nodes/ContextDev/ContextDev.node.json';
import packageJson from '../package.json';

describe('ContextDev node', () => {
	const node = new ContextDev();
	const desc = node.description;

	// ─── Identity ──────────────────────────────────────────────────────────────

	describe('identity', () => {
		it('displayName is Context.dev', () => {
			expect(desc.displayName).toBe('Context.dev');
		});

		it('name is contextDev', () => {
			expect(desc.name).toBe('contextDev');
		});

		it('name is NOT branddev (old name)', () => {
			expect(desc.name).not.toBe('branddev');
		});

		it('version is 1', () => {
			expect(desc.version).toBe(1);
		});

		it('group is [transform]', () => {
			expect(desc.group).toEqual(['transform']);
		});
	});

	// ─── Defaults ─────────────────────────────────────────────────────────────

	describe('defaults', () => {
		it('defaults.name is Context.dev', () => {
			expect(desc.defaults.name).toBe('Context.dev');
		});
	});

	// ─── Inputs / Outputs ─────────────────────────────────────────────────────

	describe('inputs and outputs', () => {
		it('has one Main input', () => {
			expect(desc.inputs).toEqual([NodeConnectionTypes.Main]);
		});

		it('has one Main output', () => {
			expect(desc.outputs).toEqual([NodeConnectionTypes.Main]);
		});
	});

	// ─── subtitle ─────────────────────────────────────────────────────────────

	describe('subtitle', () => {
		it('subtitle is defined', () => {
			expect(desc.subtitle).toBeDefined();
		});

		it('subtitle is a non-empty string', () => {
			expect(typeof desc.subtitle).toBe('string');
			expect((desc.subtitle as string).length).toBeGreaterThan(0);
		});

		it('subtitle references $parameter["operation"] and $parameter["resource"]', () => {
			expect(desc.subtitle).toContain('$parameter["operation"]');
			expect(desc.subtitle).toContain('$parameter["resource"]');
		});
	});

	// ─── API config ────────────────────────────────────────────────────────────

	describe('API config', () => {
		it('baseURL is https://api.context.dev/v1', () => {
			expect(desc.requestDefaults?.baseURL).toBe('https://api.context.dev/v1');
		});

		it('baseURL does NOT contain brand.dev', () => {
			expect(desc.requestDefaults?.baseURL).not.toContain('brand.dev');
		});

		it('integration_name header is n8n', () => {
			const headers = desc.requestDefaults?.headers as Record<string, string>;
			expect(headers?.integration_name).toBe('n8n');
		});

		it('Accept header is application/json', () => {
			const headers = desc.requestDefaults?.headers as Record<string, string>;
			expect(headers?.Accept).toBe('application/json');
		});

		it('Content-Type header is application/json', () => {
			const headers = desc.requestDefaults?.headers as Record<string, string>;
			expect(headers?.['Content-Type']).toBe('application/json');
		});
	});

	// ─── Credentials ───────────────────────────────────────────────────────────

	describe('credentials', () => {
		it('credential name is contextdevApi', () => {
			expect(desc.credentials?.[0].name).toBe('contextdevApi');
		});

		it('credential name is NOT branddevApi (old name)', () => {
			expect(desc.credentials?.[0].name).not.toBe('branddevApi');
		});

		it('credential is marked required', () => {
			expect(desc.credentials?.[0].required).toBe(true);
		});
	});

	// ─── Capabilities ──────────────────────────────────────────────────────────

	describe('capabilities', () => {
		it('usableAsTool is true', () => {
			expect(desc.usableAsTool).toBe(true);
		});
	});

	// ─── Resource dropdown ─────────────────────────────────────────────────────

	describe('resource dropdown', () => {
		const resourceProp = () => desc.properties.find((p) => p.name === 'resource')!;
		const resourceValues = () =>
			(resourceProp().options as { value: string }[]).map((o) => o.value);

		it('resource property has noDataExpression: true', () => {
			expect(resourceProp().noDataExpression).toBe(true);
		});

		it('has exactly 5 resources', () => {
			expect(resourceValues()).toHaveLength(5);
		});

		it('includes brand', () => expect(resourceValues()).toContain('brand'));
		it('includes web', () => expect(resourceValues()).toContain('web'));
		it('includes aiDataExtraction', () => expect(resourceValues()).toContain('aiDataExtraction'));
		it('includes industry', () => expect(resourceValues()).toContain('industry'));
		it('includes utility (new)', () => expect(resourceValues()).toContain('utility'));

		it('does NOT include screenshot (merged into web)', () => {
			expect(resourceValues()).not.toContain('screenshot');
		});
	});

	// ─── Operation dropdown defaults ──────────────────────────────────────────

	describe('operation dropdown defaults point to real operations', () => {
		it('each operation dropdown default value exists in its own options', () => {
			const operationProps = desc.properties.filter(
				(p) => p.name === 'operation' && p.type === 'options',
			);
			for (const prop of operationProps) {
				const optionValues = (prop.options as { value: string }[]).map((o) => o.value);
				expect(optionValues).toContain(prop.default);
			}
		});
	});

	// ─── displayOptions.show.resource on every operation dropdown ─────────────

	describe('operation dropdowns are scoped to their resource', () => {
		const resourceToOpDefault: Record<string, string> = {
			brand: 'retrieve',
			web: 'scrapeMd',
			aiDataExtraction: 'aiQuery',
			industry: 'retrieveNaics',
			utility: 'prefetch',
		};

		for (const [resource, sampleOp] of Object.entries(resourceToOpDefault)) {
			it(`${resource} operation dropdown has displayOptions.show.resource: ['${resource}']`, () => {
				const operationProp = desc.properties.find(
					(p) =>
						p.name === 'operation' &&
						p.type === 'options' &&
						(p.options as { value: string }[]).some((o) => o.value === sampleOp),
				);
				expect(operationProp).toBeDefined();
				const showResource = (
					operationProp!.displayOptions?.show as Record<string, string[]>
				)?.resource;
				expect(showResource).toEqual([resource]);
			});
		}
	});

	// ─── All 5 resource descriptions are spread in ────────────────────────────

	describe('all resource descriptions are wired up', () => {
		it('brand operations exist in node properties', () => {
			const ops = desc.properties
				.filter((p) => p.name === 'operation')
				.flatMap((p) => (p.options as { value: string }[]).map((o) => o.value));
			expect(ops).toContain('retrieve');
		});

		it('web operations exist in node properties', () => {
			const ops = desc.properties
				.filter((p) => p.name === 'operation')
				.flatMap((p) => (p.options as { value: string }[]).map((o) => o.value));
			expect(ops).toContain('scrapeMd');
		});

		it('aiDataExtraction operations exist in node properties', () => {
			const ops = desc.properties
				.filter((p) => p.name === 'operation')
				.flatMap((p) => (p.options as { value: string }[]).map((o) => o.value));
			expect(ops).toContain('aiQuery');
		});

		it('industry operations exist in node properties', () => {
			const ops = desc.properties
				.filter((p) => p.name === 'operation')
				.flatMap((p) => (p.options as { value: string }[]).map((o) => o.value));
			expect(ops).toContain('retrieveNaics');
		});

		it('utility operations exist in node properties', () => {
			const ops = desc.properties
				.filter((p) => p.name === 'operation')
				.flatMap((p) => (p.options as { value: string }[]).map((o) => o.value));
			expect(ops).toContain('prefetch');
		});
	});

	// ─── .node.json codex ─────────────────────────────────────────────────────

	describe('.node.json codex', () => {
		it('codex does not reference brand.dev', () => {
			const text = JSON.stringify(nodeJson);
			expect(text).not.toContain('brand.dev');
		});

		it('codex does not reference Brand.dev (capitalized)', () => {
			const text = JSON.stringify(nodeJson);
			expect(text).not.toContain('Brand.dev');
		});

		it('primaryDocumentation URL points to context.dev', () => {
			const text = JSON.stringify(nodeJson);
			expect(text).toContain('context.dev');
		});
	});

	// ─── package.json manifest ────────────────────────────────────────────────

	describe('package.json n8n manifest', () => {
		it('n8nNodesApiVersion is 1', () => {
			expect((packageJson as { n8n: { n8nNodesApiVersion: number } }).n8n.n8nNodesApiVersion).toBe(1);
		});

		it('credentials manifest points to ContextdevApi dist path', () => {
			const creds = (packageJson as { n8n: { credentials: string[] } }).n8n.credentials;
			expect(creds.some((c: string) => c.includes('ContextdevApi'))).toBe(true);
		});

		it('nodes manifest points to ContextDev dist path', () => {
			const nodes = (packageJson as { n8n: { nodes: string[] } }).n8n.nodes;
			expect(nodes.some((n: string) => n.includes('ContextDev'))).toBe(true);
		});

		it('credentials manifest does NOT reference Branddev (old path)', () => {
			const creds = (packageJson as { n8n: { credentials: string[] } }).n8n.credentials;
			expect(creds.some((c: string) => c.includes('Branddev') || c.includes('branddev'))).toBe(false);
		});

		it('nodes manifest does NOT reference Branddev (old path)', () => {
			const nodes = (packageJson as { n8n: { nodes: string[] } }).n8n.nodes;
			expect(nodes.some((n: string) => n.includes('Branddev') || n.includes('branddev'))).toBe(false);
		});

		it('package name is n8n-nodes-context-dev', () => {
			expect(packageJson.name).toBe('n8n-nodes-context-dev');
		});
	});
});
