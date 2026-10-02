<script lang="ts">
	import { Card, Progress, Sparkline, Stat, Trend } from '@nostospt/ui';
	import { invoices } from '$lib/admin/invoices/store.svelte';
	import { settings } from '$lib/admin/settings/store.svelte';
	import { pluralize } from '$lib/admin/shared/format';
	import { formatFigure } from '../format';
	import { kpis } from '../metrics';
	import { ranges } from '../ranges';
	import { dashboard } from '../store.svelte';

	/** The configured KPI row, minus what the role can't see. Reflows 1–4+ columns. */
	let tiles = $derived(
		dashboard.config.kpis
			.filter((id) => dashboard.allows(kpis[id].area))
			.map((id) => ({ id, definition: kpis[id], value: dashboard.kpi(id) }))
	);

	let goal = $derived(dashboard.config.revenueGoalCents);
	let monthRevenue = $derived(goal ? dashboard.monthToDate('revenue') : 0);

	const currency = $derived(settings.studio.currency);
	const points = (value: number) => `${Math.abs(value).toFixed(1)} pts`;
</script>

{#if tiles.length}
	<div class="tiles">
		{#each tiles as { id, definition, value } (id)}
			<Card padding="md">
				<Stat
					label={definition.label}
					value={formatFigure(definition.format, value.value, currency)}
					hint={definition.description}
				>
					{#snippet trend()}
						{#if value.change != null}
							<Trend value={value.change} size="sm" format={id === 'conversion' ? points : undefined} />
						{/if}
					{/snippet}
					{#if id === 'revenue' && goal}
						<Progress value={monthRevenue} max={goal} size="sm" label="Monthly goal" />
						<span class="note">
							{formatFigure('money', monthRevenue, currency)} of {formatFigure('money', goal, currency)} this month
						</span>
					{:else if value.spark.length > 1}
						<Sparkline values={value.spark} height={32} label={`${definition.label}, ${ranges[dashboard.range].label}`} />
					{:else if id === 'outstanding'}
						<span class="note" class:warn={invoices.overdue.length > 0}>
							{invoices.overdue.length ? `${pluralize(invoices.overdue.length, 'invoice')} overdue` : 'Nothing overdue'}
						</span>
					{:else}
						<span class="note">{ranges[dashboard.range].label}</span>
					{/if}
				</Stat>
			</Card>
		{/each}
	</div>
{/if}

<style>
	.tiles {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
		gap: var(--dash-gap);
	}
	.note {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.note.warn {
		color: var(--ui-warning-text);
	}
</style>
