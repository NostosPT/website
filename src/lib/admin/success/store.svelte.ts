import { daysAgo, daysFromNow, mockId } from '$lib/admin/shared/mock-dates';
import type { Automation, Feedback, FollowUp, FollowUpKind } from './types';

export const followUpKinds: Record<FollowUpKind, { label: string; icon: string }> = {
	review: { label: 'Review request', icon: 'star' },
	'gallery-expiry': { label: 'Gallery expiring', icon: 'clock' },
	anniversary: { label: 'Anniversary', icon: 'heart' },
	upsell: { label: 'Prints & albums', icon: 'bookmark' },
	'check-in': { label: 'Check-in', icon: 'phone' },
	payment: { label: 'Payment', icon: 'receipt' }
};

const followUps: FollowUp[] = [
	{ id: 'fu_1', clientId: 'cli_beatriz', kind: 'upsell', title: 'Album options for the parents', dueAt: daysFromNow(1), done: false, assigneeId: 'usr_marta', href: '/admin/mail?thread=thr_beatriz', automationId: null },
	{ id: 'fu_2', clientId: 'cli_lucas', kind: 'payment', title: 'FT 2026/42 is 5 days overdue', dueAt: daysAgo(0), done: false, assigneeId: 'usr_tomas', href: '/admin/invoices/inv_42', automationId: 'auto_overdue' },
	{ id: 'fu_3', clientId: 'cli_sal', kind: 'gallery-expiry', title: '“Spring menu” closes in 20 days', dueAt: daysFromNow(13), done: false, assigneeId: null, href: '/admin/galleries/gal_sal_spring', automationId: 'auto_expiry' },
	{ id: 'fu_4', clientId: 'cli_joao', kind: 'anniversary', title: 'First wedding anniversary — print book?', dueAt: daysFromNow(17), done: false, assigneeId: 'usr_ines', href: '/admin/clients/cli_joao', automationId: 'auto_anniversary' },
	{ id: 'fu_5', clientId: 'cli_lucas', kind: 'review', title: 'Ask for a review', dueAt: daysAgo(40), done: true, assigneeId: 'usr_rui', href: null, automationId: 'auto_review' },
	{ id: 'fu_6', clientId: 'cli_filipa', kind: 'check-in', title: 'Confirm dinner timings', dueAt: daysFromNow(6), done: false, assigneeId: 'usr_ines', href: '/admin/pipeline?request=req_027', automationId: null }
];

const automations: Automation[] = [
	{ id: 'auto_review', name: 'Ask for a review', description: '14 days after a gallery is delivered, email the client asking for a short review.', enabled: true, templateId: 'follow-up' },
	{ id: 'auto_expiry', name: 'Gallery closing soon', description: 'Remind the client 7 days before their gallery expires, and create a follow-up for the team.', enabled: true, templateId: null },
	{ id: 'auto_overdue', name: 'Overdue invoices', description: 'Create a follow-up the day an invoice becomes overdue.', enabled: true, templateId: null },
	{ id: 'auto_anniversary', name: 'Wedding anniversaries', description: 'A month before the first anniversary, suggest prints or a book.', enabled: false, templateId: null }
];

const feedback: Feedback[] = [
	{ id: 'fb_1', clientId: 'cli_lucas', rating: 5, comment: 'They made our cars look the way we see them. Listings sold in a week.', createdAt: daysAgo(38), testimonial: true },
	{ id: 'fb_2', clientId: 'cli_sal', rating: 5, comment: 'Calm, precise, and the photos feel like the restaurant.', createdAt: daysAgo(35), testimonial: false },
	{ id: 'fb_3', clientId: 'cli_joao', rating: 4, comment: 'Beautiful work. Delivery took a little longer than we hoped.', createdAt: daysAgo(150), testimonial: false }
];

/** Needs API endpoints: /follow-ups, /automations (run by a scheduler), /feedback. */
class SuccessStore {
	followUps = $state<FollowUp[]>(followUps);
	automations = $state<Automation[]>(automations);
	feedback = $state<Feedback[]>(feedback);

	open = $derived(this.followUps.filter((f) => !f.done));
	dueThisWeek = $derived(this.open.filter((f) => new Date(f.dueAt).getTime() < Date.now() + 7 * 86_400_000));
	averageRating = $derived(
		this.feedback.length ? this.feedback.reduce((sum, f) => sum + f.rating, 0) / this.feedback.length : 0
	);

	toggle(id: string) {
		const item = this.followUps.find((f) => f.id === id);
		if (item) item.done = !item.done;
	}

	add(input: Omit<FollowUp, 'id' | 'done' | 'automationId'>) {
		this.followUps.push({ ...input, id: mockId('fu'), done: false, automationId: null });
	}
}

export const success = new SuccessStore();
