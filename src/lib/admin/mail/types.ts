/**
 * Studio mail, designed around Resend (not wired yet):
 *
 * - Sending: the dashboard posts to the Nostos API, which calls Resend with the
 *   studio's verified domain. The Resend API key never reaches the browser.
 * - Receiving: Resend's inbound (receiving) webhooks deliver mail to the API,
 *   which stores it and threads it by Message-ID / In-Reply-To / References.
 * - Delivery status: Resend's email.* webhook events update `status` on
 *   outbound messages.
 */

export type Mailbox = 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash';

export type MailLabel = 'clients' | 'requests' | 'invoices' | 'galleries' | 'orders';

/** Outbound delivery state, from Resend webhook events. */
export type DeliveryStatus =
	| 'queued'
	| 'sent'
	| 'delivered'
	| 'delivery_delayed'
	| 'opened'
	| 'clicked'
	| 'bounced'
	| 'complained';

export interface Address {
	name?: string;
	email: string;
}

export interface Attachment {
	id: string;
	filename: string;
	contentType: string;
	size: number;
}

export interface MailMessage {
	id: string;
	direction: 'inbound' | 'outbound';
	from: Address;
	to: Address[];
	cc: Address[];
	subject: string;
	/** Plain text. HTML bodies must be sanitised server-side before display. */
	text: string;
	sentAt: string;
	attachments: Attachment[];
	/** RFC 5322 Message-ID; replies reference it so clients' mail apps thread them. */
	messageId: string;
	/** Outbound only. */
	status?: DeliveryStatus;
	/** Outbound only: the Resend email id. */
	providerId?: string;
}

export interface MailThread {
	id: string;
	subject: string;
	mailbox: Mailbox;
	labels: MailLabel[];
	messages: MailMessage[];
	unread: boolean;
	starred: boolean;
	/** Linked CRM client, matched by address. */
	clientId: string | null;
	updatedAt: string;
}

export interface Draft {
	to: string[];
	cc: string[];
	subject: string;
	text: string;
	attachments: File[];
	/** Set when replying, so the message joins the existing thread. */
	threadId?: string;
}

export interface MailTemplate {
	id: string;
	name: string;
	subject: string;
	text: string;
}
