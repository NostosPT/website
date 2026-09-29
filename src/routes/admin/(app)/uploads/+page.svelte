<script lang="ts">
	import {
		Alert,
		Card,
		CardBody,
		CardHeader,
		EmptyState,
		Field,
		SegmentedControl,
		Select,
		Switch,
		toast
	} from '@nostospt/ui';
	import { albums } from '$lib/admin/albums/store.svelte';
	import { session } from '$lib/admin/auth/session.svelte';
	import { galleries } from '$lib/admin/galleries/store.svelte';
	import { photos } from '$lib/admin/photos/store.svelte';
	import { pluralize } from '$lib/admin/shared/format';
	import { visibilityOptions } from '$lib/admin/shared/status';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';
	import { team } from '$lib/admin/team/store.svelte';
	import type { UploadCandidate } from '$lib/admin/uploads/files';
	import { uploads } from '$lib/admin/uploads/queue.svelte';
	import UploadDropzone from '$lib/admin/uploads/UploadDropzone.svelte';
	import UploadQueue from '$lib/admin/uploads/UploadQueue.svelte';

	let settings = $derived(uploads.settings);

	$effect(() => {
		if (!settings.photographerId && session.user) settings.photographerId = session.user.id;
	});

	let destinationMissing = $derived(
		(settings.destination === 'album' && !settings.albumId && !settings.albumPerFolder) ||
			(settings.destination === 'gallery' && !settings.galleryId)
	);

	function add(candidates: UploadCandidate[]) {
		if (destinationMissing) {
			toast.warning(`Choose ${settings.destination === 'album' ? 'an album' : 'a gallery'} first`);
			return;
		}
		const count = uploads.add(candidates);
		const folders = new Set(candidates.map((c) => c.path.split('/').slice(0, -1).join('/')).filter(Boolean));
		if (count) {
			toast(`${pluralize(count, 'file')} added`, {
				description: folders.size ? `From ${pluralize(folders.size, 'folder')}` : undefined
			});
		}
	}
</script>

<PageHeader
	kicker="Library"
	title="Upload"
	description="Originals go straight to private storage. Nothing is public until you publish it, and uploads keep running while you work elsewhere."
/>

<div class="layout">
	<div class="main">
		<UploadDropzone onadd={add} />

		{#if uploads.rejected.length}
			<Alert tone="warning" title={`${pluralize(uploads.rejected.length, 'file')} skipped`} dismissible ondismiss={() => (uploads.rejected = [])}>
				Not a supported image: {uploads.rejected.slice(0, 4).join(', ')}{uploads.rejected.length > 4 ? '…' : ''}
			</Alert>
		{/if}

		{#if uploads.items.length}
			<UploadQueue />
		{:else}
			<EmptyState
				icon="inbox"
				title="Nothing uploading"
				description="Files you add appear here with their progress. You can leave this page while they upload."
				size="sm"
			/>
		{/if}
	</div>

	<aside>
		<Card>
			<CardHeader title="Destination" description="Applies to the next files you add." divided />
			<CardBody>
				<div class="stack">
					<SegmentedControl
						bind:value={settings.destination}
						ariaLabel="Destination"
						block
						items={[
							{ value: 'archive', label: 'Archive' },
							{ value: 'album', label: 'Album' },
							{ value: 'gallery', label: 'Gallery' }
						]}
					/>

					{#if settings.destination === 'album'}
						<Switch
							bind:checked={settings.albumPerFolder}
							label="New album for each folder"
							description="Folder names become album titles. Loose files go to the album below."
						/>
						<Field label="Album" optional={settings.albumPerFolder}>
							{#snippet control({ id }: { id: string })}
								<Select {id} bind:value={settings.albumId} placeholder="Choose an album" options={albums.options} />
							{/snippet}
						</Field>
					{:else if settings.destination === 'gallery'}
						<Field label="Client gallery" hint="Gallery photos stay out of the public archive.">
							{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
								<Select
									{id}
									bind:value={settings.galleryId}
									placeholder="Choose a gallery"
									aria-describedby={describedBy}
									options={galleries.items.filter((g) => g.status !== 'ARCHIVED').map((g) => ({ value: g.id, label: g.title }))}
								/>
							{/snippet}
						</Field>
					{/if}
				</div>
			</CardBody>
		</Card>

		<Card>
			<CardHeader title="Defaults" description="Edit any photo afterwards." divided />
			<CardBody>
				<div class="stack">
					<Field label="Visibility">
						{#snippet control({ id }: { id: string })}
							<Select {id} bind:value={settings.visibility} options={visibilityOptions} />
						{/snippet}
					</Field>
					<Field label="Category" optional>
						{#snippet control({ id }: { id: string })}
							<Select
								{id}
								bind:value={settings.category}
								options={[{ value: '', label: 'None' }, ...photos.categories.map((c) => ({ value: c, label: c }))]}
							/>
						{/snippet}
					</Field>
					<Field label="Photographer">
						{#snippet control({ id }: { id: string })}
							<Select
								{id}
								bind:value={settings.photographerId}
								options={team.photographers.map((m) => ({ value: m.id, label: m.name }))}
							/>
						{/snippet}
					</Field>
					<Switch
						bind:checked={settings.watermarked}
						label="Watermark previews"
						description="Uses the archive preset from Watermarks."
					/>
				</div>
			</CardBody>
		</Card>

		<Alert tone="info" variant="soft" title="After upload">
			Display and thumbnail renditions, and their watermarks, are generated in the background.
			Originals are stored untouched.
		</Alert>
	</aside>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 340px;
		gap: clamp(1.5rem, 3vw, 2.5rem);
		align-items: start;
	}
	.main,
	aside {
		display: grid;
		gap: var(--ui-space-12);
	}
	.stack {
		display: grid;
		gap: var(--ui-space-10);
	}
	@media (max-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
