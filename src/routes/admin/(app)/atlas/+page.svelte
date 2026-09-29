<script lang="ts">
	import { page } from '$app/state';
	import { Button, Card, EmptyState, Input, SegmentedControl } from '@nostospt/ui';
	import AtlasFormDialog from '$lib/admin/atlas/AtlasFormDialog.svelte';
	import { atlas } from '$lib/admin/atlas/store.svelte';
	import type { AtlasLocationStatus } from '$lib/admin/atlas/types';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let creating = $state(page.url.searchParams.has('new'));
	let query = $state('');
	let status = $state<AtlasLocationStatus | 'ALL'>('ALL');

	const statusItems = [
		{ value: 'ALL', label: 'All' },
		{ value: 'DRAFT', label: 'Draft' },
		{ value: 'PUBLISHED', label: 'Published' },
		{ value: 'ARCHIVED', label: 'Archived' }
	];

	let results = $derived(
		atlas.items
			.filter((l) => status === 'ALL' || l.status === status)
			.filter((l) => l.name.toLowerCase().includes(query.trim().toLowerCase()))
	);
</script>

<PageHeader
	kicker="Field"
	title="Atlas"
	description="Scouting locations for photographic field work. The interactive map lands here."
>
	{#snippet actions()}
		<Button icon="plus" onclick={() => (creating = true)}>New location</Button>
	{/snippet}
</PageHeader>

<div class="filters">
	<div class="search"><Input bind:value={query} icon="search" placeholder="Search locations" clearable /></div>
	<SegmentedControl bind:value={status} ariaLabel="Location status" items={statusItems} />
</div>

{#if results.length}
	<div class="grid">
		{#each results as location (location.id)}
			<a class="card-link" href={`/admin/atlas/${location.id}`}>
				<Card padding="lg">
					<div class="location">
						<span class="kind">{location.geometryKind === 'AREA' ? 'Area' : 'Point'}</span>
						<h2>{location.name}</h2>
						{#if location.city || location.country}
							<p>{[location.city, location.country].filter(Boolean).join(', ')}</p>
						{/if}
						{#if location.description}<p class="desc">{location.description}</p>{/if}
						<span class="meta">{location.status.toLowerCase()}</span>
					</div>
				</Card>
			</a>
		{/each}
	</div>
{:else}
	<EmptyState icon="globe" title="No locations yet" description="Scout the first field location for the photographic atlas." bordered>
		{#snippet actions()}
			<Button icon="plus" onclick={() => (creating = true)}>New location</Button>
		{/snippet}
	</EmptyState>
{/if}

<AtlasFormDialog bind:open={creating} />

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
	.card-link {
		color: inherit;
		text-decoration: none;
	}
	.location {
		display: grid;
		gap: 0.35rem;
	}
	.location h2 {
		margin: 0;
	}
	.location p {
		margin: 0;
	}
	.kind,
	.meta {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	.desc {
		color: var(--ui-fg-muted);
	}
</style>
