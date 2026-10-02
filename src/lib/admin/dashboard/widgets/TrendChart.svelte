<script lang="ts">
	import { formatFigure, formatTick, niceMax } from '../format';
	import type { MetricFormat } from '../metrics';
	import type { Series } from '../store.svelte';

	/**
	 * Columns for the current period, a dashed line for the previous one. Plain
	 * SVG sized to its container: one y-axis, recessive grid, a hover/keyboard
	 * tooltip per column, and a visually hidden table for screen readers.
	 */
	let {
		series,
		format,
		label,
		currency = 'EUR',
		height = 240
	}: { series: Series; format: MetricFormat; label: string; currency?: string; height?: number } =
		$props();

	const PAD = { top: 12, right: 4, bottom: 26, left: 48 };
	const GAP = 2;

	let width = $state(0);
	let active = $state<number | null>(null);

	let n = $derived(series.current.length);
	let plotW = $derived(Math.max(0, width - PAD.left - PAD.right));
	let plotH = $derived(height - PAD.top - PAD.bottom);
	let band = $derived(n ? plotW / n : 0);
	let barW = $derived(Math.max(1, Math.min(band - GAP, 28)));

	let scale = $derived.by(() => {
		const { max, step } = niceMax(Math.max(...series.current, ...series.previous, 0));
		// Counts get whole-number gridlines.
		if (format === 'count' && step < 1) return { max: Math.max(4, Math.ceil(max)), step: 1 };
		return { max, step };
	});
	let ticks = $derived(
		Array.from({ length: Math.floor(scale.max / scale.step) + 1 }, (_, i) => i * scale.step)
	);

	const y = (value: number) => PAD.top + plotH - (value / scale.max) * plotH;
	const cx = (i: number) => PAD.left + band * i + band / 2;

	/** Column with a 4px rounded data end, anchored to the baseline. */
	function column(i: number, value: number): string {
		const h = PAD.top + plotH - y(value);
		if (h <= 0) return '';
		const x = cx(i) - barW / 2;
		const top = y(value);
		const r = Math.min(4, barW / 2, h);
		const base = PAD.top + plotH;
		return `M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${base} Z`;
	}

	let previousLine = $derived(
		series.previous.length > 1
			? series.previous.map((v, i) => `${i ? 'L' : 'M'}${cx(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
			: ''
	);

	/** Thin the axis labels so they never collide (~64px each). */
	let labelEvery = $derived(Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 64)))));

	function pointerAt(event: PointerEvent) {
		const rect = (event.currentTarget as SVGElement).getBoundingClientRect();
		const i = Math.floor((event.clientX - rect.left - PAD.left) / band);
		active = i >= 0 && i < n ? i : null;
	}

	function onkeydown(event: KeyboardEvent) {
		if (!n) return;
		if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
			event.preventDefault();
			const step = event.key === 'ArrowRight' ? 1 : -1;
			active = active == null ? (step > 0 ? 0 : n - 1) : Math.min(n - 1, Math.max(0, active + step));
		} else if (event.key === 'Escape') {
			active = null;
		}
	}

	let tip = $derived.by(() => {
		if (active == null || !series.buckets[active]) return null;
		const current = series.current[active];
		const previous = series.previous[active];
		const change = previous ? ((current - previous) / previous) * 100 : null;
		const left = Math.min(Math.max(cx(active), 90), width - 90);
		return { bucket: series.buckets[active], current, previous, change, left };
	});

	const fmt = (v: number) => formatFigure(format, v, currency);
</script>

<figure class="chart" bind:clientWidth={width} style:height="{height}px">
	{#if width > 0}
		<!-- Pointer and arrow keys only move the tooltip; the hidden table carries the data. -->
		<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
		<svg
			{width}
			{height}
			role="img"
			aria-label={`${label}: ${fmt(series.total)} this period, ${fmt(series.previousTotal)} the period before. Use the arrow keys to read each column.`}
			tabindex="0"
			onpointermove={pointerAt}
			onpointerleave={() => (active = null)}
			onblur={() => (active = null)}
			{onkeydown}
		>
			<g class="grid">
				{#each ticks as tick (tick)}
					<line x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} />
					<text x={PAD.left - 8} y={y(tick)} dy="0.32em" text-anchor="end">
						{formatTick(format, tick, currency)}
					</text>
				{/each}
			</g>

			{#if active != null}
				<rect class="hover" x={PAD.left + band * active} y={PAD.top} width={band} height={plotH} />
			{/if}

			<g class="columns" data-active={active != null || undefined}>
				{#each series.current as value, i (series.buckets[i].start.getTime())}
					<path d={column(i, value)} class:on={active === i} />
				{/each}
			</g>

			{#if previousLine}<path class="previous" d={previousLine} />{/if}

			<g class="x">
				{#each series.buckets as bucket, i (bucket.start.getTime())}
					{#if (n - 1 - i) % labelEvery === 0}
						<text x={cx(i)} y={height - 8} text-anchor="middle">{bucket.label}</text>
					{/if}
				{/each}
			</g>
		</svg>

		{#if tip}
			<div class="tip" style:left="{tip.left}px" role="status">
				<strong>{tip.bucket.title}</strong>
				<span class="row"><i class="swatch current"></i>{fmt(tip.current)}</span>
				<span class="row muted">
					<i class="swatch previous"></i>{fmt(tip.previous)} before
					{#if tip.change != null}· {tip.change >= 0 ? '+' : '−'}{Math.abs(tip.change).toFixed(0)}%{/if}
				</span>
			</div>
		{/if}
	{/if}

	<table class="sr-only">
		<caption>{label}</caption>
		<thead><tr><th>Period</th><th>Current</th><th>Previous</th></tr></thead>
		<tbody>
			{#each series.buckets as bucket, i (bucket.start.getTime())}
				<tr><td>{bucket.title}</td><td>{fmt(series.current[i])}</td><td>{fmt(series.previous[i] ?? 0)}</td></tr>
			{/each}
		</tbody>
	</table>
</figure>

<style>
	.chart {
		position: relative;
		margin: 0;
		width: 100%;
	}
	svg {
		display: block;
		overflow: visible;
		outline: none;
		touch-action: pan-y;
	}
	svg:focus-visible {
		outline: 2px solid var(--ui-accent-ring);
		outline-offset: 4px;
		border-radius: var(--ui-radius-sm);
	}
	.grid line {
		stroke: var(--ui-border-subtle);
		stroke-width: 1;
		shape-rendering: crispEdges;
	}
	text {
		font: var(--ui-text-2xs) var(--ui-font-sans);
		fill: var(--ui-fg-subtle);
		font-variant-numeric: tabular-nums;
	}
	.hover {
		fill: var(--ui-bg-hover);
	}
	.columns path {
		fill: var(--ui-accent-solid);
		transition:
			d var(--ui-duration-normal) var(--ui-ease-out),
			opacity var(--ui-duration-fast);
	}
	.columns[data-active] path:not(.on) {
		opacity: 0.55;
	}
	.previous {
		fill: none;
		stroke: var(--ui-fg-faint);
		stroke-width: 2;
		stroke-dasharray: 4 4;
		stroke-linejoin: round;
		pointer-events: none;
	}
	.tip {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
		display: grid;
		gap: 2px;
		min-width: 9rem;
		padding: var(--ui-space-4) var(--ui-space-5);
		background: var(--ui-bg-raised);
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-md);
		box-shadow: var(--ui-shadow-md);
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-default);
		pointer-events: none;
		white-space: nowrap;
	}
	.row {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-3);
		font-variant-numeric: tabular-nums;
	}
	.muted {
		color: var(--ui-fg-muted);
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
		height: 0;
		border-top: 2px dashed var(--ui-fg-faint);
		border-radius: 0;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.columns path {
			transition: none;
		}
	}
</style>
