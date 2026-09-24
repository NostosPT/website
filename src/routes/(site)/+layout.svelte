<script lang="ts">
	import { metadata } from '$lib/metadata';
	import SiteChrome from '$lib/components/layout/SiteChrome.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>{metadata.title}</title>
	<meta name="description" content={metadata.description} />
	<meta name="keywords" content={metadata.keywords.join(', ')} />
	<meta name="author" content={metadata.authors[0].name} />
	<meta name="creator" content={metadata.creator} />
	<link rel="canonical" href={new URL(metadata.alternates.canonical, metadata.metadataBase).toString()} />

	<!-- Open Graph -->
	<meta property="og:title" content={metadata.openGraph.title} />
	<meta property="og:description" content={metadata.openGraph.description} />
	<meta property="og:url" content={metadata.openGraph.url} />
	<meta property="og:site_name" content={metadata.openGraph.siteName} />
	<meta property="og:locale" content={metadata.openGraph.locale} />
	<meta property="og:type" content={metadata.openGraph.type} />
	{#each metadata.openGraph.images as img (img.url)}
		<meta property="og:image" content={new URL(img.url, metadata.metadataBase).toString()} />
		<meta property="og:image:width" content={String(img.width)} />
		<meta property="og:image:height" content={String(img.height)} />
		<meta property="og:image:alt" content={img.alt} />
	{/each}

	<!-- Twitter -->
	<meta name="twitter:card" content={metadata.twitter.card} />
	<meta name="twitter:title" content={metadata.twitter.title} />
	<meta name="twitter:description" content={metadata.twitter.description} />
	{#each metadata.twitter.images as img (img)}
		<meta name="twitter:image" content={new URL(img, metadata.metadataBase).toString()} />
	{/each}
</svelte:head>

<SiteChrome>
	{@render children()}
</SiteChrome>
