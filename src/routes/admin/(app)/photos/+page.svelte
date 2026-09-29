<script lang="ts">
	import {
		Badge,
		Button,
		Checkbox,
		EmptyState,
		Input,
		Menu,
		MenuItem,
		MenuLabel,
		MenuSeparator,
		Modal,
		SegmentedControl,
		Select,
		Table,
		TableCell,
		TableHeaderCell,
		TableRow,
		Thumbnail,
		toast
	} from '@nostospt/ui';
	import { albums } from '$lib/admin/albums/store.svelte';
	import PhotoTile from '$lib/admin/photos/PhotoTile.svelte';
	import {
		availabilityOptions,
		availabilityStatus,
		photos,
		type PhotoFilter
	} from '$lib/admin/photos/store.svelte';
	import type { Visibility } from '$lib/admin/photos/types';
	import { formatMoney, formatRelative, photoNumber, pluralize } from '$lib/admin/shared/format';
	import { statusOf, visibilityOptions, visibilityStatus } from '$lib/admin/shared/status';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	const PAGE_SIZE = 24;

	let filter = $state<PhotoFilter>({ query: '', category: '', visibility: 'ALL', availability: 'ALL' });
	let view = $state<'grid' | 'list'>('grid');
	let shown = $state(PAGE_SIZE);
	let selected = $state<string[]>([]);
	let confirmDelete = $state(false);

	let results = $derived(photos.filter(filter));
	let visible = $derived(results.slice(0, shown));
	let allSelected = $derived(visible.length > 0 && visible.every((p) => selected.includes(p.id)));

	function toggle(id: string) {
		selected = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
	}

	function toggleAll() {
		selected = allSelected ? [] : visible.map((p) => p.id);
	}

	function setVisibility(visibility: Visibility) {
		photos.updateMany(selected, { visibility });
		toast.success(`${pluralize(selected.length, 'photo')} set to ${visibilityStatus[visibility].label.toLowerCase()}`);
		selected = [];
	}

	function addToAlbum(albumId: string) {
		albums.addPhotos(albumId, selected);
		toast.success(`Added to “${albums.get(albumId)?.title}”`);
		selected = [];
	}

	function remove() {
		const count = selected.length;
		photos.remove(selected);
		selected = [];
		confirmDelete = false;
		toast(`${pluralize(count, 'photo')} deleted`);
	}
</script>

<PageHeader
	kicker="Library"
	title="Photos"
	description="Every photograph in the archive, published or not. Photo IDs are permanent."
>
	{#snippet actions()}
		<Button href="/admin/uploads" icon="upload">Upload</Button>
	{/snippet}
</PageHeader>

<div class="filters">
	<div class="search">
		<Input bind:value={filter.query} icon="search" placeholder="Nº, title, place or tag" clearable />
	</div>
	<div class="select">
		<Select
			bind:value={filter.category}
			aria-label="Category"
			options={[{ value: '', label: 'All categories' }, ...photos.categories.map((c) => ({ value: c, label: c }))]}
		/>
	</div>
	<div class="select">
		<Select
			bind:value={filter.availability}
			aria-label="Availability"
			options={[{ value: 'ALL', label: 'Any availability' }, ...availabilityOptions]}
		/>
	</div>
	<SegmentedControl
		bind:value={filter.visibility}
		ariaLabel="Visibility"
		items={[{ value: 'ALL', label: 'All' }, ...visibilityOptions]}
	/>
	<SegmentedControl
		bind:value={view}
		ariaLabel="View"
		items={[
			{ value: 'grid', label: 'Grid', icon: 'grid' },
			{ value: 'list', label: 'List', icon: 'list' }
		]}
	/>
</div>

<div class="summary">
	<Checkbox
		checked={allSelected}
		indeterminate={selected.length > 0 && !allSelected}
		onchange={toggleAll}
		label={selected.length ? `${selected.length} selected` : `${pluralize(results.length, 'photo')}`}
	/>
</div>

{#if results.length === 0}
	<EmptyState
		icon="image"
		title="No photos match"
		description="Try another search or clear the filters."
		bordered
	>
		{#snippet actions()}
			<Button
				variant="outline"
				onclick={() => (filter = { query: '', category: '', visibility: 'ALL', availability: 'ALL' })}
			>
				Clear filters
			</Button>
		{/snippet}
	</EmptyState>
{:else if view === 'grid'}
	<div class="grid">
		{#each visible as photo (photo.id)}
			<PhotoTile
				{photo}
				href={`/admin/photos/${photo.id}`}
				selectable
				selected={selected.includes(photo.id)}
				ontoggle={() => toggle(photo.id)}
			/>
		{/each}
	</div>
{:else}
	<Table density="compact">
		<thead>
			<TableRow>
				<TableHeaderCell width="40px"><span class="ui-sr-only">Select</span></TableHeaderCell>
				<TableHeaderCell>Photo</TableHeaderCell>
				<TableHeaderCell>Category</TableHeaderCell>
				<TableHeaderCell>Location</TableHeaderCell>
				<TableHeaderCell>Visibility</TableHeaderCell>
				<TableHeaderCell>Availability</TableHeaderCell>
				<TableHeaderCell numeric>Price</TableHeaderCell>
				<TableHeaderCell>Updated</TableHeaderCell>
			</TableRow>
		</thead>
		<tbody>
			{#each visible as photo (photo.id)}
				{@const vis = statusOf(visibilityStatus, photo.visibility)}
				{@const avail = statusOf(availabilityStatus, photo.availability)}
				<TableRow selected={selected.includes(photo.id)}>
					<TableCell>
						<Checkbox
							checked={selected.includes(photo.id)}
							onchange={() => toggle(photo.id)}
							aria-label={`Select ${photoNumber(photo.number)}`}
						/>
					</TableCell>
					<TableCell>
						<a class="row-link" href={`/admin/photos/${photo.id}`}>
							<Thumbnail src={photo.urls?.thumbnail ?? null} alt="" size={36} />
							<span>
								<strong>{photo.title ?? 'Untitled'}</strong>
								<small>{photoNumber(photo.number)}</small>
							</span>
						</a>
					</TableCell>
					<TableCell muted>{photo.category ?? '—'}</TableCell>
					<TableCell muted truncate>{photo.location ?? '—'}</TableCell>
					<TableCell><Badge tone={vis.tone} size="sm">{vis.label}</Badge></TableCell>
					<TableCell><Badge tone={avail.tone} size="sm" variant="dot">{avail.label}</Badge></TableCell>
					<TableCell numeric>{formatMoney(photo.priceCents, photo.currency)}</TableCell>
					<TableCell muted>{formatRelative(photo.updatedAt)}</TableCell>
				</TableRow>
			{/each}
		</tbody>
	</Table>
{/if}

{#if results.length > shown}
	<div class="more">
		<Button variant="outline" onclick={() => (shown += PAGE_SIZE)}>
			Load more · {results.length - shown} left
		</Button>
	</div>
{/if}

{#if selected.length}
	<div class="bulk" role="region" aria-label="Bulk actions">
		<span class="count">{pluralize(selected.length, 'photo')} selected</span>
		<Menu placement="top-start" ariaLabel="Set visibility">
			{#snippet trigger({ toggle }: { toggle: () => void })}
				<Button size="sm" variant="secondary" trailingIcon="chevron-up" onclick={toggle}>Visibility</Button>
			{/snippet}
			{#each visibilityOptions as option (option.value)}
				<MenuItem onselect={() => setVisibility(option.value as Visibility)}>{option.label}</MenuItem>
			{/each}
		</Menu>
		<Menu placement="top-start" ariaLabel="Add to album">
			{#snippet trigger({ toggle }: { toggle: () => void })}
				<Button size="sm" variant="secondary" trailingIcon="chevron-up" onclick={toggle}>Add to album</Button>
			{/snippet}
			<MenuLabel>Albums</MenuLabel>
			{#each albums.items as album (album.id)}
				<MenuItem icon="bookmark" onselect={() => addToAlbum(album.id)}>{album.title}</MenuItem>
			{/each}
			<MenuSeparator />
			<MenuItem icon="plus" href="/admin/albums?new">New album…</MenuItem>
		</Menu>
		
		<Button size="sm" variant="soft" tone="danger" icon="trash" onclick={() => (confirmDelete = true)}>
			Delete
		</Button>
		<Button size="sm" variant="ghost" tone="neutral" iconOnly icon="x" label="Clear selection" onclick={() => (selected = [])} />
	</div>
{/if}

<Modal
	bind:open={confirmDelete}
	title={`Delete ${pluralize(selected.length, 'photo')}?`}
	description="Originals and renditions are removed from storage. Their Photo IDs are never reused."
	size="sm"
>
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button tone="danger" onclick={remove}>Delete</Button>
	{/snippet}
</Modal>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ui-space-6);
		margin-bottom: var(--ui-space-8);
	}
	.search {
		flex: 1 1 260px;
		max-width: 360px;
	}
	.select {
		width: 180px;
	}
	.summary {
		margin-bottom: var(--ui-space-8);
		color: var(--ui-fg-muted);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: var(--ui-space-12) var(--ui-space-8);
	}
	.row-link {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-6);
		color: inherit;
		text-decoration: none;
	}
	.row-link span {
		display: grid;
	}
	.row-link strong {
		font: 400 var(--ui-text-md) / 1.3 var(--ui-font-serif);
	}
	.row-link small {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.more {
		display: flex;
		justify-content: center;
		margin-top: var(--ui-space-16);
	}
	.bulk {
		position: sticky;
		bottom: var(--ui-space-8);
		z-index: var(--ui-z-sticky);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ui-space-4);
		width: fit-content;
		margin: var(--ui-space-12) auto 0;
		padding: var(--ui-space-4) var(--ui-space-4) var(--ui-space-4) var(--ui-space-8);
		background: var(--ui-bg-raised);
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-lg);
		box-shadow: var(--ui-shadow-lg);
	}
	.count {
		margin-right: var(--ui-space-4);
		font-size: var(--ui-text-sm);
		font-weight: var(--ui-weight-medium);
	}
</style>
