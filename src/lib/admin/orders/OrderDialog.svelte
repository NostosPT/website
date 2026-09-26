<script lang="ts">
	import {
		Badge,
		Button,
		DataList,
		DataListRow,
		Field,
		Input,
		List,
		ListItem,
		Modal,
		Select,
		Thumbnail,
		toast
	} from '@nostospt/ui';
	import { photos } from '$lib/admin/photos/store.svelte';
	import { formatDateTime, formatMoney, photoNumber } from '$lib/admin/shared/format';
	import { fulfilmentStatus, orders, paymentStatus, products } from './store.svelte';
	import type { Fulfilment, Order } from './types';

	let { order, open = $bindable(false) }: { order: Order; open?: boolean } = $props();

	let digitalOnly = $derived(order.items.every((i) => products[i.product].digital));
	let fulfilmentOptions = $derived(
		(Object.keys(fulfilmentStatus) as Fulfilment[])
			.filter((f) => (digitalOnly ? ['UNFULFILLED', 'DOWNLOADED'].includes(f) : f !== 'DOWNLOADED'))
			.map((value) => ({ value, label: fulfilmentStatus[value].label }))
	);
</script>

<Modal bind:open title={order.reference} description={`${order.customer.name} · ${formatDateTime(order.createdAt)}`} size="lg">
	<div class="layout">
		<div class="main">
			<List bordered>
				{#each order.items as item, i (i)}
					{@const photo = photos.get(item.photoId)}
					<ListItem
						title={`${products[item.product].label}${item.size ? ` · ${item.size}` : ''}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`}
						description={photo ? `${photoNumber(photo.number)} “${photo.title}”` : item.photoId}
						href={photo ? `/admin/photos/${photo.id}` : undefined}
					>
						{#snippet media()}<Thumbnail src={photo?.urls.thumbnail} alt="" size={44} />{/snippet}
						{#snippet meta()}<span class="price">{formatMoney(item.quantity * item.unitPriceCents)}</span>{/snippet}
					</ListItem>
				{/each}
			</List>
			{#if order.note}<p class="note">{order.note}</p>{/if}

			<div class="two">
				<Field label="Fulfilment">
					{#snippet control({ id }: { id: string })}
						<Select {id} bind:value={order.fulfilment} options={fulfilmentOptions} />
					{/snippet}
				</Field>
				{#if !digitalOnly}
					<Field label="Tracking number" optional>
						{#snippet control({ id }: { id: string })}
							<Input
								{id}
								value={order.trackingNumber ?? ''}
								placeholder="CTT or courier reference"
								onchange={(e: Event) => orders.update(order.id, { trackingNumber: (e.currentTarget as HTMLInputElement).value || null })}
							/>
						{/snippet}
					</Field>
				{/if}
			</div>
		</div>

		<aside>
			<DataList size="sm" dividers>
				<DataListRow label="Payment">
					{#snippet valueSlot()}<Badge tone={paymentStatus[order.payment].tone} size="sm">{paymentStatus[order.payment].label}</Badge>{/snippet}
				</DataListRow>
				<DataListRow label="Shipping" value={formatMoney(order.shippingCents)} />
				<DataListRow label="Total" value={formatMoney(orders.totalOf(order))} />
				<DataListRow label="Email">
					{#snippet valueSlot()}<a href={`mailto:${order.customer.email}`}>{order.customer.email}</a>{/snippet}
				</DataListRow>
				{#if order.shippingAddress}<DataListRow label="Ship to" value={order.shippingAddress} />{/if}
			</DataList>
			{#if order.invoiceId}
				<Button variant="outline" icon="receipt" href={`/admin/invoices/${order.invoiceId}`} block>Open invoice</Button>
			{:else}
				<Button
					variant="outline"
					icon="receipt"
					block
					href={`/admin/invoices/new?type=INVOICE${order.customer.clientId ? `&client=${order.customer.clientId}` : ''}`}
				>
					Create invoice
				</Button>
			{/if}
		</aside>
	</div>

	{#snippet footer({ close }: { close: () => void })}
		<Button onclick={() => (toast.success(`${order.reference} updated`), close())}>Done</Button>
	{/snippet}
</Modal>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 240px;
		gap: var(--ui-space-12);
	}
	.main,
	aside {
		display: grid;
		gap: var(--ui-space-10);
		align-content: start;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ui-space-8);
	}
	.price {
		font-size: var(--ui-text-sm);
		font-weight: var(--ui-numeric-weight);
	}
	.note {
		margin: 0;
		padding: var(--ui-space-6) var(--ui-space-8);
		font-size: var(--ui-text-sm);
		background: var(--ui-bg-muted);
		border-radius: var(--ui-radius-md);
		color: var(--ui-fg-muted);
	}
	a {
		color: var(--ui-accent-text);
	}
	@media (max-width: 760px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
