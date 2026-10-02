<script lang="ts">
	import { Button, Card, CardBody, CardHeader, EmptyState } from '@nostospt/ui';
	import { pipeline, stages } from '$lib/admin/pipeline/store.svelte';
	import { settings } from '$lib/admin/settings/store.svelte';
	import { formatFigure } from '../format';

	/** Open stages as single-hue bars on a shared scale; value is quoted or estimated. */
	let rows = $derived.by(() => {
		const data = stages
			.filter((s) => s.key !== 'LOST')
			.map((stage) => {
				const items = pipeline.byStage(stage.key);
				const valueCents = items.reduce(
					(sum, r) => sum + (r.quoteCents ?? r.estimate?.toCents ?? r.estimate?.fromCents ?? 0),
					0
				);
				return { ...stage, count: items.length, valueCents };
			});
		const max = Math.max(1, ...data.map((d) => d.count));
		return data.map((d) => ({ ...d, share: d.count / max }));
	});

	let lost = $derived(pipeline.byStage('LOST').length);
	let total = $derived(rows.reduce((sum, r) => sum + r.count, 0));
</script>

<Card>
	<CardHeader title="Pipeline" description="Requests by stage, with quoted or estimated value." divided>
		{#snippet actions()}
			<Button href="/admin/pipeline" variant="ghost" tone="neutral" size="sm" trailingIcon="arrow-right">Open</Button>
		{/snippet}
	</CardHeader>
	<CardBody>
		{#if total}
			<ol class="stages">
				{#each rows as row (row.key)}
					<li>
						<a href={`/admin/pipeline?stage=${row.key}`} class="row" title={row.hint}>
							<span class="label">{row.label}</span>
							<span class="track"><span class="bar" style:width="{Math.max(row.share * 100, row.count ? 2 : 0)}%"></span></span>
							<span class="count">{row.count}</span>
							<span class="value">{row.valueCents ? formatFigure('money', row.valueCents, settings.studio.currency) : '—'}</span>
						</a>
					</li>
				{/each}
			</ol>
			<p class="foot">{lost} lost · {formatFigure('money', pipeline.quotedValueCents, settings.studio.currency)} in open quotes</p>
		{:else}
			<EmptyState icon="board" size="sm" title="No requests yet" />
		{/if}
	</CardBody>
</Card>

<style>
	.stages {
		display: grid;
		gap: var(--ui-space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.row {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) 2rem minmax(4.5rem, auto);
		align-items: center;
		gap: var(--ui-space-6);
		padding: var(--ui-space-3) var(--ui-space-4);
		margin: 0 calc(var(--ui-space-4) * -1);
		border-radius: var(--ui-radius-md);
		color: inherit;
		text-decoration: none;
		font-size: var(--ui-text-sm);
	}
	.row:hover {
		background: var(--ui-bg-hover);
	}
	.row:focus-visible {
		outline: 2px solid var(--ui-accent-ring);
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
		transition: width var(--ui-duration-normal) var(--ui-ease-out);
	}
	.count,
	.value {
		text-align: end;
		font-variant-numeric: tabular-nums;
	}
	.value {
		color: var(--ui-fg-muted);
	}
	.foot {
		margin: var(--ui-space-8) 0 0;
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	@media (prefers-reduced-motion: reduce) {
		.bar {
			transition: none;
		}
	}
</style>
