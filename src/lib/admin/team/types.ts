/**
 * Staff accounts. Mirrors `User` in the API schema (prisma/schema.prisma).
 *
 * The API's `Role` enum is ADMIN | PHOTOGRAPHER today. EDITOR, ASSISTANT and
 * ACCOUNTANT are proposed for team support and must be added there too.
 */
export type Role = 'ADMIN' | 'PHOTOGRAPHER' | 'EDITOR' | 'ASSISTANT' | 'ACCOUNTANT';

export type MemberStatus = 'ACTIVE' | 'SUSPENDED';

export interface StaffUser {
	id: string;
	email: string;
	name: string;
	role: Role;
	bio: string | null;
	avatarUrl: string | null;
	/** Photographer profile links (ADMIN.md › Photographer). */
	links: { label: string; url: string }[];
	status: MemberStatus;
	lastActiveAt: string | null;
	createdAt: string;
}

export interface Invite {
	id: string;
	email: string;
	role: Role;
	invitedById: string;
	sentAt: string;
	expiresAt: string;
}

/** Areas of the dashboard a role can reach. */
export type Area =
	| 'archive'
	| 'studio'
	| 'crm'
	| 'finance'
	| 'website'
	| 'mail'
	| 'team'
	| 'settings'
	| 'field';

export type Access = 'none' | 'view' | 'edit';
