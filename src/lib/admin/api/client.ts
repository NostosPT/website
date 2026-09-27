import { env } from '$env/dynamic/public';

/**
 * The Nostos API (Fastify, ~/nostos/api).
 * Set PUBLIC_API_URL (e.g. https://api.nostos.pt) to call the real endpoints.
 * Unset to run the dashboard entirely on mock data.
 */
export const API_URL = env.PUBLIC_API_URL?.replace(/\/$/, '') || null;

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

/** JSON request with the staff session cookie (httpOnly, so `credentials: 'include'`). */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
	if (!API_URL) throw new Error('PUBLIC_API_URL is not set');
	const response = await fetch(`${API_URL}${path}`, {
		...init,
		credentials: 'include',
		headers: { 'content-type': 'application/json', ...init.headers }
	});
	const body = await response.json().catch(() => null);
	if (!response.ok) {
		const message = body?.message ?? response.statusText;
		const code = body?.code;
		const details = body?.details;
		throw new ApiError(response.status, message, code, details);
	}
	return response.status === 204 ? (undefined as T) : response.json();
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