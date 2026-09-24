import { daysAgo, minutesAgo } from '$lib/admin/shared/mock-dates';

export type Notification = {
	id: string;
	icon: string;
	title: string;
	body: string;
	href: string;
	createdAt: string;
	read: boolean;
};

/**
 * Activity notifications. Server-sent later (API events, Resend webhooks);
 * seeded here so the bell has something to show.
 */
class NotificationStore {
	items = $state<Notification[]>([
		{
			id: 'ntf_1',
			icon: 'heart',
			title: 'Selection complete',
			body: 'Beatriz & Nuno picked 64 photos in “Quinta da Regaleira”.',
			href: '/admin/galleries/gal_regaleira',
			createdAt: minutesAgo(12),
			read: false
		},
		{
			id: 'ntf_2',
			icon: 'board',
			title: 'New request',
			body: 'Automotive: Porsche 911 launch, from Duarte Automóveis.',
			href: '/admin/pipeline',
			createdAt: minutesAgo(48),
			read: false
		},
		{
			id: 'ntf_3',
			icon: 'receipt',
			title: 'Invoice paid',
			body: 'FT 2026/41 · €1,845.00 from Atelier Sal.',
			href: '/admin/invoices',
			createdAt: daysAgo(1, 16),
			read: true
		},
		{
			id: 'ntf_4',
			icon: 'credit-card',
			title: 'New order',
			body: 'Print A3 of Nº 412 “Yellow”.',
			href: '/admin/orders',
			createdAt: daysAgo(2, 9),
			read: true
		}
	]);

	unread = $derived(this.items.filter((n) => !n.read).length);

	markRead(id: string) {
		const item = this.items.find((n) => n.id === id);
		if (item) item.read = true;
	}

	markAllRead() {
		for (const item of this.items) item.read = true;
	}
}

export const notifications = new NotificationStore();
