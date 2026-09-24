import { daysAgo, minutesAgo } from '$lib/admin/shared/mock-dates';
import type { Client, ClientActivity } from './types';

type Seed = Omit<Client, 'createdAt' | 'updatedAt' | 'notes' | 'address' | 'taxId'> &
	Partial<Pick<Client, 'notes' | 'address' | 'taxId'>> & { since: number };

const seeds: Seed[] = [
	{ id: 'cli_beatriz', name: 'Beatriz Costa', email: 'beatriz.costa@gmail.com', phone: '+351 912 345 678', company: null, status: 'ACTIVE', tags: ['Wedding'], source: 'referral', lastContactAt: minutesAgo(12), since: 240, notes: 'Wedding with Nuno at Quinta da Regaleira. Prefers WhatsApp for quick questions.', taxId: '245678901' },
	{ id: 'cli_duarte', name: 'Miguel Duarte', email: 'miguel@duarteautomoveis.pt', phone: '+351 213 456 789', company: 'Duarte Automóveis', status: 'LEAD', tags: ['Automotive', 'Brand'], source: 'website', lastContactAt: minutesAgo(48), since: 0, address: 'Av. da Liberdade 110, Lisboa', taxId: '509876543' },
	{ id: 'cli_sal', name: 'Sofia Lopes', email: 'sofia@ateliersal.pt', phone: '+351 936 112 004', company: 'Atelier Sal', status: 'ACTIVE', tags: ['Commercial', 'Restaurant'], source: 'instagram', lastContactAt: daysAgo(1, 16), since: 150, address: 'Rua da Rosa 42, Lisboa', taxId: '516002345' },
	{ id: 'cli_lumen', name: 'Ricardo Sá', email: 'ricardo.sa@hotellumen.pt', phone: '+351 218 900 300', company: 'Hotel Lumen', status: 'ACTIVE', tags: ['Commercial', 'Hospitality'], source: 'email', lastContactAt: daysAgo(2, 11), since: 35, address: 'Rua do Alecrim 12, Lisboa', taxId: '514220011' },
	{ id: 'cli_ana', name: 'Ana Martins', email: 'ana.martins@outlook.pt', phone: null, company: null, status: 'ACTIVE', tags: ['Prints'], source: 'archive', lastContactAt: daysAgo(2, 9), since: 90 },
	{ id: 'cli_mariana', name: 'Mariana Teixeira', email: 'mariana.teixeira@gmail.com', phone: '+351 917 220 118', company: null, status: 'LEAD', tags: ['Portrait'], source: 'instagram', lastContactAt: daysAgo(3, 18), since: 6 },
	{ id: 'cli_joao', name: 'João & Rita Ferreira', email: 'joao.rita.ferreira@gmail.com', phone: '+351 965 008 441', company: null, status: 'PAST', tags: ['Wedding'], source: 'referral', lastContactAt: daysAgo(160), since: 400, notes: 'First anniversary on 12 October. Interested in a print book.' },
	{ id: 'cli_filipa', name: 'Filipa Moreira', email: 'filipa@moreiraevents.pt', phone: '+351 222 010 777', company: 'Moreira Events', status: 'ACTIVE', tags: ['Events'], source: 'referral', lastContactAt: daysAgo(4, 15), since: 70, taxId: '515332109' },
	{ id: 'cli_lucas', name: 'Lucas Bernardo', email: 'lucas@garagem47.pt', phone: '+351 239 400 047', company: 'Garagem 47', status: 'PAST', tags: ['Automotive'], source: 'website', lastContactAt: daysAgo(58), since: 110, taxId: '517004712' },
	{ id: 'cli_teresa', name: 'Teresa Vale', email: 'teresa@valearquitetos.pt', phone: null, company: 'Vale Arquitetos', status: 'LEAD', tags: ['Commercial', 'Architecture'], source: 'email', lastContactAt: daysAgo(1, 10), since: 1 }
];

export const seedClients: Client[] = seeds.map(({ since, ...client }) => ({
	notes: null,
	address: null,
	taxId: null,
	...client,
	createdAt: daysAgo(since),
	updatedAt: client.lastContactAt ?? daysAgo(since)
}));

export const seedActivity: ClientActivity[] = [
	{ id: 'act_1', clientId: 'cli_beatriz', kind: 'gallery', title: 'Completed their selection', body: '7 of 13 photos selected in “Quinta da Regaleira”.', href: '/admin/galleries/gal_regaleira', authorId: null, createdAt: minutesAgo(12) },
	{ id: 'act_2', clientId: 'cli_beatriz', kind: 'email', title: 'Wedding gallery — thank you!', body: null, href: '/admin/mail?thread=thr_beatriz', authorId: null, createdAt: minutesAgo(40) },
	{ id: 'act_3', clientId: 'cli_beatriz', kind: 'gallery', title: 'Gallery shared', body: 'Link and access code sent.', href: '/admin/galleries/gal_regaleira', authorId: 'usr_ines', createdAt: daysAgo(6, 10) },
	{ id: 'act_4', clientId: 'cli_beatriz', kind: 'invoice', title: 'Invoice FT 2026/38 paid', body: '€2,800.00', href: '/admin/invoices/inv_38', authorId: null, createdAt: daysAgo(20, 9) },
	{ id: 'act_5', clientId: 'cli_beatriz', kind: 'note', title: 'Note', body: 'Asked about an album for the parents. Follow up after selection.', href: null, authorId: 'usr_marta', createdAt: daysAgo(22, 17) },
	{ id: 'act_6', clientId: 'cli_duarte', kind: 'request', title: 'Submitted a request', body: 'Automotive · Porsche 911 launch', href: '/admin/pipeline?request=req_031', authorId: null, createdAt: minutesAgo(48) },
	{ id: 'act_7', clientId: 'cli_sal', kind: 'invoice', title: 'Invoice FT 2026/41 paid', body: '€1,845.00', href: '/admin/invoices/inv_41', authorId: null, createdAt: daysAgo(1, 16) },
	{ id: 'act_8', clientId: 'cli_lumen', kind: 'email', title: 'Quote sent', body: 'OR 2026/12 · €1,450.00', href: '/admin/invoices/qt_12', authorId: 'usr_tomas', createdAt: daysAgo(2, 11) },
	{ id: 'act_9', clientId: 'cli_ana', kind: 'order', title: 'Ordered a print', body: 'Print A3 · Nº 412 “Yellow”', href: '/admin/orders', authorId: null, createdAt: daysAgo(2, 9) },
	{ id: 'act_10', clientId: 'cli_lucas', kind: 'call', title: 'Call', body: 'Happy with the delivery; may book again for spring.', href: null, authorId: 'usr_rui', createdAt: daysAgo(58, 15) }
];
