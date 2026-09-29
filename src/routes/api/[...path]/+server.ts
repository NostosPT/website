import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isRealApiConfigured, realApi, RealApiError, unavailableError } from '$lib/server/realApi';

/**
 * Thin Website API (BFF) proxy.
 *
 * Browser → same-origin `/api/v1/...` → Real API.
 * The Real API URL lives only on the server (`API_URL`); it is never
 * exposed to the browser. Only allowlisted upstream paths are forwarded.
 * Session cookies ride along per request; upstream `set-cookie` values are
 * passed straight back to the browser (opaque tokens, never read here).
 */

// Upstream path prefixes this proxy is allowed to reach. Deliberately
// narrow: admin-only resources stay behind the staff session upstream.
const ALLOWLIST = [
	'v1/auth/',
	'v1/services',
	'v1/service-requests',
	'v1/public/',
	'v1/galleries',
	'v1/clients',
	'v1/albums',
	'v1/photos',
	'v1/atlas',
	'v1/categories'
];

function upstreamPath(path: string | undefined): string | null {
	if (!path) return null;
	const clean = path.replace(/^\/+|\/+$/g, '');
	if (!ALLOWLIST.some((prefix) => clean === prefix.replace(/\/$/, '') || clean.startsWith(prefix))) {
		return null;
	}
	return `/v1/${clean.slice(3)}`;
}

async function proxy({ params, request, url }: Parameters<RequestHandler>[0]) {
	const upstream = upstreamPath(params.path);
	if (!upstream) {
		return json(
			{ error: { code: 'NOT_FOUND', statusCode: 404, message: 'Unknown API path' } },
			{ status: 404 }
		);
	}
	if (!isRealApiConfigured()) {
		return json(unavailableError(), { status: 503 });
	}

	const rawBody =
		request.method === 'GET' || request.method === 'HEAD'
			? undefined
			: await request.text().catch(() => undefined);

	try {
		const { status, data, setCookies } = await realApi<unknown>(upstream, {
			method: request.method,
			body: rawBody && rawBody.length > 0 ? rawBody : undefined,
			query: url.search,
			cookies: request.headers.get('cookie')
		});

		const headers = new Headers();
		for (const cookie of setCookies) headers.append('set-cookie', cookie);
		return json(data, { status, headers });
	} catch (error) {
		if (error instanceof RealApiError) {
			return json(
				{ error: { code: error.code, statusCode: error.status, message: error.message } },
				{ status: error.status }
			);
		}
		return json(unavailableError(), { status: 503 });
	}
}

export const GET: RequestHandler = proxy;
export const POST: RequestHandler = proxy;
export const PATCH: RequestHandler = proxy;
export const PUT: RequestHandler = proxy;
export const DELETE: RequestHandler = proxy;
