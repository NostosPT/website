<script lang="ts">
	import { untrack } from 'svelte';
	import {
		Button,
		Card,
		CardBody,
		CardFooter,
		CardHeader,
		Field,
		FileUpload,
		Input,
		NumberInput,
		SegmentedControl,
		Select,
		Switch,
		Textarea,
		toast
	} from '@nostospt/ui';
	import { photos } from '$lib/admin/photos/store.svelte';
	import PositionPicker from './PositionPicker.svelte';
	import WatermarkOverlay from './WatermarkOverlay.svelte';
	import { watermarks } from './store.svelte';
	import type { WatermarkPreset } from './types';

	let { preset, ondelete }: { preset: WatermarkPreset; ondelete: () => void } = $props();

	// Keyed by preset id in the page, so copying once is enough.
	let draft = $state(untrack(() => structuredClone($state.snapshot(preset))));
	let linesText = $state(untrack(() => preset.lines.join('\n')));
	let logo = $state<File[]>([]);
	let sampleId = $state('ph_412');

	let sample = $derived(photos.get(sampleId) ?? photos.items[0]);
	let dirty = $derived(JSON.stringify(draft) !== JSON.stringify(preset));

	$effect(() => {
		draft.lines = linesText.split('\n').filter((line) => line.trim());
	});

	$effect(() => {
		const file = logo[0];
		if (!file) return;
		// Mock: a real upload stores the logo and saves its URL.
		const url = URL.createObjectURL(file);
		draft.imageUrl = url;
		return () => URL.revokeObjectURL(url);
	});

	function save() {
		watermarks.save($state.snapshot(draft));
		toast.success(`“${draft.name}” saved`, { description: 'Renditions using it regenerate in the background.' });
	}
</script>

<div class="editor">
	<section class="preview">
		<figure class="frame" style:aspect-ratio={sample?.width && sample?.height ? `${sample.width} / ${sample.height}` : '3 / 2'}>
			{#if sample?.urls.display}<img src={sample.urls.display} alt="" />{/if}
			<WatermarkOverlay preset={draft} number={sample?.number} />
		</figure>
		<div class="sample">
			<span>Preview on</span>
			<div class="sample-select">
				<Select
					bind:value={sampleId}
					size="sm"
					aria-label="Sample photo"
					options={photos.items.map((p) => ({ value: p.id, label: `Nº ${p.number} · ${p.title ?? 'Untitled'}` }))}
				/>
			</div>
		</div>
	</section>

	<Card>
		<CardHeader title={draft.name || 'Untitled preset'} divided>
			{#snippet actions()}
				<Button size="sm" variant="ghost" tone="danger" icon="trash" onclick={ondelete}>Delete</Button>
			{/snippet}
		</CardHeader>
		<CardBody>
			<div class="stack">
				<Field label="Name">
					{#snippet control({ id }: { id: string })}
						<Input {id} bind:value={draft.name} />
					{/snippet}
				</Field>

				<Field label="Type">
					{#snippet control()}
						<SegmentedControl
							bind:value={draft.kind}
							ariaLabel="Type"
							block
							items={[
								{ value: 'text', label: 'Text', icon: 'typography' },
								{ value: 'image', label: 'Logo', icon: 'image' }
							]}
						/>
					{/snippet}
				</Field>

				{#if draft.kind === 'text'}
					<Field label="Lines" hint="One per line. {'{number}'} becomes the Photo ID, e.g. Nº 482; also {'{year}'} and {'{photographer}'}.">
						{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
							<Textarea {id} bind:value={linesText} rows={2} autogrow aria-describedby={describedBy} />
						{/snippet}
					</Field>
					<Field label="Typeface">
						{#snippet control()}
							<SegmentedControl
								bind:value={draft.font}
								ariaLabel="Typeface"
								items={[
									{ value: 'sans', label: 'Raleway' },
									{ value: 'serif', label: 'Lora' }
								]}
							/>
						{/snippet}
					</Field>
				{:else}
					<Field label="Logo" hint="Transparent PNG or SVG, light on dark works best.">
						{#snippet control({ id }: { id: string })}
							<FileUpload {id} bind:files={logo} accept="image/png,image/svg+xml" icon="image" />
						{/snippet}
					</Field>
				{/if}

				<div class="three">
					<Field label="Size" hint="% of width">
						{#snippet control({ id }: { id: string })}
							<NumberInput {id} layout="vertical" bind:value={draft.size} min={0.5} max={12} step={0.1} precision={1} />
						{/snippet}
					</Field>
					<Field label="Opacity" hint="%">
						{#snippet control({ id }: { id: string })}
							<NumberInput {id} layout="vertical" bind:value={draft.opacity} min={5} max={100} step={5} />
						{/snippet}
					</Field>
					<Field label="Margin" hint="% of width">
						{#snippet control({ id }: { id: string })}
							<NumberInput {id} layout="vertical" bind:value={draft.margin} min={0} max={15} step={0.5} precision={1} disabled={draft.tiled} />
						{/snippet}
					</Field>
				</div>

				<div class="placement">
					<Field label="Position">
						{#snippet control({ id }: { id: string })}
							<PositionPicker {id} bind:value={draft.position} disabled={draft.tiled} />
						{/snippet}
					</Field>
					<div class="toggles">
						<Field label="Ink">
							{#snippet control()}
								<SegmentedControl
									bind:value={draft.tone}
									ariaLabel="Ink"
									size="sm"
									items={[
										{ value: 'light', label: 'Light' },
										{ value: 'dark', label: 'Dark' }
									]}
								/>
							{/snippet}
						</Field>
						<Switch bind:checked={draft.tiled} label="Tile across the frame" description="For proofs, harder to crop out." />
					</div>
				</div>
			</div>
		</CardBody>
		<CardFooter>
			<Button variant="ghost" tone="neutral" disabled={!dirty} onclick={() => ((draft = structuredClone($state.snapshot(preset))), (linesText = preset.lines.join('\n')))}>
				Discard
			</Button>
			<Button disabled={!dirty} onclick={save}>Save preset</Button>
		</CardFooter>
	</Card>
</div>

<style>
	.editor {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(320px, 1fr);
		gap: clamp(1.25rem, 2.5vw, 2rem);
		align-items: start;
	}
	.preview {
		position: sticky;
		top: 80px;
		display: grid;
		gap: var(--ui-space-6);
	}
	.frame {
		position: relative;
		margin: 0;
		max-height: 64vh;
		overflow: hidden;
		background: var(--nostos-photo-mat);
	}
	.frame img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.sample {
		display: flex;
		align-items: center;
		gap: var(--ui-space-6);
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
	}
	.sample-select {
		flex: 1;
	}
	.stack {
		display: grid;
		gap: var(--ui-space-10);
	}
	.three {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--ui-space-6);
	}
	.placement {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-space-12);
	}
	.toggles {
		display: grid;
		gap: var(--ui-space-8);
		flex: 1;
		min-width: 200px;
	}
	@media (max-width: 1200px) {
		.editor {
			grid-template-columns: minmax(0, 1fr);
		}
		.preview {
			position: static;
		}
	}
</style>
