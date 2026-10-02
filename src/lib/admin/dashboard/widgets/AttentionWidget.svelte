<script lang="ts">
	import { Badge, Card, CardHeader, EmptyState, Icon, List, ListItem, type Tone } from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { galleries } from '$lib/admin/galleries/store.svelte';
	import { invoices, totalOf } from '$lib/admin/invoices/store.svelte';
	import { mail } from '$lib/admin/mail/store.svelte';
	import { orders } from '$lib/admin/orders/store.svelte';
	import { pipeline } from '$lib/admin/pipeline/store.svelte';
	import { formatMoney, formatShortDate, pluralize } from '$lib/admin/shared/format';
	import { success } from '$lib/admin/success/store.svelte';
	import type { Area } from '$lib/admin/team/types';
	import { dashboard } from '../store.svelte';

	type Item = { id: string; icon: string; title: string; detail: string; href: string; tone: Tone; badge: string; area: Area };

	const DAY = 86_400_000;

	/** Everything waiting on the team, most urgent first; empty sources drop out. */
	let items = $derived.by(() => {
		const now = Date.now();
		const list: Item[] = [];

		for (const doc of invoices.overdue) {
			list.push({
				id: `inv_${doc.id}`, icon: 'receipt', area: 'finance', tone: 'danger', badge: 'Overdue',
				title: `${doc.number ?? 'Invoice'} · ${formatMoney(totalOf(doc), doc.currency)}`,
				detail: `${clients.get(doc.clientId)?.name ?? 'Client'}, due ${doc.dueDate ? formatShortDate(doc.dueDate) : '—'}`,
				href: `/admin/invoices/${doc.id}`
			});
		}
		if (pipeline.newCount) {
			list.push({
				id: 'requests', icon: 'board', area: 'crm', tone: 'info', badge: 'New',
				title: `${pluralize(pipeline.newCount, 'request')} to review`,
				detail: 'Waiting for a first reply', href: '/admin/pipeline'
			});
		}
		for (const gallery of galleries.items) {
			const submitted = gallery.selectionSubmittedAt && now - new Date(gallery.selectionSubmittedAt).getTime() < 7 * DAY;
			if (gallery.status === 'PUBLISHED' && submitted) {
				list.push({
					id: `sel_${gallery.id}`, icon: 'heart', area: 'studio', tone: 'accent', badge: 'Selection',
					title: `Favourites in “${gallery.title}”`,
					detail: `${galleries.selectedCount(gallery)} picked, ready for editing`, href: `/admin/galleries/${gallery.id}`
				});
			}
			const left = gallery.expiresAt ? new Date(gallery.expiresAt).getTime() - now : null;
			if (gallery.status === 'PUBLISHED' && left != null && left > 0 && left < 21 * DAY) {
				list.push({
					id: `exp_${gallery.id}`, icon: 'clock', area: 'studio', tone: 'warning', badge: 'Expiring',
					title: `“${gallery.title}” closes ${formatShortDate(gallery.expiresAt!)}`,
					detail: `${Math.ceil(left / DAY)} days left`, href: `/admin/galleries/${gallery.id}`
				});
			}
		}
		if (orders.toFulfil.length) {
			list.push({
				id: 'orders', icon: 'credit-card', area: 'finance', tone: 'warning', badge: 'To fulfil',
				title: `${pluralize(orders.toFulfil.length, 'paid order')} to fulfil`,
				detail: 'Prints and licences awaiting delivery', href: '/admin/orders'
			});
		}
		if (success.dueThisWeek.length) {
			list.push({
				id: 'follow-ups', icon: 'check-circle', area: 'crm', tone: 'neutral', badge: 'This week',
				title: `${pluralize(success.dueThisWeek.length, 'follow-up')} due`,
				detail: 'Reviews, check-ins and renewals', href: '/admin/success'
			});
		}
		if (mail.unreadCount) {
			list.push({
				id: 'mail', icon: 'inbox', area: 'mail', tone: 'neutral', badge: 'Unread',
				title: `${pluralize(mail.unreadCount, 'unread email')}`,
				detail: 'In the studio inbox', href: '/admin/mail'
			});
		}
		return list.filter((item) => dashboard.allows(item.area));
	});
</script>

<Card>
	<CardHeader title="Needs attention" description={items.length ? pluralize(items.length, 'item') : undefined} divided />
	{#if items.length}
		<List>
			{#each items.slice(0, 7) as item (item.id)}
				<ListItem title={item.title} description={item.detail} href={item.href}>
					{#snippet leading()}<span class="icon"><Icon name={item.icon} size={16} /></span>{/snippet}
					{#snippet trailing()}<Badge size="sm" tone={item.tone}>{item.badge}</Badge>{/snippet}
				</ListItem>
			{/each}
		</List>
	{:else}
		<EmptyState icon="check-circle" size="sm" title="All clear" description="Nothing is waiting on you." />
	{/if}
</Card>

<style>
	.icon {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: var(--ui-radius-md);
		background: var(--ui-bg-muted);
		color: var(--ui-fg-muted);
	}
</style>
