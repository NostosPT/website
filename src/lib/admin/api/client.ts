import { env } from '$env/dynamic/public';

/**
 * The Nostos API (Fastify, ~/nostos/api). Unset PUBLIC_API_URL to run the
 * dashboard entirely on mock data; set it (e.g. https://api.nostos.pt) and the
 * features that are wired call the real endpoints.
 */
export const API_URL = env.PUBLIC_API_URL?.replace(/\/$/, '') || null;

export class ApiError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
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
	if (!response.ok) {
		const body = await response.json().catch(() => null);
		throw new ApiError(response.status, body?.message ?? response.statusText);
	}
	return response.status === 204 ? (undefined as T) : response.json();
}
