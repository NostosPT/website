/**
 * Client success: what happens after delivery. Follow-ups are created by hand
 * or by automations; feedback can become a website testimonial.
 * Not in the API yet.
 */
export type FollowUpKind = 'review' | 'gallery-expiry' | 'anniversary' | 'upsell' | 'check-in' | 'payment';

export interface FollowUp {
	id: string;
	clientId: string;
	kind: FollowUpKind;
	title: string;
	dueAt: string;
	done: boolean;
	assigneeId: string | null;
	href: string | null;
	/** Created by an automation rather than by hand. */
	automationId: string | null;
}

export interface Automation {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	/** Mail template sent, when the automation emails the client. */
	templateId: string | null;
}

export interface Feedback {
	id: string;
	clientId: string;
	/** 1–5 */
	rating: number;
	comment: string;
	createdAt: string;
	testimonial: boolean;
}
