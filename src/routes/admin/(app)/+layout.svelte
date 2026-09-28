<script lang="ts">
	import { page } from '$app/state';
	import { session } from '$lib/admin/auth/session.svelte';
	import { albums } from '$lib/admin/albums/store.svelte';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { galleries } from '$lib/admin/galleries/store.svelte';
	import ComposeDialog from '$lib/admin/mail/ComposeDialog.svelte';
	import { photos } from '$lib/admin/photos/store.svelte';
	import { pipeline } from '$lib/admin/pipeline/store.svelte';
	import { services } from '$lib/admin/services/store.svelte';
	import AppSidebar from '$lib/admin/shell/AppSidebar.svelte';
	import CommandPalette from '$lib/admin/shell/CommandPalette.svelte';
	import Topbar from '$lib/admin/shell/Topbar.svelte';
	import { uploads } from '$lib/admin/uploads/queue.svelte';

	let { children } = $props();

	let collapsed = $state(false);
	let drawerOpen = $state(false);
	let paletteOpen = $state(false);
	let paletteQuery = $state('');

	function openPalette(query = '') {
		paletteQuery = query;
		paletteOpen = true;
	}

	// Close the mobile drawer after navigating.
	$effect(() => {
		void page.url.pathname;
		drawerOpen = false;
	});

	// Hydrate the staff session and core domain data once (Website API → Real
	// API). Stores fall back to local mocks when the backend is unreachable.
	$effect(() => {
		void session.restore();
		void services.load();
		void pipeline.load();
		void clients.load();
		void galleries.load();
		void albums.load();
		void photos.load();
	});
</script>

<!-- Uploads keep running across pages, but not across a reload. -->
<svelte:window
	onbeforeunload={(event) => {
		if (uploads.busy) event.preventDefault();
	}}
/>

<div class="shell" data-drawer-open={drawerOpen || undefined}>
	<div class="nav">
		<AppSidebar bind:collapsed onsearch={openPalette} />
	</div>
	<button
		class="scrim"
		type="button"
		aria-label="Close navigation"
		tabindex="-1"
		onclick={() => (drawerOpen = false)}
	></button>

	<div class="main">
		<Topbar onmenu={() => (drawerOpen = true)} onsearch={() => openPalette()} />
		<main id="main" class="content">
			{@render children()}
		</main>
	</div>
</div>

<CommandPalette bind:open={paletteOpen} bind:query={paletteQuery} />
<ComposeDialog />

<style>
	.shell {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		min-height: 100dvh;
	}
	/* Sticky here, on our own element: the kit's scoped sidebar styles outrank overrides. */
	.nav {
		position: sticky;
		top: 0;
		align-self: start;
		height: 100dvh;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.main {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.content {
		flex: 1;
		width: 100%;
		max-width: 1440px;
		margin: 0 auto;
		padding: clamp(1.5rem, 3vw, 2.75rem) clamp(1rem, 3vw, 2.5rem) 4rem;
	}
	.scrim {
		display: none;
	}

	/* Below 900px the sidebar becomes a drawer over the content. */
	@media (max-width: 900px) {
		.shell {
			grid-template-columns: minmax(0, 1fr);
		}
		.nav {
			position: fixed;
			height: auto;
			inset: 0 auto 0 0;
			z-index: var(--ui-z-overlay);
			transform: translateX(-100%);
			transition: transform var(--ui-duration-normal) var(--ui-ease-out);
			box-shadow: var(--ui-shadow-xl);
		}
		.shell[data-drawer-open] .nav {
			transform: none;
		}
		.shell[data-drawer-open] .scrim {
			display: block;
			position: fixed;
			inset: 0;
			z-index: calc(var(--ui-z-overlay) - 1);
			background: var(--ui-bg-overlay);
			border: 0;
		}
	}
</style>
