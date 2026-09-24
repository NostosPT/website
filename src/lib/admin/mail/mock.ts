import { daysAgo, minutesAgo } from '$lib/admin/shared/mock-dates';
import type { Address, MailMessage, MailThread } from './types';

export const STUDIO_ADDRESS: Address = { name: 'Nostos', email: 'hello@nostos.studio' };

let seq = 0;
function message(
	direction: MailMessage['direction'],
	contact: Address,
	sentAt: string,
	subject: string,
	text: string,
	extra: Partial<MailMessage> = {}
): MailMessage {
	seq += 1;
	const inbound = direction === 'inbound';
	return {
		id: `msg_${seq}`,
		direction,
		from: inbound ? contact : STUDIO_ADDRESS,
		to: [inbound ? STUDIO_ADDRESS : contact],
		cc: [],
		subject,
		text,
		sentAt,
		attachments: [],
		messageId: `<${seq}.mock@nostos.studio>`,
		...(inbound ? {} : { status: 'delivered' as const, providerId: `re_mock_${seq}` }),
		...extra
	};
}

const beatriz = { name: 'Beatriz Costa', email: 'beatriz.costa@gmail.com' };
const miguel = { name: 'Miguel Duarte', email: 'miguel@duarteautomoveis.pt' };
const sofia = { name: 'Sofia Lopes', email: 'sofia@ateliersal.pt' };
const ricardo = { name: 'Ricardo Sá', email: 'ricardo.sa@hotellumen.pt' };
const ana = { name: 'Ana Martins', email: 'ana.martins@outlook.pt' };
const pedro = { name: 'Pedro Matos', email: 'pedro.matos@gmail.com' };
const mariana = { name: 'Mariana Teixeira', email: 'mariana.teixeira@gmail.com' };
const gallery = { name: 'Lisbon Photo Gallery', email: 'programa@lisbonphoto.pt' };

export const seedThreads: MailThread[] = [
	{
		id: 'thr_beatriz', subject: 'Wedding gallery — thank you!', mailbox: 'inbox', labels: ['clients', 'galleries'], unread: true, starred: true, clientId: 'cli_beatriz', updatedAt: minutesAgo(40),
		messages: [
			message('outbound', beatriz, daysAgo(6, 10), 'Your photographs are ready — Quinta da Regaleira', 'Hello Beatriz,\n\nYour gallery is ready to view. Take your time choosing your favourites.\n\nWith care,\nNostos', { status: 'opened' }),
			message('inbound', beatriz, minutesAgo(40), 'Re: Your photographs are ready — Quinta da Regaleira', 'Olá!\n\nWe just finished choosing. It was so hard. Every photo brought us back to that day. Nuno cried at the one under the arches.\n\nCould we also get a printed album for my parents? What are the options?\n\nObrigada,\nBeatriz', { attachments: [{ id: 'att_1', filename: 'album-ideas.pdf', contentType: 'application/pdf', size: 482_113 }] })
		]
	},
	{
		id: 'thr_duarte', subject: 'Porsche 911 launch — October', mailbox: 'inbox', labels: ['requests'], unread: true, starred: false, clientId: 'cli_duarte', updatedAt: minutesAgo(50),
		messages: [
			message('inbound', miguel, minutesAgo(50), 'Porsche 911 launch — October', 'Good afternoon,\n\nI just submitted a request on your website for the launch of three cars at our Estoril showroom. We saw your automotive work in the archive and liked the restraint of it.\n\nIs the 12th possible? We are flexible on the time.\n\nBest regards,\nMiguel Duarte\nDuarte Automóveis')
		]
	},
	{
		id: 'thr_lumen', subject: 'Quote OR 2026/12 — rooms and restaurant', mailbox: 'inbox', labels: ['clients', 'invoices'], unread: true, starred: false, clientId: 'cli_lumen', updatedAt: daysAgo(1, 9),
		messages: [
			message('outbound', ricardo, daysAgo(2, 11), 'Quote OR 2026/12 — rooms and restaurant', 'Hello Ricardo,\n\nThank you for the details. Please find the quote for the rooms and restaurant attached. It is valid for 30 days.\n\nNostos', { attachments: [{ id: 'att_2', filename: 'OR-2026-12.pdf', contentType: 'application/pdf', size: 96_420 }], status: 'opened' }),
			message('inbound', ricardo, daysAgo(1, 9), 'Re: Quote OR 2026/12 — rooms and restaurant', 'Hi,\n\nThanks for this. Does the quote include licensing for booking platforms (Booking, Expedia) or only our own website? Our marketing team needs to know before approving.\n\nRicardo')
		]
	},
	{
		id: 'thr_sal', subject: 'Invoice FT 2026/41', mailbox: 'inbox', labels: ['invoices'], unread: false, starred: false, clientId: 'cli_sal', updatedAt: daysAgo(1, 16),
		messages: [
			message('outbound', sofia, daysAgo(8, 12), 'Invoice FT 2026/41 from Nostos', 'Hello Sofia,\n\nPlease find invoice FT 2026/41 attached.\n\nThank you,\nNostos', { attachments: [{ id: 'att_3', filename: 'FT-2026-41.pdf', contentType: 'application/pdf', size: 88_004 }] }),
			message('inbound', sofia, daysAgo(1, 16), 'Re: Invoice FT 2026/41 from Nostos', 'Paid today. Thanks again, the spring photos are doing so well for us. See you on the 28th for the autumn menu!\n\nSofia')
		]
	},
	{
		id: 'thr_ana', subject: 'Print of Nº 412', mailbox: 'inbox', labels: ['orders'], unread: false, starred: false, clientId: 'cli_ana', updatedAt: daysAgo(2, 10),
		messages: [
			message('inbound', ana, daysAgo(2, 10), 'Print of Nº 412', 'Hello,\n\nI ordered an A3 print of “Yellow” this morning. Would it be possible to have it framed as well? It is a gift, so no invoice in the parcel, please.\n\nThank you,\nAna')
		]
	},
	{
		id: 'thr_pedro', subject: 'Joining the team', mailbox: 'inbox', labels: [], unread: false, starred: false, clientId: null, updatedAt: daysAgo(2, 18),
		messages: [
			message('inbound', pedro, daysAgo(2, 18), 'Joining the team', 'Hi Marta,\n\nThanks for the invite. I will set up my account this week. Should I upload my portfolio to the archive directly or send it to Joana first?\n\nPedro')
		]
	},
	{
		id: 'thr_exhibition', subject: 'Lisbon light — exhibition inquiry', mailbox: 'archive', labels: [], unread: false, starred: false, clientId: null, updatedAt: daysAgo(30, 11),
		messages: [
			message('inbound', gallery, daysAgo(31, 15), 'Lisbon light — exhibition inquiry', 'Dear Nostos,\n\nWe are programming a group show on street photography for the spring and would like to include three of your photographs.\n\nKind regards'),
			message('outbound', gallery, daysAgo(30, 11), 'Re: Lisbon light — exhibition inquiry', 'Thank you, we would be glad to take part. Could you share the dates and the print sizes you have in mind?\n\nNostos')
		]
	},
	{
		id: 'thr_mariana', subject: 'Portrait session — options', mailbox: 'drafts', labels: ['requests'], unread: false, starred: false, clientId: 'cli_mariana', updatedAt: daysAgo(3, 19),
		messages: [
			message('outbound', mariana, daysAgo(3, 19), 'Portrait session — options', 'Hello Mariana,\n\nThank you for reaching out. For a session in Sintra we suggest late afternoon, when', { status: 'queued', providerId: undefined })
		]
	}
];
