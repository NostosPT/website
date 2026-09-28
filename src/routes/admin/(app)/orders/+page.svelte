<script lang="ts">
	import {
		AvatarGroup,
		Badge,
		Card,
		SegmentedControl,
		Stat,
		Table,
		TableCell,
		TableHeaderCell,
		TableRow
	} from '@nostospt/ui';
	import OrderDialog from '$lib/admin/orders/OrderDialog.svelte';
	import { fulfilmentStatus, orders, paymentStatus, products } from '$lib/admin/orders/store.svelte';
	import { photos } from '$lib/admin/photos/store.svelte';
	import { formatMoney, formatRelative } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let filter = $state<'all' | 'todo' | 'digital' | 'prints'>('all');
	let openId = $state<string | null>(null);
	let dialogOpen = $state(false);
	let current = $derived(orders.get(openId));

	let rows = $derived(
		orders.items.filter((o) => {
			if (filter === 'todo') return o.payment === 'PAID' && o.fulfilment === 'UNFULFILLED';
			if (filter === 'digital') return o.items.every((i) => products[i.product].digital);
			if (filter === 'prints') return o.items.some((i) => !products[i.product].digital);
			return true;
		})
	);

	function show(id: string) {
		openId = id;
		dialogOpen = true;
	}
</script>

<PageHeader
	kicker="Finance"
	title="Orders"
	description="Prints and licences sold from the archive. Photo IDs make every order traceable to a single photograph."
/>

<div class="stats">
	<Card padding="md"><Stat label="Revenue, 30 days" value={formatMoney(orders.revenueSince(30))} /></Card>
	<Card padding="md"><Stat label="To fulfil" value={String(orders.toFulfil.length)} hint="Paid, not yet sent" /></Card>
	<Card padding="md"><Stat label="Orders, 30 days" value={String(orders.items.filter((o) => Date.now() - new Date(o.createdAt).getTime() < 30 * 86_400_000).length)} /></Card>
</div>

<div class="bar">
	<SegmentedControl
		bind:value={filter}
		ariaLabel="Filter"
		items={[
			{ value: 'all', label: 'All' },
			{ value: 'todo', label: 'To fulfil' },
			{ value: 'prints', label: 'Prints' },
			{ value: 'digital', label: 'Licences' }
		]}
	/>
</div>

<Table>
	<thead>
		<TableRow>
			<TableHeaderCell>Order</TableHeaderCell>
			<TableHeaderCell>Photographs</TableHeaderCell>
			<TableHeaderCell>Products</TableHeaderCell>
			<TableHeaderCell>Payment</TableHeaderCell>
			<TableHeaderCell>Fulfilment</TableHeaderCell>
			<TableHeaderCell numeric>Total</TableHeaderCell>
		</TableRow>
	</thead>
	<tbody>
		{#each rows as order (order.id)}
			{@const pay = paymentStatus[order.payment]}
			{@const ful = fulfilmentStatus[order.fulfilment]}
			<TableRow interactive onclick={() => show(order.id)}>
				<TableCell>
					<span class="order">
						<strong>{order.reference}</strong>
						<small>{order.customer.name} · {formatRelative(order.createdAt)}</small>
					</span>
				</TableCell>
				<TableCell>
					<AvatarGroup
						size="sm"
						items={order.items.map((i) => {
							const photo = photos.get(i.photoId);
							return { src: photo?.urls?.thumbnail ?? null, name: photo ? `Nº ${photo.number}` : '?' };
						})}
					/>
				</TableCell>
				<TableCell muted>{[...new Set(order.items.map((i) => products[i.product].label))].join(', ')}</TableCell>
				<TableCell><Badge tone={pay.tone} size="sm" variant="dot">{pay.label}</Badge></TableCell>
				<TableCell><Badge tone={ful.tone} size="sm">{ful.label}</Badge></TableCell>
				<TableCell numeric>{formatMoney(orders.totalOf(order))}</TableCell>
			</TableRow>
		{/each}
	</tbody>
</Table>

{#if current}
	{#key current.id}
		<OrderDialog order={current} bind:open={dialogOpen} />
	{/key}
{/if}

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--ui-space-8);
		margin-bottom: var(--ui-space-12);
	}
	.bar {
		margin-bottom: var(--ui-space-10);
	}
	.order {
		display: grid;
	}
	.order strong {
		font-weight: var(--ui-weight-medium);
	}
	small {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
</style>
