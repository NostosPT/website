import { redirect, type Handle } from '@sveltejs/kit';
import { realApi } from '$lib/server/realApi';

const REPORT_ONLY_CSP = [
	"default-src 'self'",
	"img-src 'self' data: blob:",
	"font-src 'self' https://fonts.gstatic.com",
	"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
	"script-src 'self' 'unsafe-inline'",
	"connect-src 'self'",
	"frame-ancestors 'none'",
	"base-uri 'self'",
	"form-action 'self'"
].join('; ');

const ADMIN_LOGIN_PATH = '/admin/login';

/**
 * Server-side enforcement of the staff-session guard for admin document
 * requests.
 *
 * Same policy as the `(app)` guards, same contract: the httpOnly staff
 * session cookie is validated against `GET /v1/auth/me` (no second auth
 * system, no new permissions). The admin tree is client-rendered
 * (`ssr = false`), so without this hook an unauthenticated `GET /admin`
 * would serve the public shell first and only redirect once the client
 * guard runs. The hook answers with an HTTP 307 instead, before anything
 * renders.
 *
 * Left out on purpose: `/admin/login` (public), `__data.json` data
 * requests (answered with a router redirect by `(app)/+layout.server.ts`),
 * and everything outside `/admin`.
 */
async function guardAdminDocument(event: Parameters<Handle>[0]['event']): Promise<void> {
	const { pathname, search } = event.url;
	if (!pathname.startsWith('/admin')) return;
	if (pathname === ADMIN_LOGIN_PATH || pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)) return;
	if (pathname.endsWith('/__data.json')) return;
	try {
		await realApi('/v1/auth/me', { cookies: event.request.headers.get('cookie') });
	} catch {
		redirect(307, `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(pathname + search)}`);
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	await guardAdminDocument(event);
	const response = await resolve(event);

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('Content-Security-Policy-Report-Only', REPORT_ONLY_CSP);

	const proto = event.url.protocol ?? 'http:';
	if (proto === 'https:') {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}

	return response;
};
