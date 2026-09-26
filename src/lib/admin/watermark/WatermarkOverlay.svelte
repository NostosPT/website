<script lang="ts">
	import { renderLine } from './store.svelte';
	import type { WatermarkPosition, WatermarkPreset } from './types';

	/**
	 * CSS preview of a watermark spec. Place it inside a `position: relative`
	 * frame; sizes are relative to the frame width, as in the rendition worker.
	 */
	let {
		preset,
		number,
		photographer
	}: { preset: WatermarkPreset; number?: number; photographer?: string } = $props();

	let lines = $derived(preset.lines.map((line) => renderLine(line, { number, photographer })));

	const flex: Record<WatermarkPosition, [string, string, string]> = {
		'top-left': ['flex-start', 'flex-start', 'left'],
		top: ['flex-start', 'center', 'center'],
		'top-right': ['flex-start', 'flex-end', 'right'],
		left: ['center', 'flex-start', 'left'],
		center: ['center', 'center', 'center'],
		right: ['center', 'flex-end', 'right'],
		'bottom-left': ['flex-end', 'flex-start', 'left'],
		bottom: ['flex-end', 'center', 'center'],
		'bottom-right': ['flex-end', 'flex-end', 'right']
	};
	let [alignItems, justifyContent, textAlign] = $derived(flex[preset.position]);
</script>

<div
	class="watermark"
	data-tone={preset.tone}
	data-font={preset.font}
	style:--wm-size={preset.size}
	style:--wm-margin={preset.margin}
	style:opacity={preset.opacity / 100}
	style:align-items={alignItems}
	style:justify-content={justifyContent}
	aria-hidden="true"
>
	{#if preset.tiled}
		<div class="tiles">
			{#each { length: 28 } as _, i (i)}
				<span>{lines.join(' · ')}</span>
			{/each}
		</div>
	{:else if preset.kind === 'image' && preset.imageUrl}
		<img class="logo" src={preset.imageUrl} alt="" />
	{:else}
		<div class="stack" style:text-align={textAlign}>
			{#each lines as line, i (i)}
				<span>{line}</span>
			{/each}
		</div>
	{/if}
</div>

<style>
	.watermark {
		position: absolute;
		inset: 0;
		display: flex;
		overflow: hidden;
		padding: calc(var(--wm-margin) * 1%);
		pointer-events: none;
		container-type: inline-size;
		color: #fcfcfc;
		text-shadow: 0 0 0.6em rgb(6 6 6 / 0.25);
	}
	.watermark[data-tone='dark'] {
		color: #060606;
		text-shadow: 0 0 0.6em rgb(252 252 252 / 0.25);
	}
	.stack {
		display: grid;
		gap: 0.2em;
		font: 500 calc(var(--wm-size) * 1cqw) / 1 'Raleway', sans-serif;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}
	.watermark[data-font='serif'] .stack {
		font-family: 'Lora', serif;
		font-weight: 400;
		letter-spacing: -0.01em;
		text-transform: none;
	}
	.tiles {
		position: absolute;
		inset: -40%;
		display: grid;
		grid-template-columns: repeat(4, max-content);
		justify-content: space-around;
		align-content: space-around;
		gap: 6cqw 4cqw;
		transform: rotate(-24deg);
		font: 500 calc(var(--wm-size) * 1cqw) / 1 'Raleway', sans-serif;
		letter-spacing: 0.22em;
		white-space: nowrap;
	}
	.logo {
		width: calc(var(--wm-size) * 5cqw);
		height: auto;
	}
</style>
