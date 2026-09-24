import { daysAgo, daysFromNow, minutesAgo } from '$lib/admin/shared/mock-dates';
import type { ServiceRequest } from './types';

type Seed = Omit<ServiceRequest, 'notes' | 'updatedAt' | 'lostReason' | 'quoteId' | 'quoteCents'> &
	Partial<Pick<ServiceRequest, 'notes' | 'lostReason' | 'quoteId' | 'quoteCents'>>;

const seeds: Seed[] = [
	{
		id: 'req_031', reference: 'REQ-2026-031', title: 'Porsche 911 launch', clientId: 'cli_duarte', serviceId: 'svc_automotive', stage: 'NEW',
		project: { date: daysFromNow(18), location: 'Estoril', duration: 'Half day', headcount: 3, intendedUse: 'Website, social and showroom prints', details: 'Three cars, a mix of static and rolling shots. Showroom access from 8:00.' },
		estimate: { fromCents: 18000, toCents: 60000 }, assigneeId: null, source: 'website', createdAt: minutesAgo(48)
	},
	{
		id: 'req_030', reference: 'REQ-2026-030', title: 'Two residential projects', clientId: 'cli_teresa', serviceId: 'svc_commercial', stage: 'NEW',
		project: { date: daysFromNow(30), location: 'Porto', duration: '2 days', headcount: null, intendedUse: 'Portfolio and awards submission', details: 'Interiors and exteriors, golden hour preferred.' },
		estimate: { fromCents: 40000, toCents: 150000 }, assigneeId: null, source: 'email', createdAt: daysAgo(1, 10)
	},
	{
		id: 'req_029', reference: 'REQ-2026-029', title: 'Portrait session', clientId: 'cli_mariana', serviceId: 'svc_portrait', stage: 'QUALIFIED',
		project: { date: daysFromNow(12), location: 'Sintra', duration: '2 hours', headcount: 1, intendedUse: 'Personal, LinkedIn', details: null },
		estimate: { fromCents: 12000, toCents: 30000 }, assigneeId: 'usr_ines', source: 'instagram', createdAt: daysAgo(6)
	},
	{
		id: 'req_028', reference: 'REQ-2026-028', title: 'Rooms and restaurant', clientId: 'cli_lumen', serviceId: 'svc_commercial', stage: 'QUOTED',
		project: { date: daysFromNow(21), location: 'Lisbon', duration: 'Full day', headcount: null, intendedUse: 'Booking platforms, website, press kit', details: '14 rooms, rooftop and the restaurant at dinner service.' },
		estimate: { fromCents: 40000, toCents: 150000 }, quoteCents: 145000, quoteId: 'qt_12', assigneeId: 'usr_rui', source: 'email', createdAt: daysAgo(9)
	},
	{
		id: 'req_027', reference: 'REQ-2026-027', title: 'Corporate dinner', clientId: 'cli_filipa', serviceId: 'svc_events', stage: 'QUOTED',
		project: { date: daysFromNow(9, 19), location: 'Palácio Chiado, Lisbon', duration: '4 hours', headcount: 120, intendedUse: 'Internal comms and press', details: null },
		estimate: { fromCents: 25000, toCents: 90000 }, quoteCents: 68000, quoteId: 'qt_11', assigneeId: 'usr_ines', source: 'referral', createdAt: daysAgo(12)
	},
	{
		id: 'req_026', reference: 'REQ-2026-026', title: 'Autumn menu', clientId: 'cli_sal', serviceId: 'svc_commercial', stage: 'BOOKED',
		project: { date: daysFromNow(4, 9), location: 'Atelier Sal, Lisbon', duration: 'Half day', headcount: null, intendedUse: 'Menu, Instagram, website', details: '12 dishes and the dining room before opening.' },
		estimate: { fromCents: 40000, toCents: 150000 }, quoteCents: 90000, quoteId: 'qt_10', assigneeId: 'usr_rui', source: 'instagram', createdAt: daysAgo(20)
	},
	{
		id: 'req_025', reference: 'REQ-2026-025', title: 'Family portraits', clientId: 'cli_joao', serviceId: 'svc_portrait', stage: 'BOOKED',
		project: { date: daysFromNow(15, 17), location: 'Cascais', duration: '1 hour', headcount: 4, intendedUse: 'Anniversary gift', details: null },
		estimate: { fromCents: 12000, toCents: 30000 }, quoteCents: 22000, assigneeId: 'usr_ines', source: 'referral', createdAt: daysAgo(14)
	},
	{
		id: 'req_024', reference: 'REQ-2026-024', title: 'Wedding at Quinta da Regaleira', clientId: 'cli_beatriz', serviceId: 'svc_weddings', stage: 'COMPLETED',
		project: { date: daysAgo(21, 14), location: 'Quinta da Regaleira, Sintra', duration: 'Full day', headcount: 140, intendedUse: 'Private', details: null },
		estimate: { fromCents: 120000, toCents: 350000 }, quoteCents: 280000, quoteId: 'qt_08', assigneeId: 'usr_ines', source: 'referral', createdAt: daysAgo(240)
	},
	{
		id: 'req_023', reference: 'REQ-2026-023', title: 'Classic collection', clientId: 'cli_lucas', serviceId: 'svc_automotive', stage: 'COMPLETED',
		project: { date: daysAgo(60), location: 'Coimbra', duration: 'Full day', headcount: 7, intendedUse: 'Sales listings', details: null },
		estimate: { fromCents: 18000, toCents: 60000 }, quoteCents: 54000, assigneeId: 'usr_rui', source: 'website', createdAt: daysAgo(110)
	},
	{
		id: 'req_022', reference: 'REQ-2026-022', title: 'Headshots', clientId: 'cli_ana', serviceId: 'svc_portrait', stage: 'LOST',
		project: { date: null, location: 'Lisbon', duration: null, headcount: 1, intendedUse: 'Professional profile', details: null },
		estimate: { fromCents: 12000, toCents: 30000 }, lostReason: 'Went with a cheaper option.', assigneeId: 'usr_tomas', source: 'archive', createdAt: daysAgo(34)
	}
];

export const seedRequests: ServiceRequest[] = seeds.map((seed) => ({
	notes: [],
	lostReason: null,
	quoteId: null,
	quoteCents: null,
	...seed,
	updatedAt: seed.createdAt
}));
