import { daysAgo, daysFromNow, minutesAgo } from '$lib/admin/shared/mock-dates';
import type { Invite, StaffUser } from './types';

export const seedMembers: StaffUser[] = [
	{
		id: 'usr_marta',
		email: 'marta@nostos.studio',
		name: 'Marta Reis',
		role: 'ADMIN',
		bio: 'Founder. Street and editorial work between Lisbon and the places around it.',
		avatarUrl: null,
		links: [{ label: 'Instagram', url: 'https://instagram.com' }],
		status: 'ACTIVE',
		lastActiveAt: minutesAgo(2),
		createdAt: daysAgo(420)
	},
	{
		id: 'usr_rui',
		email: 'rui@nostos.studio',
		name: 'Rui Carvalho',
		role: 'PHOTOGRAPHER',
		bio: 'Automotive and commercial commissions.',
		avatarUrl: null,
		links: [],
		status: 'ACTIVE',
		lastActiveAt: minutesAgo(95),
		createdAt: daysAgo(300)
	},
	{
		id: 'usr_ines',
		email: 'ines@nostos.studio',
		name: 'Inês Almeida',
		role: 'PHOTOGRAPHER',
		bio: 'Weddings, portraits and event coverage.',
		avatarUrl: null,
		links: [{ label: 'Website', url: 'https://nostos.studio' }],
		status: 'ACTIVE',
		lastActiveAt: daysAgo(1, 18),
		createdAt: daysAgo(210)
	},
	{
		id: 'usr_joana',
		email: 'joana@nostos.studio',
		name: 'Joana Pires',
		role: 'EDITOR',
		bio: null,
		avatarUrl: null,
		links: [],
		status: 'ACTIVE',
		lastActiveAt: daysAgo(3, 11),
		createdAt: daysAgo(120)
	},
	{
		id: 'usr_tomas',
		email: 'tomas@nostos.studio',
		name: 'Tomás Faria',
		role: 'ASSISTANT',
		bio: null,
		avatarUrl: null,
		links: [],
		status: 'ACTIVE',
		lastActiveAt: minutesAgo(18),
		createdAt: daysAgo(60)
	},
	{
		id: 'usr_carla',
		email: 'carla.nunes@contabilidade.pt',
		name: 'Carla Nunes',
		role: 'ACCOUNTANT',
		bio: null,
		avatarUrl: null,
		links: [],
		status: 'SUSPENDED',
		lastActiveAt: daysAgo(41),
		createdAt: daysAgo(200)
	}
];

export const seedInvites: Invite[] = [
	{
		id: 'inv_pedro',
		email: 'pedro.matos@gmail.com',
		role: 'PHOTOGRAPHER',
		invitedById: 'usr_marta',
		sentAt: daysAgo(2),
		expiresAt: daysFromNow(5)
	}
];
