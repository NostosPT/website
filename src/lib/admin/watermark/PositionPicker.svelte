<script lang="ts">
	import { positions } from './store.svelte';
	import type { WatermarkPosition } from './types';

	/** 3×3 anchor grid. The kit has no equivalent, so it's built on its tokens. */
	let {
		value = $bindable('bottom-right'),
		disabled = false,
		id
	}: { value?: WatermarkPosition; disabled?: boolean; id?: string } = $props();

	function onkeydown(event: KeyboardEvent) {
		const index = positions.indexOf(value);
		const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3 }[event.key];
		if (step === undefined) return;
		event.preventDefault();
		const next = positions[index + step];
		if (next) {
			value = next;
			(event.currentTarget as HTMLElement).querySelector<HTMLElement>(`[data-pos="${next}"]`)?.focus();
		}
	}
</script>

<div class="picker" role="radiogroup" aria-label="Position" tabindex="-1" {id} {onkeydown} data-disabled={disabled || undefined}>
	{#each positions as position (position)}
		<button
			type="button"
			role="radio"
			aria-checked={value === position}
			aria-label={position.replace('-', ' ')}
			tabindex={value === position ? 0 : -1}
			data-pos={position}
			{disabled}
			onclick={() => (value = position)}
		>
			<span></span>
		</button>
	{/each}
</div>

<style>
	.picker {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px;
		width: 108px;
		padding: 4px;
		aspect-ratio: 3 / 2;
		background: var(--ui-bg-sunken);
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-md);
	}
	.picker[data-disabled] {
		opacity: 0.5;
	}
	button {
		display: grid;
		place-items: center;
		border-radius: var(--ui-radius-xs);
		cursor: pointer;
	}
	button:hover:not(:disabled) {
		background: var(--ui-bg-hover);
	}
	span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--ui-fg-faint);
	}
	button[aria-checked='true'] {
		background: var(--ui-accent-soft);
	}
	button[aria-checked='true'] span {
		width: 10px;
		height: 10px;
		background: var(--ui-accent-solid);
	}
</style>
