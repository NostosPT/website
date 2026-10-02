<script lang="ts">
	import { Badge, SegmentedControl, Tooltip } from '@nostospt/ui';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { session } from '$lib/admin/auth/session.svelte';
	import { RANGE_KEYS, type RangeKey } from '$lib/admin/dashboard/config';
	import { ranges } from '$lib/admin/dashboard/ranges';
	import { dashboard } from '$lib/admin/dashboard/store.svelte';
	import { widgets } from '$lib/admin/dashboard/widgets';
	import { formatLongDate } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	const config = dashboard.config;

	// `?range=` wins over the configured default, so a view can be linked.
	$effect(() => {
		const range = page.url.searchParams.get('range');
		if (range && (RANGE_KEYS as string[]).includes(range)) dashboard.range = range as RangeKey;
	});

	$effect(() => dashboard.start());

	function setRange(range: RangeKey) {
		dashboard.range = range;
		const url = new URL(page.url);
		url.searchParams.set('range', range);
		void goto(url, { replaceState: true, keepFocus: true, noScroll: true });
	}

	let board = $derived(config.widgets.filter((id) => widgets[id].visible()));

	const hour = new Date().getHours();
	const greeting = hour < 5 ? 'Good evening' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
	let firstName = $derived(session.user?.name.split(' ')[0]);
</script>

<PageHeader
	kicker={formatLongDate(new Date())}
	title={firstName ? `${greeting}, ${firstName}` : greeting}
	description="The studio at a glance: what came in, what is waiting, and what is next."
>
	{#snippet meta()}
		{#if dashboard.mock}
			<Tooltip content="History and live events are generated (PUBLIC_DASHBOARD_SOURCE=mock). Lists come from the loaded records.">
				<Badge tone="warning" variant="outline" icon="info">Sample data</Badge>
			</Tooltip>
		{/if}
		{#if dashboard.simulating && !dashboard.paused}
			<span class="live"><i></i>Live</span>
		{/if}
	{/snippet}
	{#snippet actions()}
		<SegmentedControl
			value={dashboard.range}
			onchange={setRange}
			size="sm"
			ariaLabel="Period"
			items={RANGE_KEYS.map((key) => ({ value: key, label: ranges[key].short }))}
		/>
	{/snippet}
</PageHeader>

<div class="board" data-density={config.density}>
	<div class="grid">
		{#each board as id (id)}
			{@const widget = widgets[id]}
			<div class="cell" style:--lg={widget.span.lg} style:--md={widget.span.md}>
				<widget.component />
			</div>
		{/each}
	</div>
</div>

<style>
	.board {
		--dash-gap: var(--ui-space-12);
		container-type: inline-size;
	}
	.board[data-density='compact'] {
		--dash-gap: var(--ui-space-8);
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-auto-flow: row dense;
		gap: var(--dash-gap);
		align-items: start;
	}
	/* Each cell is a container too, so widgets adapt to the space they get. */
	.cell {
		min-width: 0;
		container-type: inline-size;
	}
	/* Spans follow the board's own width, so a collapsed sidebar re-flows it too. */
	@container (min-width: 680px) {
		.grid {
			grid-template-columns: repeat(6, minmax(0, 1fr));
		}
		.cell {
			grid-column: span var(--md);
		}
	}
	@container (min-width: 1080px) {
		.grid {
			grid-template-columns: repeat(12, minmax(0, 1fr));
		}
		.cell {
			grid-column: span var(--lg);
		}
	}
	.live {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-3);
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-muted);
	}
	.live i {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--ui-success-solid);
		animation: pulse 2s var(--ui-ease-in-out) infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.live i {
			animation: none;
		}
	}
</style>
