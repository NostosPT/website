<script lang="ts">
	import '@nostospt/ui/styles.css';
	import '$lib/admin/theme/nostos-theme.css';
	import { Toaster } from '@nostospt/ui';
	import { theme } from '$lib/admin/theme/theme.svelte';

	let { children } = $props();

	$effect(() => theme.watchSystem());

	// Mirror the theme on <html> for the body background, scrollbars and native
	// controls; the public site never carries the attribute.
	$effect(() => {
		const root = document.documentElement;
		root.setAttribute('data-ui-theme', theme.resolved);
		root.lang = 'en';
		return () => {
			root.removeAttribute('data-ui-theme');
			root.lang = 'pt';
		};
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
	<title>Nostos Studio</title>
</svelte:head>

<div class="ui-root nostos-admin" data-ui-theme={theme.resolved}>
	{@render children()}
	<Toaster position="bottom-right" />
</div>

<style>
	.nostos-admin {
		min-height: 100dvh;
		background: var(--ui-bg-canvas);
	}
</style>
