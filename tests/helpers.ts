import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

// ─── Operation helpers ───────────────────────────────────────────────────────

export function getOperationProp(desc: INodeProperties[]): INodeProperties {
	const op = desc.find((p) => p.name === 'operation' && p.type === 'options');
	if (!op) throw new Error('No operation property found');
	return op;
}

export function getOperations(desc: INodeProperties[]): INodePropertyOptions[] {
	return getOperationProp(desc).options as INodePropertyOptions[];
}

export function getOperation(desc: INodeProperties[], value: string): INodePropertyOptions {
	const op = getOperations(desc).find((o) => o.value === value);
	if (!op) throw new Error(`Operation '${value}' not found`);
	return op;
}

export function operationExists(desc: INodeProperties[], value: string): boolean {
	return getOperations(desc).some((o) => o.value === value);
}

export function allUrls(desc: INodeProperties[]): string[] {
	return getOperations(desc)
		.map((o) => o.routing?.request?.url as string)
		.filter(Boolean);
}

export function methodFor(desc: INodeProperties[], value: string): string {
	return getOperation(desc, value).routing?.request?.method as string;
}

export function urlFor(desc: INodeProperties[], value: string): string {
	return getOperation(desc, value).routing?.request?.url as string;
}

// ─── Field helpers ────────────────────────────────────────────────────────────

/** Top-level field by name */
export function getTopField(desc: INodeProperties[], name: string): INodeProperties | undefined {
	return desc.find((p) => p.name === name);
}

/** Field inside any additionalFields collection (supports multiple collections) */
export function getAdditionalField(
	desc: INodeProperties[],
	name: string,
): INodeProperties | undefined {
	const collections = desc.filter((p) => p.name === 'additionalFields');
	for (const af of collections) {
		if (!af.options) continue;
		const found = (af.options as INodeProperties[]).find((p) => p.name === name);
		if (found) return found;
	}
	return undefined;
}

/** All top-level fields with a given name (there can be multiple for GET vs POST routing) */
export function getAllTopFields(desc: INodeProperties[], name: string): INodeProperties[] {
	return desc.filter((p) => p.name === name);
}

/** additionalField with a given name scoped to a specific operation (disambiguates duplicates) */
export function getAdditionalFieldFor(
	desc: INodeProperties[],
	name: string,
	op: string,
): INodeProperties | undefined {
	const collections = desc.filter((p) => p.name === 'additionalFields');
	for (const af of collections) {
		const found = (af.options as INodeProperties[] | undefined)?.find(
			(p) => p.name === name && additionalFieldShowsFor(p).includes(op),
		);
		if (found) return found;
	}
	return undefined;
}

export function usesQsRouting(field: INodeProperties): boolean {
	return !!field.routing?.request?.qs;
}

export function usesBodyRouting(field: INodeProperties): boolean {
	return !!field.routing?.request?.body;
}

/** Check which operations a top-level field's displayOptions.show.operation includes */
export function showsForOperations(field: INodeProperties): string[] {
	const show = field.displayOptions?.show as Record<string, string[]> | undefined;
	return show?.operation ?? [];
}

/** Check which operations an additionalField's displayOptions.show['/operation'] includes */
export function additionalFieldShowsFor(field: INodeProperties): string[] {
	const show = field.displayOptions?.show as Record<string, string[]> | undefined;
	return show?.['/operation'] ?? [];
}

// ─── fixedCollection helpers ──────────────────────────────────────────────────

export function getFixedCollectionValues(desc: INodeProperties[], name: string): INodeProperties[] {
	const field = desc.find((p) => p.name === name);
	if (!field?.options) return [];
	const group = (field.options as { values: INodeProperties[] }[])[0];
	return group?.values ?? [];
}

// ─── Sweep helpers ────────────────────────────────────────────────────────────

/** Get the qs key name a field sends (e.g. { domain: '...' } → 'domain') */
export function qsKeyFor(field: INodeProperties): string | undefined {
	const qs = field.routing?.request?.qs;
	if (!qs) return undefined;
	return Object.keys(qs)[0];
}

/** Get the body key name a field sends (e.g. { domain: '...' } → 'domain') */
export function bodyKeyFor(field: INodeProperties): string | undefined {
	const body = field.routing?.request?.body;
	if (!body) return undefined;
	return Object.keys(body)[0];
}

/** Get the arrayFormat set on a field's routing.request (controls qs array serialization) */
export function arrayFormatFor(field: INodeProperties): string | undefined {
	return (field.routing?.request as { arrayFormat?: string } | undefined)?.arrayFormat;
}

/** Every INodeProperties in a description, including nested options */
export function allFields(desc: INodeProperties[]): INodeProperties[] {
	const result: INodeProperties[] = [];
	for (const prop of desc) {
		result.push(prop);
		if (prop.type === 'collection' || prop.type === 'fixedCollection') {
			const nested = prop.options as INodeProperties[] | undefined;
			if (nested) result.push(...nested);
		}
	}
	return result;
}
