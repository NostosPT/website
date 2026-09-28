import { redirect } from '@sveltejs/kit';
import { session } from '$lib/admin/auth/session.svelte';

export async function load({ url }) {
	await session.restore();
	if (!session.user) {
		redirect(307, `/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	}
}
