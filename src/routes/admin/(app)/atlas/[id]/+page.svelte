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
		MultiSelect,
		SegmentedControl,
		Textarea,
		toast
	} from '@nostospt/ui';
	import { atlas } from '$lib/admin/atlas/store.svelte';
	import { atlasCategories } from '$lib/admin/atlas/categories.svelte';
	import type { AtlasLocationStatus } from '$lib/admin/atlas/types';
	import { ApiError } from '$lib/admin/api/client';
	import PhotoPicker from '$lib/admin/photos/PhotoPicker.svelte';
	import { photos } from '$lib/admin/photos/store.svelte';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let { data } = $props();
	let location = $derived(data.location);

	let picking = $state(false);
	let pickingCover = $state(false);
	let confirmDelete = $state(false);
	let categorySlugs = $state<string[]>([]);
	let categoriesLoaded = $state(false);

	// Reference-photo entries with editable captions (from the detail endpoint).
	let entries = $state<{ photoId: string; caption: string | null; position: number }[]>([]);
	let entriesLoaded = $state(false);

	$effect(() => {
		void atlas.loadDetail(location.id).then(
			(detail) => {
				entries = detail.photos;
				entriesLoaded = true;
				if (!categoriesLoaded) {
					categorySlugs = detail.categories.map((c) => c.slug);
					categoriesLoaded = true;
				}
			},
			() => {
				entries = [];
				entriesLoaded = true;
			}
		);
	});

	function photoLabel(photoId: string): string {
		const photo = photos.get(photoId);
		return photo ? `#${photo.number} ${photo.title ?? ''}`.trim() : photoId;
	}

	async function setStatus(status: AtlasLocationStatus) {
		const previous = location.status;
		try {
			if (status === 'PUBLISHED') await atlas.publishRemote(location.id);
			else if (status === 'ARCHIVED') {
				await atlas.removeRemote(location.id);
				toast(`${location.name} archived`);
				goto('/admin/atlas');
				return;
			} else await atlas.unpublishRemote(location.id);
		} catch (error) {
			if (!(error instanceof ApiError) || (error.status !== 0 && error.status !== 503)) {
				toast.error(error instanceof Error ? error.message : 'Could not change status');
				return;
			}
			atlas.update(location.id, { status });
			if (status === 'ARCHIVED') {
				toast(`${location.name} archived`);
				goto('/admin/atlas');
				return;
			}
		}
		if (status !== previous) toast.success(`Location ${status.toLowerCase()}`);
	}

	async function remove() {
		try {
			await atlas.removeRemote(location.id);
		} catch {
			atlas.remove(location.id);
		}
		toast(`${location.name} archived`, { description: 'Locations are archived, never deleted.' });
		goto('/admin/atlas');
	}

	async function saveCategories(slugs: string[]) {
		categorySlugs = slugs;
		try {
			await atlas.setCategoriesRemote(location.id, slugs);
			toast.success('Categories saved');
		} catch {
			toast.error('Could not save categories while offline');
			categorySlugs = (await atlas.loadDetail(location.id).catch(() => null))?.categories.map((c) => c.slug) ?? [];
		}
	}

	async function addPhotos(ids: string[]) {
		const next = [...entries.map((e) => ({ photoId: e.photoId, caption: e.caption })), ...ids.map((photoId) => ({ photoId, caption: null as string | null }))];
		try {
			const detail = await atlas.setPhotosRemote(location.id, next);
			entries = detail.photos;
			toast.success('Reference photos saved');
		} catch {
			toast.error('Could not save photos while offline');
		}
	}

	async function removePhoto(photoId: string) {
		const next = entries.filter((e) => e.photoId !== photoId).map((e) => ({ photoId: e.photoId, caption: e.caption }));
		try {
			const detail = await atlas.setPhotosRemote(location.id, next);
			entries = detail.photos;
		} catch {
			toast.error('Could not remove photo while offline');
		}
	}

	async function saveCaption(photoId: string, caption: string) {
		const next = entries.map((e) => (e.photoId === photoId ? { photoId: e.photoId, caption: caption || null } : { photoId: e.photoId, caption: e.caption }));
		try {
			const detail = await atlas.setPhotosRemote(location.id, next);
			entries = detail.photos;
		} catch {
			toast.error('Could not save caption while offline');
		}
	}

	async function chooseCover(ids: string[]) {
		const coverPhotoId = ids[0] ?? null;
		pickingCover = false;
		if (!coverPhotoId) return;
		try {
			await atlas.updateRemote(location.id, { coverPhotoId });
			toast.success('Cover photo set');
		} catch {
			atlas.update(location.id, { coverPhotoId });
			toast.success('Cover photo set');
		}
	}

	function geometrySummary(): string {
		if (location.geometryKind === 'AREA') return 'Polygon area (see GeoJSON below)';
		if (location.latitude == null || location.longitude == null) return 'No point set';
		return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
	}
</script>

<PageHeader
	kicker={`Field · ${location.geometryKind === 'AREA' ? 'Area' : 'Point'}`}
	title={location.name}
	back={{ href: '/admin/atlas', label: 'Atlas' }}
	detail
>
	{#snippet actions()}
		<Button icon="plus" onclick={() => (picking = true)}>Add photos</Button>
	{/snippet}
</PageHeader>

<div class="layout">
	<section>
		<Card>
			<CardHeader title="Reference photos" divided />
			<CardBody>
				{#if !entriesLoaded}
					<p class="hint">Loading photos…</p>
				{:else if entries.length}
					<ul class="photos">
						{#each entries as entry (entry.photoId)}
							<li>
								<span>{photoLabel(entry.photoId)}</span>
								<Input
									value={entry.caption ?? ''}
									placeholder="Caption (optional)"
									aria-label="Caption"
									onchange={(e: Event) => saveCaption(entry.photoId, (e.currentTarget as HTMLInputElement).value)}
								/>
								<Button size="sm" variant="ghost" tone="neutral" icon="trash" label="Remove photo" iconOnly onclick={() => removePhoto(entry.photoId)} />
							</li>
						{/each}
					</ul>
				{:else}
					<EmptyState icon="image" title="No reference photos" description="Attach archive photos to scout this location." bordered>
						{#snippet actions()}
							<Button icon="plus" onclick={() => (picking = true)}>Add photos</Button>
						{/snippet}
					</EmptyState>
				{/if}
			</CardBody>
		</Card>
	</section>

	<aside>
		<Card>
			<CardHeader title="Location" divided />
			<CardBody>
				<div class="stack">
					<Field label="Name">
						{#snippet control({ id }: { id: string })}
							<Input
								{id}
								value={location.name}
								onchange={async (e: Event) => {
									const name = (e.currentTarget as HTMLInputElement).value;
									try {
										await atlas.updateRemote(location.id, { name });
									} catch {
										atlas.update(location.id, { name });
									}
								}}
							/>
						{/snippet}
					</Field>
					<Field label="Description" optional>
						{#snippet control({ id }: { id: string })}
							<Textarea
								{id}
								value={location.description ?? ''}
								rows={3}
								autogrow
								onchange={async (e: Event) => {
									const description = (e.currentTarget as HTMLTextAreaElement).value || null;
									try {
										await atlas.updateRemote(location.id, { description });
									} catch {
										atlas.update(location.id, { description });
									}
								}}
							/>
						{/snippet}
					</Field>
					<Field label="Status">
						{#snippet control()}
							<SegmentedControl
								value={location.status}
								items={[
									{ value: 'DRAFT', label: 'Draft' },
									{ value: 'PUBLISHED', label: 'Published' },
									{ value: 'ARCHIVED', label: 'Archived' }
								]}
								block
								ariaLabel="Location status"
								onchange={(status: AtlasLocationStatus) => void setStatus(status)}
							/>
						{/snippet}
					</Field>
					<Field label="Geometry">
						{#snippet control()}
							<p class="hint">{geometrySummary()}</p>
						{/snippet}
					</Field>
				</div>
			</CardBody>
		</Card>
		<Card>
			<CardHeader title="Categories" divided />
			<CardBody>
				<MultiSelect
					bind:value={categorySlugs}
					options={atlasCategories.options}
					placeholder="Photographic categories"
					onchange={() => void saveCategories(categorySlugs)}
				/>
			</CardBody>
		</Card>
		<Card>
			<CardHeader title="Cover photo" divided />
			<CardBody>
				<p class="hint">{location.coverPhotoId ? photoLabel(location.coverPhotoId) : 'No cover selected.'}</p>
				<Button size="sm" variant="outline" icon="image" onclick={() => (pickingCover = true)}>Choose cover</Button>
			</CardBody>
		</Card>
		<Button variant="ghost" tone="danger" icon="trash" onclick={() => (confirmDelete = true)}>Delete location</Button>
	</aside>
</div>

<PhotoPicker
	bind:open={picking}
	title={`Reference photos for ${location.name}`}
	exclude={entries.map((e) => e.photoId)}
	onconfirm={(ids) => {
		picking = false;
		void addPhotos(ids);
	}}
/>

<PhotoPicker
	bind:open={pickingCover}
	title="Choose cover photo"
	exclude={[]}
	onconfirm={(ids) => void chooseCover(ids)}
/>

<Modal bind:open={confirmDelete} title={`Delete “${location.name}”?`} description="The location is archived, never deleted." size="sm">
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button tone="danger" onclick={remove}>Delete</Button>
	{/snippet}
</Modal>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
	}
	.photos {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.75rem;
	}
	.photos li {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.5rem;
		align-items: center;
	}
</style>
