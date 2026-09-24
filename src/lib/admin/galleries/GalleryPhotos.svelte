<script lang="ts">
	import { Button, EmptyState, Icon, SegmentedControl, toast } from '@nostospt/ui';
	import PhotoPicker from '$lib/admin/photos/PhotoPicker.svelte';
	import PhotoTile from '$lib/admin/photos/PhotoTile.svelte';
	import { photos } from '$lib/admin/photos/store.svelte';
	import { pluralize } from '$lib/admin/shared/format';
	import { galleries } from './store.svelte';
	import type { Gallery } from './types';

	let { gallery }: { gallery: Gallery } = $props();

	let show = $state<'all' | 'favourites'>('all');
	let picking = $state(false);

	let favourites = $derived(gallery.photos.filter((p) => p.selected));
	let entries = $derived(show === 'favourites' ? favourites : gallery.photos);

	/** File names of the client's picks, ready to paste into a Lightroom filter. */
	async function copySelection() {
		const names = photos.many(favourites.map((f) => f.photoId)).map((p) => p.originalKey.split('/').pop());
		await navigator.clipboard.writeText(names.join(', '));
		toast.success(`${pluralize(names.length, 'file name')} copied`, { description: 'Paste into a Lightroom text filter.' });
	}
</script>

<div class="toolbar">
	<SegmentedControl
		bind:value={show}
		ariaLabel="Show"
		items={[
			{ value: 'all', label: `All · ${gallery.photos.length}` },
			{ value: 'favourites', label: `Favourites · ${favourites.length}`, icon: 'heart' }
		]}
	/>
	<div class="actions">
		<Button variant="outline" icon="copy" disabled={!favourites.length} onclick={copySelection}>Copy selection</Button>
		<Button icon="plus" onclick={() => (picking = true)}>Add photos</Button>
	</div>
</div>

{#if gallery.selectionSubmittedAt}
	<p class="note"><Icon name="check-circle" size={14} /> The client submitted their selection.</p>
{/if}

{#if entries.length}
	<ul class="grid">
		{#each entries as entry (entry.photoId)}
			{@const photo = photos.get(entry.photoId)}
			{#if photo}
				<li>
					<PhotoTile {photo} href={`/admin/photos/${photo.id}`} dimmed={show === 'all' && favourites.length > 0 && !entry.selected} />
					{#if entry.selected}
						<span class="heart" title="Client favourite"><Icon name="heart" size={14} filled /></span>
					{/if}
					<span class="remove">
						<Button size="xs" variant="secondary" iconOnly icon="x" label="Remove from gallery" onclick={() => galleries.removePhoto(gallery.id, photo.id)} />
					</span>
				</li>
			{/if}
		{/each}
	</ul>
{:else}
	<EmptyState
		icon={show === 'favourites' ? 'heart' : 'image'}
		title={show === 'favourites' ? 'No favourites yet' : 'No photos in this gallery'}
		description={show === 'favourites' ? 'Favourites appear here as the client chooses.' : 'Upload straight into this gallery, or add from the archive.'}
		bordered
	>
		{#snippet actions()}
			{#if show === 'all'}
				<Button href="/admin/uploads" variant="outline" icon="upload">Upload</Button>
				<Button icon="plus" onclick={() => (picking = true)}>Add from archive</Button>
			{/if}
		{/snippet}
	</EmptyState>
{/if}

<PhotoPicker
	bind:open={picking}
	title={`Add to “${gallery.title}”`}
	exclude={gallery.photos.map((p) => p.photoId)}
	onconfirm={(ids) => {
		galleries.addPhotos(gallery.id, ids);
		toast.success(`${pluralize(ids.length, 'photo')} added`);
	}}
/>

<style>
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--ui-space-6);
		margin-bottom: var(--ui-space-10);
	}
	.actions {
		display: flex;
		gap: var(--ui-space-4);
	}
	.note {
		display: flex;
		align-items: center;
		gap: var(--ui-space-3);
		margin: 0 0 var(--ui-space-10);
		font-size: var(--ui-text-sm);
		color: var(--ui-success-text);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		gap: var(--ui-space-12) var(--ui-space-8);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		position: relative;
	}
	.heart {
		position: absolute;
		top: var(--ui-space-4);
		left: var(--ui-space-4);
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--ui-bg-surface);
		color: var(--ui-danger-solid);
		box-shadow: var(--ui-shadow-sm);
	}
	.remove {
		position: absolute;
		top: var(--ui-space-4);
		right: var(--ui-space-4);
		opacity: 0;
		transition: opacity var(--ui-duration-fast) var(--ui-ease-out);
	}
	li:hover .remove,
	li:focus-within .remove {
		opacity: 1;
	}
</style>
