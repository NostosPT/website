<script lang="ts">
	let { children, as = 'p' }: { children: import('svelte').Snippet; as?: 'p' | 'span' | 'div' } =
		$props();
</script>

<svelte:element this={as} class="kicker">
	{@render children()}
</svelte:element>

<style>
	.kicker {
		font: 500 0.62rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
</style>
