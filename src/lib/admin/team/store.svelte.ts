import { daysFromNow, mockId } from '$lib/admin/shared/mock-dates';
import { seedInvites, seedMembers } from './mock';
import type { Invite, Role, StaffUser } from './types';

/**
 * Team data. Methods are the swap points for the API:
 * GET/POST /users, PATCH/DELETE /users/:id (admin only). Invites need new endpoints.
 */
class TeamStore {
	members = $state<StaffUser[]>(seedMembers);
	invites = $state<Invite[]>(seedInvites);

	photographers = $derived(
		this.members.filter((m) => m.role === 'PHOTOGRAPHER' || m.role === 'ADMIN')
	);

	get(id: string | null | undefined): StaffUser | undefined {
		return id ? this.members.find((m) => m.id === id) : undefined;
	}

	invite(email: string, role: Role, invitedById: string) {
		this.invites.push({
			id: mockId('inv'),
			email,
			role,
			invitedById,
			sentAt: new Date().toISOString(),
			expiresAt: daysFromNow(7)
		});
	}

	revokeInvite(id: string) {
		this.invites = this.invites.filter((i) => i.id !== id);
	}

	update(id: string, patch: Partial<Omit<StaffUser, 'id'>>) {
		const member = this.members.find((m) => m.id === id);
		if (member) Object.assign(member, patch);
	}

	remove(id: string) {
		this.members = this.members.filter((m) => m.id !== id);
	}
}

export const team = new TeamStore();
