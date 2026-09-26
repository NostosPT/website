import { redirect } from '@sveltejs/kit';
import { session } from '$lib/admin/auth/session.svelte';

export function load({ url }) {
	if (!session.user) {
		redirect(307, `/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	}
}
