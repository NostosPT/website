<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import Gallery from '$lib/components/sections/Gallery.svelte';
	import QuoteSection from '$lib/components/sections/QuoteSection.svelte';
</script>

<Hero photo="/images/hero.jpg" />

<main id="main" class="post-hero" aria-label="Content">
	<Gallery />
	<QuoteSection />
</main>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	.post-hero {
		display: block;
		background: var(--paper);
	}
</style>
