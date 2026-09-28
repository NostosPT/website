import { api, ApiError, API_URL } from '$lib/admin/api/client';
import { team } from '$lib/admin/team/store.svelte';
import type { StaffUser } from '$lib/admin/team/types';

/**
 * Staff session. The API uses an httpOnly session cookie, so the browser never
 * sees a token: sign-in is POST /v1/auth/login, the current user is GET /v1/auth/me,
 * sign-out is POST /v1/auth/logout, all with `credentials: 'include'`.
 *
 * Mock: starts signed in as the first admin, and accepts any password.
 */
class Session {
	user = $state<StaffUser | null>(API_URL ? null : team.members[0] ?? null);
	#loading = $state(false);

	get loading() {
		return this.#loading;
	}

	async signIn(email: string, password: string, fetch?: typeof globalThis.fetch): Promise<{ ok: true } | { ok: false; error: string }> {
		if (!API_URL) {
			return this.signInMock(email, password);
		}

		this.#loading = true;
		try {
			await api('/v1/auth/login', {
				method: 'POST',
				body: JSON.stringify({ email, password }),
				fetch
			});
			await this.restore(fetch);
			return { ok: true };
		} catch (e) {
			// Offline backend only: fall back to the mock directory (never on 401/403).
			if (e instanceof ApiError && e.status === 0) {
				try {
					return await this.signInMock(email, password);
				} finally {
					this.#loading = false;
				}
			}
			if (e instanceof Error && 'status' in e && (e as any).status === 401) {
				return { ok: false, error: 'Email or password is incorrect.' };
			}
			if (e instanceof Error && 'status' in e && (e as any).status === 403) {
				return { ok: false, error: 'This account is suspended.' };
			}
			return { ok: false, error: 'An error occurred. Please try again.' };
		} finally {
			this.#loading = false;
		}
	}

	/** Offline mock directory (also used when the Website API is unreachable). */
	private async signInMock(
		email: string,
		password: string
	): Promise<{ ok: true } | { ok: false; error: string }> {
		await new Promise((resolve) => setTimeout(resolve, 450));
		const member = team.members.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
		if (!member || !password) return { ok: false, error: 'Email or password is incorrect.' };
		if (member.status === 'SUSPENDED') return { ok: false, error: 'This account is suspended.' };
		this.user = member;
		return { ok: true };
	}

	async restore(fetch?: typeof globalThis.fetch): Promise<void> {
		if (!API_URL) return;
		try {
			const user = await api<StaffUser>('/v1/auth/me', {
				fetch: fetch ?? globalThis.fetch
			});
			this.user = user;
		} catch {
			this.user = null;
		}
	}

	async signOut(): Promise<void> {
		if (!API_URL) {
			this.user = null;
			return;
		}
		try {
			await api('/v1/auth/logout', { method: 'POST' });
		} finally {
			this.user = null;
		}
	}

	async signOutAll(): Promise<void> {
		if (!API_URL) {
			this.user = null;
			return;
		}
		try {
			await api('/v1/auth/logout-all', { method: 'POST' });
		} finally {
			this.user = null;
		}
	}
}

export const session = new Session();
