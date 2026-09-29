<script lang="ts">
	import { Button, Card, Stat } from '@nostospt/ui';
	import { session } from '$lib/admin/auth/session.svelte';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { invoices } from '$lib/admin/invoices/store.svelte';
	import { orders } from '$lib/admin/orders/store.svelte';
	import { photos } from '$lib/admin/photos/store.svelte';
	import { pipeline } from '$lib/admin/pipeline/store.svelte';
	import { formatMoney, formatShortDate } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';
	import { can } from '$lib/admin/team/roles';

	let role = $derived(session.user?.role ?? 'ADMIN');

	let showWork = $derived(can(role, 'crm'));
	let showLibrary = $derived(can(role, 'archive'));
	let showBusiness = $derived(can(role, 'finance'));

	let nextShoots = $derived(pipeline.upcoming.slice(0, 3));
</script>

<PageHeader
	kicker="Studio"
	title="Overview"
	description="Where the studio stands: open requests, library growth and money waiting to come in."
/>

<div class="stats">
	{#if showWork}
		<Card padding="md"><Stat label="New requests" value={String(pipeline.newCount)} hint="Waiting for a first reply" /></Card>
		<Card padding="md"><Stat label="Open quotes" value={formatMoney(pipeline.quotedValueCents)} hint="Net, awaiting the client" /></Card>
	{/if}
	{#if showLibrary}
		<Card padding="md"><Stat label="Photos" value={String(photos.items.length)} hint="Published and unpublished" /></Card>
		<Card padding="md"><Stat label="Clients" value={String(clients.items.length)} hint="Leads, active and past" /></Card>
	{/if}
	{#if showBusiness}
		<Card padding="md"><Stat label="Orders to fulfil" value={String(orders.toFulfil.length)} hint="Paid, not yet sent" /></Card>
		<Card padding="md"><Stat label="Outstanding" value={formatMoney(invoices.outstandingCents)} hint="Issued, awaiting payment" /></Card>
	{/if}
</div>

<div class="grid">
	{#if showWork}
		<Card padding="md">
			<h2>Work</h2>
			<p>
				{pipeline.newCount} new, {pipeline.upcoming.length} booked ahead.
				{#if nextShoots.length}
					Next: {nextShoots.map((r) => r.project.date ? `${r.title} · ${formatShortDate(r.project.date)}` : r.title).join(' · ')}.
				{/if}
			</p>
			<div class="links">
				<Button href="/admin/pipeline" variant="outline" size="sm" icon="board">Pipeline</Button>
				<Button href="/admin/clients" variant="outline" size="sm" icon="users">Clients</Button>
			</div>
		</Card>
	{/if}
	{#if showLibrary}
		<Card padding="md">
			<h2>Library</h2>
			<p>{photos.items.length} photographs in the archive, {clients.items.length} clients on record.</p>
			<div class="links">
				<Button href="/admin/photos" variant="outline" size="sm" icon="image">Photos</Button>
				<Button href="/admin/uploads" variant="outline" size="sm" icon="upload">Uploads</Button>
			</div>
		</Card>
	{/if}
	{#if showBusiness}
		<Card padding="md">
			<h2>Business</h2>
			<p>
				{orders.toFulfil.length} orders to fulfil, {invoices.outstanding.length} invoices outstanding
				({formatMoney(invoices.outstandingCents)}).
			</p>
			<div class="links">
				<Button href="/admin/orders" variant="outline" size="sm" icon="credit-card">Orders</Button>
				<Button href="/admin/invoices" variant="outline" size="sm" icon="receipt">Invoices</Button>
			</div>
		</Card>
	{/if}
</div>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: var(--ui-space-8);
		margin-bottom: var(--ui-space-12);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--ui-space-8);
	}
	h2 {
		margin: 0 0 var(--ui-space-4);
		font: 400 var(--ui-text-lg) / 1.3 var(--ui-font-serif);
		color: var(--ui-fg-default);
	}
	p {
		margin: 0 0 var(--ui-space-8);
		font-size: var(--ui-text-sm);
		line-height: var(--ui-leading-relaxed);
		color: var(--ui-fg-muted);
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-space-4);
	}
</style>
