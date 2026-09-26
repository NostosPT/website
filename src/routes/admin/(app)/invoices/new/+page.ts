import { redirect } from '@sveltejs/kit';
import { invoices } from '$lib/admin/invoices/store.svelte';
import type { DocumentType } from '$lib/admin/invoices/types';
import { pipeline } from '$lib/admin/pipeline/store.svelte';
import { services } from '$lib/admin/services/store.svelte';

const TYPES: DocumentType[] = ['QUOTE', 'PROFORMA', 'INVOICE', 'CREDIT_NOTE'];

/** Creates a draft (pre-filled from a request when given) and opens it. */
export function load({ url }) {
	const param = url.searchParams.get('type') as DocumentType | null;
	const type = param && TYPES.includes(param) ? param : 'INVOICE';
	const request = pipeline.get(url.searchParams.get('request'));
	const lines = request
		? [
				{
					...invoices.newLine(),
					description: `${services.get(request.serviceId)?.name ?? 'Photography'} — ${request.title}`,
					unitPriceCents: request.quoteCents ?? request.estimate?.fromCents ?? 0
				}
			]
		: undefined;
	const doc = invoices.create({
		type,
		clientId: request?.clientId ?? url.searchParams.get('client') ?? '',
		requestId: request?.id ?? null,
		lines
	});
	redirect(307, `/admin/invoices/${doc.id}`);
}
