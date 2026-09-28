/**
 * Browser client for the Website API (BFF): same-origin `/api/...`.
 *
 * The browser never talks to the Real API directly and never sees its URL.
 * The Real API lives behind `API_URL` (server-only) and is reached through
 * `src/routes/api/[...path]/+server.ts`, which forwards the staff session
 * cookie per request. Both layers share the Real API error envelope:
 * `{ error: { code, statusCode, message } }`.
 *
 * `API_URL` is always same-origin here, so it is truthy by design: stores
 * try the real backend first and fall back to local mocks only when the
 * backend is unreachable (offline development).
 */
export const API_URL = '/api';

export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly message: string,
		readonly code?: string,
		readonly details?: unknown
	) {
		super(message);
		this.name = 'ApiError';
	}
}

/** JSON request against the Website API (staff session cookie included). */
export async function api<T>(
	path: string,
	init: RequestInit & { fetch?: typeof globalThis.fetch } = {}
): Promise<T> {
	const fetchFn = init.fetch ?? globalThis.fetch;
	const { fetch: _unused, ...initRest } = init;
	let response: Response;
	try {
		// When using a custom fetch (e.g., SvelteKit's fetch during SSR/CSR),
		// don't override credentials - the custom fetch handles credentials automatically.
		// Only set credentials when using the global fetch directly.
		const credentials = init.fetch ? undefined : 'include';
		response = await fetchFn(`${API_URL}${path}`, {
			...initRest,
			credentials,
			headers: { 'content-type': 'application/json', ...initRest.headers }
		});
	} catch {
		throw new ApiError(0, 'Website API is unreachable', 'SERVICE_UNAVAILABLE');
	}

	const body = await response.json().catch(() => null);
	if (!response.ok) {
		const error = body?.error ?? {};
		throw new ApiError(
			response.status,
			typeof error.message === 'string' ? error.message : response.statusText,
			typeof error.code === 'string' ? error.code : undefined,
			error.details
		);
	}

	return response.status === 204 ? (undefined as T) : (body as T);
}

/** Pagination parameters used by list endpoints. */
export interface PaginationParams {
	page?: number;
	pageSize?: number;
}

/** Standard paginated list response. */
export interface PaginatedList<T> {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
}
