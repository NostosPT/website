<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Button,
		Card,
		CardBody,
		CardHeader,
		EmptyState,
		Field,
		Input,
		Modal,
		SegmentedControl,
		Textarea,
		toast
	} from '@nostospt/ui';
	import SortablePhotoGrid from '$lib/admin/albums/SortablePhotoGrid.svelte';
	import { albums } from '$lib/admin/albums/store.svelte';
	import PhotoPicker from '$lib/admin/photos/PhotoPicker.svelte';
	import { formatDate, pluralize, slugify } from '$lib/admin/shared/format';
	import { visibilityOptions } from '$lib/admin/shared/status';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let { data } = $props();
	let album = $derived(data.album);

	let picking = $state(false);
	let confirmDelete = $state(false);

	function remove() {
		albums.remove(album.id);
		toast(`“${album.title}” deleted`, { description: 'Its photos stay in the archive.' });
		goto('/admin/albums');
	}
</script>

<PageHeader
	kicker={`Album · ${pluralize(album.photoIds.length, 'photo')}`}
	title={album.title}
	back={{ href: '/admin/albums', label: 'Albums' }}
	detail
>
	{#snippet actions()}
		<Button
			variant="outline"
			icon="external-link"
			href={`/archive/albums/${album.slug}`}
			target="_blank"
			rel="noopener noreferrer"
			disabled={album.visibility === 'PRIVATE'}
		>
			View on site
		</Button>
		<Button icon="plus" onclick={() => (picking = true)}>Add photos</Button>
	{/snippet}
</PageHeader>

<div class="layout">
	<section>
		{#if album.photoIds.length}
			<p class="hint">Drag to reorder. The public album follows this order.</p>
			<SortablePhotoGrid
				photoIds={album.photoIds}
				coverId={album.coverPhotoId}
				onreorder={(from, to) => albums.reorder(album.id, from, to)}
				onremove={(photoId) => albums.removePhoto(album.id, photoId)}
				oncover={(photoId) => {
					albums.update(album.id, { coverPhotoId: photoId });
					toast.success('Cover updated');
				}}
			/>
		{:else}
			<EmptyState icon="image" title="This album is empty" description="Add photographs from the archive." bordered>
				{#snippet actions()}
					<Button icon="plus" onclick={() => (picking = true)}>Add photos</Button>
				{/snippet}
			</EmptyState>
		{/if}
	</section>

	<aside>
		<Card>
			<CardHeader title="Album" divided />
			<CardBody>
				<div class="stack">
					<Field label="Title">
						{#snippet control({ id }: { id: string })}
							<Input {id} value={album.title} onchange={(e: Event) => albums.update(album.id, { title: (e.currentTarget as HTMLInputElement).value })} />
						{/snippet}
					</Field>
					<Field label="Address" hint="Changing it breaks old links.">
						{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
							<Input
								{id}
								prefix="/albums/"
								value={album.slug}
								aria-describedby={describedBy}
								onchange={(e: Event) => albums.update(album.id, { slug: slugify((e.currentTarget as HTMLInputElement).value) })}
							/>
						{/snippet}
					</Field>
					<Field label="Description" optional>
						{#snippet control({ id }: { id: string })}
							<Textarea
								{id}
								value={album.description ?? ''}
								rows={3}
								autogrow
								onchange={(e: Event) => albums.update(album.id, { description: (e.currentTarget as HTMLTextAreaElement).value || null })}
							/>
						{/snippet}
					</Field>
					<Field label="Visibility" hint={album.publishedAt ? `Published ${formatDate(album.publishedAt)}` : 'Not published yet'}>
						{#snippet control()}
							<SegmentedControl
								value={album.visibility}
								items={visibilityOptions}
								block
								ariaLabel="Visibility"
								onchange={(visibility: typeof album.visibility) => albums.update(album.id, { visibility })}
							/>
						{/snippet}
					</Field>
				</div>
			</CardBody>
		</Card>
		<Button variant="ghost" tone="danger" icon="trash" onclick={() => (confirmDelete = true)}>Delete album</Button>
	</aside>
</div>

<PhotoPicker
	bind:open={picking}
	title={`Add to “${album.title}”`}
	exclude={album.photoIds}
	onconfirm={(ids) => {
		albums.addPhotos(album.id, ids);
		toast.success(`${pluralize(ids.length, 'photo')} added`);
	}}
/>

<Modal bind:open={confirmDelete} title={`Delete “${album.title}”?`} description="The photos stay in the archive; only the collection is removed." size="sm">
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button tone="danger" onclick={remove}>Delete</Button>
	{/snippet}
</Modal>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		gap: clamp(1.5rem, 3vw, 2.5rem);
		align-items: start;
	}
	aside {
		position: sticky;
		top: 80px;
		display: grid;
		gap: var(--ui-space-6);
		justify-items: start;
	}
	aside > :global(*:first-child) {
		width: 100%;
	}
	.hint {
		margin: 0 0 var(--ui-space-10);
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-subtle);
	}
	.stack {
		display: grid;
		gap: var(--ui-space-10);
	}
	@media (max-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		aside {
			position: static;
		}
	}
</style>
