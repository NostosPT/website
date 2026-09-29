import { redirect } from '@sveltejs/kit';
import { realApi } from '$lib/server/realApi';
import type { LayoutServerLoad } from './$types';

/**
 * Server-side enforcement of the staff-session guard for admin data
 * requests (`__data.json` during client-side navigations).
 *
 * Same policy as the client guard in `./+layout.ts`, same contract: the
 * httpOnly staff session cookie is validated against `GET /v1/auth/me`
 * (no second auth system, no new permissions). A redirect thrown here is
 * delivered to the client router, which navigates to
 * `/admin/login?next=...`. Full document requests are guarded earlier by
 * `guardAdminDocument` in `src/hooks.server.ts`, because the admin tree is
 * client-rendered (`ssr = false`) and document GETs never reach server
 * loads. The client guard stays in place as the last layer.
 */
export const load: LayoutServerLoad = async ({ url, request }) => {
	try {
		await realApi('/v1/auth/me', { cookies: request.headers.get('cookie') });
	} catch {
		redirect(307, `/admin/login?next=${encodeURIComponent(url.pathname + url.search)}`);
	}
};
