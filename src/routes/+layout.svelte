<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	// Shared by the public site, (site), and the studio dashboard, /admin.
	// Each group owns its own chrome and metadata.
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
</svelte:head>

{@render children()}
