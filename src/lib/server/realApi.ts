import { env } from '$env/dynamic/private';

/**
 * Server-only client for the Nostos Real API (Fastify).
 *
 * The browser never sees this module or `API_URL`: all browser traffic goes
 * to same-origin `/api/...` routes, which use this client server-side.
 * Session cookies are forwarded per request (never stored here).
 */

const API_URL = env.API_URL?.replace(/\/$/, '') || null;

export function isRealApiConfigured(): boolean {
	return API_URL !== null;
}

export interface RealApiRequest {
	method?: string;
	/** Already-parsed JSON body (or raw string) to forward upstream. */
	body?: unknown;
	/** Query string including the leading `?`, or URLSearchParams. */
	query?: string | URLSearchParams;
	/** Raw `cookie` header value from the incoming request, if any. */
	cookies?: string | null;
}

export interface RealApiResponse<T> {
	status: number;
	data: T;
	/** Raw `set-cookie` values received from upstream, if any. */
	setCookies: string[];
}

export class RealApiError extends Error {
	constructor(
		readonly status: number,
		readonly code: string,
		message: string
	) {
		super(message);
		this.name = 'RealApiError';
	}
}

/** Error envelope returned when the Real API itself is unreachable/misconfigured. */
export function unavailableError() {
	return {
		error: {
			code: 'SERVICE_UNAVAILABLE',
			statusCode: 503,
			message: 'Service temporarily unavailable. Please try again later.'
		}
	};
}

/**
 * Call the Real API. `path` must start with `/` (e.g. `/v1/services`).
 * Throws RealApiError when upstream answers with a non-2xx status, or a
 * plain Error when the Real API is not configured/unreachable.
 */
export async function realApi<T>(
	path: string,
	init: RealApiRequest = {}
): Promise<RealApiResponse<T>> {
	if (!API_URL) {
		throw new RealApiError(503, 'SERVICE_UNAVAILABLE', 'Real API is not configured');
	}

	const query = typeof init.query === 'string' ? init.query : init.query ? `?${init.query}` : '';
	const headers: Record<string, string> = { accept: 'application/json' };
	if (init.body !== undefined) headers['content-type'] = 'application/json';
	if (init.cookies) headers['cookie'] = init.cookies;

	let response: Response;
	try {
		response = await fetch(`${API_URL}${path}${query}`, {
			method: init.method ?? 'GET',
			headers,
			body: init.body === undefined ? undefined : typeof init.body === 'string' ? init.body : JSON.stringify(init.body)
		});
	} catch {
		throw new RealApiError(503, 'SERVICE_UNAVAILABLE', 'Real API is unreachable');
	}

	// `getSetCookie()` is available in Node 18.14+ runtimes.
	const setCookies =
		typeof (response.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie ===
		'function'
			? (response.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
			: [];

	const data = (await response.json().catch(() => null)) as T;

	if (!response.ok) {
		const err = (data as { error?: { code?: string; message?: string } } | null)?.error;
		throw new RealApiError(
			response.status,
			err?.code ?? 'UPSTREAM_ERROR',
			err?.message ?? response.statusText
		);
	}

	return { status: response.status, data, setCookies };
}
