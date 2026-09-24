<script lang="ts">
	import type { Snippet } from 'svelte';
	import ProtectImages from '$lib/components/ui/ProtectImages.svelte';
	import Navbar from './Navbar.svelte';
	import Footer from './Footer.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<ProtectImages />
<a class="skip-link" href="#main">Skip to content</a>
<Navbar />

{@render children()}

<Footer />
