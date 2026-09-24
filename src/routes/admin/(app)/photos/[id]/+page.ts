import { error } from '@sveltejs/kit';
import { photos } from '$lib/admin/photos/store.svelte';

export function load({ params }) {
	const photo = photos.get(params.id);
	if (!photo) error(404, 'Photo not found');
	return { photo };
}
