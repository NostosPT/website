<script lang="ts">
	import { Card, CardBody, CardHeader, EmptyState, Select, Trend } from '@nostospt/ui';
	import { settings } from '$lib/admin/settings/store.svelte';
	import { METRIC_IDS } from '../config';
	import { formatFigure } from '../format';
	import { metrics } from '../metrics';
	import { ranges } from '../ranges';
	import { dashboard } from '../store.svelte';
	import TrendChart from './TrendChart.svelte';

	let compact = $derived(dashboard.config.density === 'compact');

	let options = $derived(
		METRIC_IDS.filter((id) => dashboard.allows(metrics[id].area)).map((id) => ({
			value: id,
			label: metrics[id].label
		}))
	);

	// Fall back to the first metric the role may see.
	$effect(() => {
		if (options.length && !options.some((o) => o.value === dashboard.metric)) {
			dashboard.metric = options[0].value;
		}
	});

	let metric = $derived(metrics[dashboard.metric]);
	let series = $derived(dashboard.series(dashboard.metric));
</script>

<Card>
	<CardHeader title="Trends" description={`${metric.description} ${ranges[dashboard.range].label}.`}>
		{#snippet actions()}
			<Select bind:value={dashboard.metric} {options} size="sm" aria-label="Metric" />
		{/snippet}
	</CardHeader>
	<CardBody>
		{#if series.available}
			<div class="summary">
				<div class="figure">
					<span class="total">{formatFigure(metric.format, series.total, settings.studio.currency)}</span>
					{#if series.change != null}
						<Trend value={series.change} size="sm" />
					{/if}
				</div>
				<ul class="legend" aria-label="Legend">
					<li><i class="swatch current"></i>This period</li>
					<li><i class="swatch previous"></i>Previous period</li>
				</ul>
			</div>
			<TrendChart
				{series}
				format={metric.format}
				label={metric.label}
				currency={settings.studio.currency}
				height={compact ? 190 : 240}
			/>
		{:else}
			<EmptyState
				icon="bar-chart"
				size="sm"
				title="No history yet"
				description={`The API keeps a running total for ${metric.unit}, not a daily record.`}
			/>
		{/if}
	</CardBody>
</Card>

<style>
	.summary {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--ui-space-6);
		margin-bottom: var(--ui-space-8);
	}
	.figure {
		display: flex;
		align-items: baseline;
		gap: var(--ui-space-5);
	}
	.total {
		font: 400 var(--ui-text-3xl) / 1 var(--ui-font-serif);
		letter-spacing: -0.02em;
		font-variant-numeric: lining-nums tabular-nums;
	}
	.legend {
		display: flex;
		gap: var(--ui-space-8);
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-muted);
	}
	.legend li {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-3);
	}
	.swatch {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}
	.swatch.current {
		background: var(--ui-accent-solid);
	}
	.swatch.previous {
		width: 14px;
		height: 0;
		border-top: 2px dashed var(--ui-fg-faint);
		border-radius: 0;
	}
</style>
