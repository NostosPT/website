import { error } from '@sveltejs/kit';
import { galleries } from '$lib/admin/galleries/store.svelte';

export function load({ params }) {
	const gallery = galleries.get(params.id);
	if (!gallery) error(404, 'Gallery not found');
	return { gallery };
}
