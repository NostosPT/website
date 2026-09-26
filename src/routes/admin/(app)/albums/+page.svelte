<script lang="ts">
	import { page } from '$app/state';
	import { Button, EmptyState, Input, SegmentedControl } from '@nostospt/ui';
	import AlbumCard from '$lib/admin/albums/AlbumCard.svelte';
	import AlbumFormDialog from '$lib/admin/albums/AlbumFormDialog.svelte';
	import { albums } from '$lib/admin/albums/store.svelte';
	import { visibilityOptions } from '$lib/admin/shared/status';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let creating = $state(page.url.searchParams.has('new'));
	let query = $state('');
	let visibility = $state('ALL');

	let results = $derived(
		albums.items
			.filter((a) => visibility === 'ALL' || a.visibility === visibility)
			.filter((a) => a.title.toLowerCase().includes(query.trim().toLowerCase()))
	);
</script>

<PageHeader
	kicker="Archive"
	title="Albums"
	description="Public, curated collections of the archive, in the order you set."
>
	{#snippet actions()}
		<Button icon="plus" onclick={() => (creating = true)}>New album</Button>
	{/snippet}
</PageHeader>

<div class="filters">
	<div class="search"><Input bind:value={query} icon="search" placeholder="Search albums" clearable /></div>
	<SegmentedControl bind:value={visibility} ariaLabel="Visibility" items={[{ value: 'ALL', label: 'All' }, ...visibilityOptions]} />
</div>

{#if results.length}
	<div class="grid">
		{#each results as album (album.id)}
			<AlbumCard {album} />
		{/each}
	</div>
{:else}
	<EmptyState icon="bookmark" title="No albums yet" description="Group photographs into a collection for the public archive." bordered>
		{#snippet actions()}
			<Button icon="plus" onclick={() => (creating = true)}>New album</Button>
		{/snippet}
	</EmptyState>
{/if}

<AlbumFormDialog bind:open={creating} />

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-space-6);
		margin-bottom: var(--ui-space-12);
	}
	.search {
		flex: 1 1 240px;
		max-width: 340px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--ui-space-12);
	}
</style>
