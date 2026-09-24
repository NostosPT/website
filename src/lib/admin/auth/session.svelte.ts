import { team } from '$lib/admin/team/store.svelte';
import type { StaffUser } from '$lib/admin/team/types';

/**
 * Staff session. The API uses an httpOnly session cookie, so the browser never
 * sees a token: sign-in is POST /auth/login, the current user is GET /auth/me,
 * sign-out is POST /auth/logout, all with `credentials: 'include'`.
 *
 * Mock: starts signed in as the first admin, and accepts any password.
 */
class Session {
	user = $state<StaffUser | null>(team.members[0] ?? null);

	async signIn(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
		await new Promise((resolve) => setTimeout(resolve, 450));
		const member = team.members.find((m) => m.email.toLowerCase() === email.trim().toLowerCase());
		if (!member || !password) return { ok: false, error: 'Email or password is incorrect.' };
		if (member.status === 'SUSPENDED') return { ok: false, error: 'This account is suspended.' };
		this.user = member;
		return { ok: true };
	}

	signOut() {
		this.user = null;
	}
}

export const session = new Session();
