<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * Archival metadata line (TYPOGRAPHY.md › Archive / Metadata): Raleway,
	 * uppercase, tracked, small. Used for Photo IDs, dates and eyebrows.
	 */
	let {
		as = 'p',
		tone = 'subtle',
		children
	}: { as?: 'p' | 'span' | 'div'; tone?: 'subtle' | 'accent' | 'default'; children: Snippet } =
		$props();
</script>

<svelte:element this={as} class="kicker" data-tone={tone}>
	{@render children()}
</svelte:element>

<style>
	.kicker {
		margin: 0;
		font: var(--ui-weight-medium) var(--ui-text-2xs) / 1.2 var(--ui-font-sans);
		letter-spacing: var(--nostos-kicker-tracking);
		text-transform: uppercase;
		color: var(--ui-fg-subtle);
	}
	.kicker[data-tone='accent'] {
		color: var(--ui-accent-text);
	}
	.kicker[data-tone='default'] {
		color: var(--ui-fg-default);
	}
</style>
