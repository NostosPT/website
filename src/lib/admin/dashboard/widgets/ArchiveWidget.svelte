<script lang="ts">
	import { Button, Card, CardBody, CardHeader, EmptyState } from '@nostospt/ui';
	import { photos } from '$lib/admin/photos/store.svelte';
	import { photoNumber } from '$lib/admin/shared/format';
	import { formatFigure } from '../format';
	import { ranges } from '../ranges';
	import { dashboard } from '../store.svelte';

	const statuses = [
		{ key: 'PUBLISHED', label: 'Published' },
		{ key: 'APPROVED', label: 'Approved' },
		{ key: 'DRAFT', label: 'Draft' }
	] as const;

	let total = $derived(photos.items.length);
	let rows = $derived(
		statuses.map((s) => {
			const count = photos.items.filter((p) => p.status === s.key).length;
			return { ...s, count, share: total ? count / total : 0 };
		})
	);
	let forSale = $derived(photos.items.filter((p) => p.availability === 'AVAILABLE').length);
	let uploads = $derived(dashboard.series('uploads'));
	let latest = $derived(photos.items.reduce((max, p) => Math.max(max, p.number), 0));
</script>

<Card>
	<CardHeader title="Archive" description={total ? `${formatFigure('count', total)} photographs · latest ${photoNumber(latest)}` : undefined} divided>
		{#snippet actions()}
			<Button href="/admin/uploads" variant="ghost" tone="neutral" size="sm" icon="upload">Upload</Button>
		{/snippet}
	</CardHeader>
	<CardBody>
		{#if total}
			<ul class="rows">
				{#each rows as row (row.key)}
					<li>
						<span class="label">{row.label}</span>
						<span class="track"><span class="bar" style:width="{row.share * 100}%"></span></span>
						<span class="count">{row.count}</span>
					</li>
				{/each}
			</ul>
			<dl class="facts">
				<div><dt>For sale</dt><dd>{formatFigure('count', forSale)}</dd></div>
				<div>
					<dt>Added, {ranges[dashboard.range].short}</dt>
					<dd>{uploads.available ? formatFigure('count', uploads.total) : '—'}</dd>
				</div>
			</dl>
		{:else}
			<EmptyState icon="image" size="sm" title="The archive is empty" description="Uploaded photographs appear here." />
		{/if}
	</CardBody>
</Card>

<style>
	.rows {
		display: grid;
		gap: var(--ui-space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) 2.5rem;
		align-items: center;
		gap: var(--ui-space-6);
		font-size: var(--ui-text-sm);
	}
	.label {
		color: var(--ui-fg-muted);
	}
	.track {
		height: 10px;
		background: var(--ui-bg-muted);
		border-radius: 2px;
		overflow: hidden;
	}
	.bar {
		display: block;
		height: 100%;
		background: var(--ui-accent-solid);
		border-radius: 0 2px 2px 0;
	}
	.count {
		text-align: end;
		font-variant-numeric: tabular-nums;
	}
	.facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--ui-space-8);
		margin: var(--ui-space-10) 0 0;
		padding-top: var(--ui-space-8);
		border-top: 1px solid var(--ui-border-subtle);
	}
	dt {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	dd {
		margin: var(--ui-space-2) 0 0;
		font: 400 var(--ui-text-xl) / 1.1 var(--ui-font-serif);
		font-variant-numeric: lining-nums tabular-nums;
	}
</style>
