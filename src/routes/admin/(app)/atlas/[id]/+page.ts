import { error } from '@sveltejs/kit';
import { atlas } from '$lib/admin/atlas/store.svelte';

export function load({ params }) {
	const location = atlas.get(params.id);
	if (!location) error(404, 'Location not found');
	return { location };
}
