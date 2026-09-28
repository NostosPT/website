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
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
	let response: Response;
	try {
		response = await fetch(`${API_URL}${path}`, {
			...init,
			credentials: 'include',
			headers: { 'content-type': 'application/json', ...init.headers }
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
