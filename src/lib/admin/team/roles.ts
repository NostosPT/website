import type { Tone } from '@nostospt/ui';
import type { Access, Area, Role } from './types';

export const areas: { key: Area; label: string }[] = [
	{ key: 'archive', label: 'Archive' },
	{ key: 'studio', label: 'Galleries & services' },
	{ key: 'crm', label: 'Clients & pipeline' },
	{ key: 'finance', label: 'Invoices & orders' },
	{ key: 'website', label: 'Website content' },
	{ key: 'mail', label: 'Mail' },
	{ key: 'team', label: 'Team' },
	{ key: 'settings', label: 'Settings' }
];

type RoleDefinition = {
	label: string;
	description: string;
	tone: Tone;
	access: Record<Area, Access>;
};

/**
 * Default permission matrix. Enforcement belongs in the API
 * (`app.requireRole`); the dashboard only uses this to hide what a role can't do.
 */
export const roles: Record<Role, RoleDefinition> = {
	ADMIN: {
		label: 'Admin',
		description: 'Full access, including team, billing and integrations.',
		tone: 'accent',
		access: {
			archive: 'edit',
			studio: 'edit',
			crm: 'edit',
			finance: 'edit',
			website: 'edit',
			mail: 'edit',
			team: 'edit',
			settings: 'edit',
			field: 'edit'
		}
	},
	PHOTOGRAPHER: {
		label: 'Photographer',
		description: 'Uploads and manages own work, delivers client galleries.',
		tone: 'info',
		access: {
			archive: 'edit',
			studio: 'edit',
			crm: 'view',
			finance: 'none',
			website: 'none',
			mail: 'edit',
			team: 'view',
			settings: 'none',
			field: 'edit'
		}
	},
	EDITOR: {
		label: 'Editor',
		description: 'Curates the archive, albums and website content.',
		tone: 'purple',
		access: {
			archive: 'edit',
			studio: 'view',
			crm: 'none',
			finance: 'none',
			website: 'edit',
			mail: 'view',
			team: 'view',
			settings: 'none',
			field: 'edit'
		}
	},
	ASSISTANT: {
		label: 'Assistant',
		description: 'Runs studio operations: requests, clients, mail and galleries.',
		tone: 'warning',
		access: {
			archive: 'view',
			studio: 'edit',
			crm: 'edit',
			finance: 'view',
			website: 'none',
			mail: 'edit',
			team: 'view',
			settings: 'none',
			field: 'view'
		}
	},
	ACCOUNTANT: {
		label: 'Accountant',
		description: 'Invoices, orders and financial exports only.',
		tone: 'neutral',
		access: {
			archive: 'none',
			studio: 'none',
			crm: 'view',
			finance: 'edit',
			website: 'none',
			mail: 'none',
			team: 'none',
			settings: 'none',
			field: 'none'
		}
	}
};

export const roleOptions = (Object.keys(roles) as Role[]).map((value) => ({
	value,
	label: roles[value].label
}));

export function can(role: Role, area: Area, level: Exclude<Access, 'none'> = 'view'): boolean {
	const access = roles[role].access[area];
	return level === 'view' ? access !== 'none' : access === 'edit';
}
