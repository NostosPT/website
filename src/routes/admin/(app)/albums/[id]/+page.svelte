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
	import { ApiError } from '$lib/admin/api/client';
	import { albums } from '$lib/admin/albums/store.svelte';
	import { clients } from '$lib/admin/clients/store.svelte';
	import PhotoPicker from '$lib/admin/photos/PhotoPicker.svelte';
	import { formatDate, pluralize, slugify } from '$lib/admin/shared/format';
	import { statusOptions } from '$lib/admin/shared/status';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let { data } = $props();
	let album = $derived(data.album);

	let picking = $state(false);
	let confirmDelete = $state(false);

	const favorites = $derived(albums.favoritesOf(album.id));
	const favoritesLoading = $derived(albums.favoritesLoading(album.id));

	function clientName(clientId: string): string {
		return clients.get(clientId)?.name ?? 'Unknown client';
	}

	// Staff read surface (purchase assistance): favorites need no mock.
	$effect(() => {
		void albums.loadFavorites(album.id);
	});

	async function remove() {
		try {
			// Real backend archives (Website API → Real API).
			await albums.removeRemote(album.id);
		} catch {
			albums.remove(album.id);
		}
		toast(`�?o${album.title}�?? deleted`, { description: 'Its photos stay in the archive.' });
		goto('/admin/albums');
	}

	async function setStatus(status: typeof album.status) {
		const previous = album.status;
		try {
			if (status === 'PUBLISHED') await albums.publishRemote(album.id);
			else if (status === 'ARCHIVED') {
				await albums.removeRemote(album.id);
				toast(`${album.title} archived`);
				goto('/admin/albums');
				return;
			} else await albums.unpublishRemote(album.id);
		} catch (error) {
			// Offline backend only: apply locally. Real API errors (e.g. a
			// protected type without access code) surface without diverging.
			if (!(error instanceof ApiError) || (error.status !== 0 && error.status !== 503)) {
				toast.error(error instanceof Error ? error.message : 'Could not change status');
				return;
			}
			albums.update(album.id, { status });
			if (status === 'ARCHIVED') {
				toast(`${album.title} archived`);
				goto('/admin/albums');
				return;
			}
		}
		if (status !== previous) toast.success(`Album ${status.toLowerCase()}`);
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
			disabled={album.status !== 'PUBLISHED'}
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
				onreorder={async (from, to) => {
					try {
						await albums.reorderRemote(album.id, from, to);
					} catch {
						albums.reorder(album.id, from, to);
					}
				}}
				onremove={async (photoId) => {
					try {
						await albums.removePhotoRemote(album.id, photoId);
					} catch {
						albums.removePhoto(album.id, photoId);
					}
				}}
				oncover={async (photoId) => {
					try {
						await albums.updateRemote(album.id, { coverPhotoId: photoId });
					} catch {
						albums.update(album.id, { coverPhotoId: photoId });
					}
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
							<Input
								{id}
								value={album.title}
								onchange={async (e: Event) => {
									const title = (e.currentTarget as HTMLInputElement).value;
									try {
										await albums.updateRemote(album.id, { title });
									} catch {
										albums.update(album.id, { title });
									}
								}}
							/>
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
								onchange={async (e: Event) => {
									const description = (e.currentTarget as HTMLTextAreaElement).value || null;
									try {
										await albums.updateRemote(album.id, { description });
									} catch {
										albums.update(album.id, { description });
									}
								}}
							/>
						{/snippet}
					</Field>
					<Field label="Status" hint={album.publishedAt ? `Published ${formatDate(album.publishedAt)}` : 'Not published yet'}>
						{#snippet control()}
							<SegmentedControl
								value={album.status}
								items={statusOptions}
								block
								ariaLabel="Album status"
								onchange={(status: typeof album.status) => void setStatus(status)}
							/>
						{/snippet}
					</Field>
				</div>
			</CardBody>
		</Card>
		<Card>
			<CardHeader title={`Client favorites (${favorites.length})`} divided />
			<CardBody>
				{#if favoritesLoading}
					<p class="hint">Loading favorites…</p>
				{:else if favorites.length}
					<ul class="favorites">
						{#each favorites as favorite (favorite.id)}
							<li>
								<span>{favorite.photo?.title ?? `Photo #${favorite.photo?.number ?? '?'}`}</span>
								<small>{clientName(favorite.clientId)}</small>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="hint">No client favorites yet.</p>
				{/if}
			</CardBody>
		</Card>
		<Button variant="ghost" tone="danger" icon="trash" onclick={() => (confirmDelete = true)}>Delete album</Button>
	</aside>
</div>

<PhotoPicker
	bind:open={picking}
	title={`Add to “${album.title}”`}
	exclude={album.photoIds}
	onconfirm={async (ids) => {
		try {
			await albums.addPhotosRemote(album.id, ids);
		} catch {
			albums.addPhotos(album.id, ids);
		}
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
	.favorites {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.5rem;
	}
	.favorites li {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.favorites small {
		color: var(--muted);
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
