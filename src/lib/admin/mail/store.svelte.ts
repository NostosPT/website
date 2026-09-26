import { mockId } from '$lib/admin/shared/mock-dates';
import { STUDIO_ADDRESS, seedThreads } from './mock';
import type { Address, DeliveryStatus, Draft, MailLabel, MailMessage, MailThread, Mailbox } from './types';

export const mailboxes: { key: Mailbox; label: string; icon: string }[] = [
	{ key: 'inbox', label: 'Inbox', icon: 'inbox' },
	{ key: 'sent', label: 'Sent', icon: 'send' },
	{ key: 'drafts', label: 'Drafts', icon: 'file' },
	{ key: 'archive', label: 'Archive', icon: 'folder' },
	{ key: 'trash', label: 'Trash', icon: 'trash' }
];

export const labels: { key: MailLabel; label: string }[] = [
	{ key: 'clients', label: 'Clients' },
	{ key: 'requests', label: 'Requests' },
	{ key: 'galleries', label: 'Galleries' },
	{ key: 'invoices', label: 'Invoices' },
	{ key: 'orders', label: 'Orders' }
];

export const deliveryStatus: Record<DeliveryStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' }> = {
	queued: { label: 'Queued', tone: 'neutral' },
	sent: { label: 'Sent', tone: 'info' },
	delivered: { label: 'Delivered', tone: 'success' },
	delivery_delayed: { label: 'Delayed', tone: 'warning' },
	opened: { label: 'Opened', tone: 'success' },
	clicked: { label: 'Clicked', tone: 'success' },
	bounced: { label: 'Bounced', tone: 'danger' },
	complained: { label: 'Marked as spam', tone: 'danger' }
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (value: string) => EMAIL.test(value.trim());

const emptyDraft = (): Draft => ({ to: [], cc: [], subject: '', text: '', attachments: [] });

/**
 * Mail threads and the global composer. Endpoints to build on the API:
 * GET /mail/threads?mailbox=, GET/PATCH /mail/threads/:id, POST /mail/messages
 * (send via Resend), POST /webhooks/resend (inbound mail and delivery events).
 */
class MailStore {
	threads = $state<MailThread[]>(seedThreads);
	composer = $state<{ open: boolean; draft: Draft }>({ open: false, draft: emptyDraft() });

	unreadCount = $derived(this.threads.filter((t) => t.mailbox === 'inbox' && t.unread).length);

	counts = $derived(
		Object.fromEntries(
			mailboxes.map(({ key }) => [
				key,
				key === 'inbox' || key === 'drafts'
					? this.threads.filter((t) => t.mailbox === key && (key === 'drafts' || t.unread)).length
					: 0
			])
		) as Record<Mailbox, number>
	);

	get(id: string | null | undefined): MailThread | undefined {
		return id ? this.threads.find((t) => t.id === id) : undefined;
	}

	list(mailbox: Mailbox, label: MailLabel | null = null, query = ''): MailThread[] {
		const q = query.trim().toLowerCase();
		return this.threads
			.filter((t) => t.mailbox === mailbox)
			.filter((t) => !label || t.labels.includes(label))
			.filter(
				(t) =>
					!q ||
					t.subject.toLowerCase().includes(q) ||
					t.messages.some(
						(m) => m.from.email.includes(q) || (m.from.name ?? '').toLowerCase().includes(q)
					)
			)
			.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	}

	forClient(clientId: string): MailThread[] {
		return this.threads.filter((t) => t.clientId === clientId);
	}

	markRead(id: string, read = true) {
		const thread = this.get(id);
		if (thread) thread.unread = !read;
	}

	toggleStar(id: string) {
		const thread = this.get(id);
		if (thread) thread.starred = !thread.starred;
	}

	moveTo(id: string, mailbox: Mailbox) {
		const thread = this.get(id);
		if (thread) thread.mailbox = mailbox;
	}

	/** Opens the composer from anywhere in the dashboard. */
	compose(draft: Partial<Draft> = {}) {
		this.composer = { open: true, draft: { ...emptyDraft(), ...draft } };
	}

	replyTo(thread: MailThread) {
		const last = thread.messages.findLast((m) => m.direction === 'inbound') ?? thread.messages.at(-1);
		const to = last?.direction === 'inbound' ? last.from.email : (last?.to[0]?.email ?? '');
		this.compose({
			to: to ? [to] : [],
			subject: thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`,
			threadId: thread.id
		});
	}

	/** Mock send: status then walks queued → sent → delivered, as Resend webhooks would. */
	async send(draft: Draft): Promise<MailThread> {
		await new Promise((resolve) => setTimeout(resolve, 500));
		const now = new Date().toISOString();
		const toAddress = (email: string): Address => ({ email });
		const outbound: MailMessage = {
			id: mockId('msg'),
			direction: 'outbound',
			from: STUDIO_ADDRESS,
			to: draft.to.map(toAddress),
			cc: draft.cc.map(toAddress),
			subject: draft.subject,
			text: draft.text,
			sentAt: now,
			attachments: draft.attachments.map((file) => ({
				id: mockId('att'),
				filename: file.name,
				contentType: file.type,
				size: file.size
			})),
			messageId: `<${mockId('mid')}@nostos.studio>`,
			status: 'queued',
			providerId: mockId('re')
		};

		let thread = this.get(draft.threadId);
		if (thread) {
			thread.messages.push(outbound);
			thread.updatedAt = now;
			if (thread.mailbox === 'drafts' || thread.mailbox === 'trash') thread.mailbox = 'sent';
		} else {
			thread = {
				id: mockId('thr'),
				subject: draft.subject || '(no subject)',
				mailbox: 'sent',
				labels: [],
				messages: [outbound],
				unread: false,
				starred: false,
				clientId: null,
				updatedAt: now
			};
			this.threads.unshift(thread);
		}

		const sent = thread.messages.at(-1)!;
		setTimeout(() => (sent.status = 'sent'), 800);
		setTimeout(() => (sent.status = 'delivered'), 2400);
		return thread;
	}
}

export const mail = new MailStore();
