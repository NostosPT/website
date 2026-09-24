import { error } from '@sveltejs/kit';
import { albums } from '$lib/admin/albums/store.svelte';

export function load({ params }) {
	const album = albums.get(params.id);
	if (!album) error(404, 'Album not found');
	return { album };
}
