import { error } from '@sveltejs/kit';
import { clients } from '$lib/admin/clients/store.svelte';

export function load({ params }) {
	const client = clients.get(params.id);
	if (!client) error(404, 'Client not found');
	return { client };
}
