<script lang="ts">
	import { untrack } from 'svelte';
	import {
		Alert,
		Badge,
		Button,
		Card,
		CardBody,
		CardHeader,
		Checkbox,
		CurrencyInput,
		DataList,
		DataListRow,
		DatePicker,
		Field,
		Input,
		List,
		ListItem,
		SegmentedControl,
		Select,
		Switch,
		TagInput,
		Textarea,
		toast
	} from '@nostospt/ui';
	import { albums } from '$lib/admin/albums/store.svelte';
	import { galleries, galleryStatus } from '$lib/admin/galleries/store.svelte';
	import { formatDateTime, LOCALE, photoNumber } from '$lib/admin/shared/format';
	import { visibilityOptions } from '$lib/admin/shared/status';
	import { team } from '$lib/admin/team/store.svelte';
	import WatermarkOverlay from '$lib/admin/watermark/WatermarkOverlay.svelte';
	import { watermarks } from '$lib/admin/watermark/store.svelte';
	import { availabilityOptions, needsConsentCheck, photos } from './store.svelte';
	import type { Availability, Photo, Visibility } from './types';

	let { photo }: { photo: Photo } = $props();

	type Form = {
		title: string;
		description: string;
		category: string;
		location: string;
		takenAt: Date | undefined;
		tags: string[];
		photographerId: string;
		visibility: Visibility;
		availability: Availability;
		price: number | null;
		watermarked: boolean;
	};

	function toForm(p: Photo): Form {
		return {
			title: p.title ?? '',
			description: p.description ?? '',
			category: p.category ?? '',
			location: p.location ?? '',
			takenAt: p.takenAt ? new Date(p.takenAt) : undefined,
			tags: [...p.tags],
			photographerId: p.photographerId ?? '',
			visibility: p.visibility,
			availability: p.availability,
			price: p.priceCents != null ? p.priceCents / 100 : null,
			watermarked: p.watermarked
		};
	}

	// The page keys this component by photo id, so the initial copy is enough.
	let form = $state(untrack(() => toForm(photo)));
	let showWatermark = $state(true);
	let saving = $state(false);

	let dirty = $derived(JSON.stringify(form) !== JSON.stringify(toForm(photo)));
	let preset = $derived(watermarks.get(watermarks.rules.archivePreviews));
	let photographer = $derived(team.get(form.photographerId));
	let inGalleries = $derived(galleries.containing(photo.id));

	async function save() {
		saving = true;
		await new Promise((resolve) => setTimeout(resolve, 300));
		photos.update(photo.id, {
			title: form.title.trim() || null,
			description: form.description.trim() || null,
			category: form.category || null,
			location: form.location.trim() || null,
			takenAt: form.takenAt?.toISOString() ?? null,
			tags: form.tags,
			photographerId: form.photographerId || null,
			visibility: form.visibility,
			availability: form.availability,
			priceCents: form.price != null ? Math.round(form.price * 100) : null,
			watermarked: form.watermarked
		});
		saving = false;
		toast.success(`${photoNumber(photo.number)} saved`);
	}

	function toggleAlbum(albumId: string, member: boolean) {
		if (member) albums.removePhoto(albumId, photo.id);
		else albums.addPhotos(albumId, [photo.id]);
	}
</script>

<div class="editor">
	<section class="preview">
		<figure
			class="frame"
			style:aspect-ratio={photo.width && photo.height ? `${photo.width} / ${photo.height}` : '3 / 2'}
		>
			{#if photo.urls.display}
				<img src={photo.urls.display} alt={form.title || photoNumber(photo.number)} />
			{/if}
			{#if showWatermark && form.watermarked && preset}
				<WatermarkOverlay {preset} number={photo.number} photographer={photographer?.name} />
			{/if}
		</figure>
		<div class="preview-bar">
			<Switch
				bind:checked={showWatermark}
				size="sm"
				label="Preview watermark"
				disabled={!form.watermarked || !preset}
			/>
			{#if photo.urls.original}
				<Button href={photo.urls.original} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm" icon="download">Original</Button>
			{/if}
		</div>

		<DataList dividers size="sm">
			<DataListRow label="Photo ID" value={photoNumber(photo.number)} />
			<DataListRow label="Dimensions" value={photo.width && photo.height ? `${photo.width} × ${photo.height}` : '—'} />
			<DataListRow label="Original" value={photo.originalKey} />
			<DataListRow label="Uploaded" value={formatDateTime(photo.createdAt)} />
			<DataListRow label="Last edited" value={formatDateTime(photo.updatedAt)} />
		</DataList>
	</section>

	<form class="fields" onsubmit={(e) => (e.preventDefault(), save())}>
		<Card>
			<CardHeader title="Details" divided />
			<CardBody>
				<div class="stack">
					<Field label="Title">
						{#snippet control({ id }: { id: string })}
							<Input {id} bind:value={form.title} placeholder="Untitled" />
						{/snippet}
					</Field>
					<Field label="Description" optional>
						{#snippet control({ id }: { id: string })}
							<Textarea {id} bind:value={form.description} rows={3} autogrow />
						{/snippet}
					</Field>
					<div class="two">
						<Field label="Category">
							{#snippet control({ id }: { id: string })}
								<Select
									{id}
									bind:value={form.category}
									placeholder="Choose…"
									options={photos.categories.map((c) => ({ value: c, label: c }))}
								/>
							{/snippet}
						</Field>
						<Field label="Taken">
							{#snippet control({ id }: { id: string })}
								<DatePicker {id} bind:value={form.takenAt} locale={LOCALE} />
							{/snippet}
						</Field>
					</div>
					<Field label="Location" hint="Archive style: CITY / COUNTRY">
						{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
							<Input {id} bind:value={form.location} icon="globe" aria-describedby={describedBy} />
						{/snippet}
					</Field>
					<Field label="Tags">
						{#snippet control({ id }: { id: string })}
							<TagInput {id} bind:value={form.tags} placeholder="Add a tag…" />
						{/snippet}
					</Field>
					<Field label="Photographer">
						{#snippet control({ id }: { id: string })}
							<Select
								{id}
								bind:value={form.photographerId}
								placeholder="Unassigned"
								options={team.photographers.map((m) => ({ value: m.id, label: m.name }))}
							/>
						{/snippet}
					</Field>
				</div>
			</CardBody>
		</Card>

		<Card>
			<CardHeader title="Publishing" description="What the public archive shows, and whether it can be bought." divided />
			<CardBody>
				<div class="stack">
					<Field label="Visibility">
						{#snippet control()}
							<SegmentedControl bind:value={form.visibility} items={visibilityOptions} block ariaLabel="Visibility" />
						{/snippet}
					</Field>
					<div class="two">
						<Field label="Availability">
							{#snippet control({ id }: { id: string })}
								<Select {id} bind:value={form.availability} options={availabilityOptions} />
							{/snippet}
						</Field>
						<Field label="Digital price" optional>
							{#snippet control({ id }: { id: string })}
								<CurrencyInput
									{id}
									bind:value={form.price}
									currency="EUR"
									currencies={['EUR']}
									locale={LOCALE}
									disabled={form.availability === 'NOT_FOR_SALE'}
								/>
							{/snippet}
						</Field>
					</div>
					{#if needsConsentCheck(form)}
						<Alert tone="warning" title="Identifiable people">
							This photograph is tagged “people” and marked for sale. Record consent or a
							licensing basis before selling (CONTENT.md › Street Photography).
						</Alert>
					{/if}
					<Switch
						bind:checked={form.watermarked}
						label="Watermark previews"
						description="Display and thumbnail renditions carry the archive watermark. The original never does."
					/>
				</div>
			</CardBody>
		</Card>

		<Card>
			<CardHeader title="Collections" divided />
			<CardBody>
				<div class="stack">
					<fieldset class="albums">
						<legend>Albums</legend>
						{#each albums.items as album (album.id)}
							{@const member = album.photoIds.includes(photo.id)}
							<Checkbox checked={member} label={album.title} onchange={() => toggleAlbum(album.id, member)} />
						{/each}
					</fieldset>
					{#if inGalleries.length}
						<List bordered>
							{#each inGalleries as gallery (gallery.id)}
								{@const status = galleryStatus[gallery.status]}
								<ListItem title={gallery.title} href={`/admin/galleries/${gallery.id}`} padding="sm">
									{#snippet trailing()}<Badge tone={status.tone} size="sm">{status.label}</Badge>{/snippet}
								</ListItem>
							{/each}
						</List>
					{/if}
				</div>
			</CardBody>
		</Card>

		<div class="savebar" data-dirty={dirty || undefined}>
			<span>{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
			<Button variant="ghost" tone="neutral" disabled={!dirty} onclick={() => (form = toForm(photo))}>Discard</Button>
			<Button type="submit" disabled={!dirty} loading={saving}>Save</Button>
		</div>
	</form>
</div>

<style>
	.editor {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: clamp(1.5rem, 3vw, 3rem);
		align-items: start;
	}
	.preview {
		position: sticky;
		top: 80px;
		display: grid;
		gap: var(--ui-space-8);
	}
	.frame {
		position: relative;
		margin: 0;
		max-height: 70vh;
		background: var(--nostos-photo-mat);
		overflow: hidden;
	}
	.frame img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.preview-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.fields {
		display: grid;
		gap: var(--ui-space-12);
	}
	.stack {
		display: grid;
		gap: var(--ui-space-10);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ui-space-8);
	}
	.albums {
		display: grid;
		gap: var(--ui-space-4);
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-bottom: var(--ui-space-4);
		font-size: var(--ui-text-md);
		font-weight: var(--ui-label-weight);
	}
	.savebar {
		position: sticky;
		bottom: var(--ui-space-8);
		display: flex;
		align-items: center;
		gap: var(--ui-space-4);
		padding: var(--ui-space-4) var(--ui-space-4) var(--ui-space-4) var(--ui-space-8);
		background: var(--ui-bg-raised);
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-lg);
		box-shadow: var(--ui-shadow-md);
	}
	.savebar span {
		margin-right: auto;
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-subtle);
	}
	.savebar[data-dirty] span {
		color: var(--ui-fg-default);
	}
	@media (max-width: 1100px) {
		.editor {
			grid-template-columns: minmax(0, 1fr);
		}
		.preview {
			position: static;
		}
	}
</style>
