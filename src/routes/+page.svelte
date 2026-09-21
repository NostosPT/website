<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import Gallery from '$lib/components/sections/Gallery.svelte';
	import QuoteSection from '$lib/components/sections/QuoteSection.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Footer from '$lib/components/layout/Footer.svelte';
</script>

<svelte:head>
	<title>Nostos — Photography Studio</title>
	<meta
		name="description"
		content="Nostos — photography studio and street photography brand. Quiet frames from the city, and the long way home. Lisbon."
	/>
	<meta property="og:title" content="Nostos — Photography Studio" />
	<meta
		property="og:description"
		content="Quiet frames from the city, and the long way home. Film, darkroom prints, Lisbon."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

<Navbar links={[]} />

<Hero photo="/images/hero.jpg" />

<main id="main" class="post-hero" aria-label="Content">
	<Gallery />
	<QuoteSection />
</main>

<Footer />

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	.post-hero {
		display: block;
		background: var(--paper);
	}
</style>
