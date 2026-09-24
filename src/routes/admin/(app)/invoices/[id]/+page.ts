import { error } from '@sveltejs/kit';
import { invoices } from '$lib/admin/invoices/store.svelte';

export function load({ params }) {
	const doc = invoices.get(params.id);
	if (!doc) error(404, 'Document not found');
	return { doc };
}
