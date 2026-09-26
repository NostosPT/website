<script lang="ts">
	import {
		Badge,
		Button,
		Card,
		CardBody,
		CardHeader,
		Field,
		List,
		ListItem,
		Modal,
		Select,
		toast
	} from '@nostospt/ui';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';
	import WatermarkEditor from '$lib/admin/watermark/WatermarkEditor.svelte';
	import { watermarks } from '$lib/admin/watermark/store.svelte';
	import type { WatermarkRules } from '$lib/admin/watermark/types';

	let selectedId = $state(watermarks.presets[0]?.id ?? '');
	let confirmDelete = $state(false);
	let selected = $derived(watermarks.get(selectedId));

	const rules: { key: keyof WatermarkRules; label: string; hint: string }[] = [
		{ key: 'archivePreviews', label: 'Archive previews', hint: 'Public display and thumbnail renditions.' },
		{ key: 'galleryProofs', label: 'Gallery proofs', hint: 'What clients see while choosing.' },
		{ key: 'galleryDownloads', label: 'Gallery downloads', hint: 'Files clients download, when allowed.' }
	];

	let usage = $derived(
		(id: string) => rules.filter((rule) => watermarks.rules[rule.key] === id).map((rule) => rule.label)
	);

	function create() {
		selectedId = watermarks.create().id;
	}

	function remove() {
		if (!selected) return;
		const name = selected.name;
		watermarks.remove(selected.id);
		selectedId = watermarks.presets[0]?.id ?? '';
		confirmDelete = false;
		toast(`“${name}” deleted`);
	}
</script>

<PageHeader
	kicker="Archive"
	title="Watermarks"
	description="Subtle and consistent: a watermark protects previews without destroying the photograph. Originals are never watermarked."
>
	{#snippet actions()}
		<Button icon="plus" onclick={create}>New preset</Button>
	{/snippet}
</PageHeader>

<Card>
	<CardHeader title="Where watermarks apply" divided />
	<CardBody>
		<div class="rules">
			{#each rules as rule (rule.key)}
				<Field label={rule.label} hint={rule.hint}>
					{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
						<Select
							{id}
							aria-describedby={describedBy}
							value={watermarks.rules[rule.key] ?? ''}
							options={[{ value: '', label: 'No watermark' }, ...watermarks.options]}
							onchange={(event: Event) =>
								(watermarks.rules[rule.key] = (event.currentTarget as HTMLSelectElement).value || null)}
						/>
					{/snippet}
				</Field>
			{/each}
		</div>
	</CardBody>
</Card>

<div class="workspace">
	<nav aria-label="Presets">
		<List bordered>
			{#each watermarks.presets as preset (preset.id)}
				{@const uses = usage(preset.id)}
				<ListItem
					title={preset.name}
					description={uses.length ? uses.join(', ') : 'Not in use'}
					selected={preset.id === selectedId}
					interactive
					onclick={() => (selectedId = preset.id)}
				>
					{#snippet trailing()}
						{#if preset.tiled}<Badge size="sm">Tiled</Badge>{/if}
					{/snippet}
				</ListItem>
			{/each}
		</List>
	</nav>

	{#if selected}
		{#key selected.id}
			<WatermarkEditor preset={selected} ondelete={() => (confirmDelete = true)} />
		{/key}
	{/if}
</div>

<Modal
	bind:open={confirmDelete}
	title={`Delete “${selected?.name}”?`}
	description="Anything that used this preset will have no watermark until you choose another."
	size="sm"
>
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button tone="danger" onclick={remove}>Delete</Button>
	{/snippet}
</Modal>

<style>
	.rules {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: var(--ui-space-10);
	}
	.workspace {
		display: grid;
		grid-template-columns: 260px minmax(0, 1fr);
		gap: clamp(1.25rem, 2.5vw, 2rem);
		align-items: start;
		margin-top: var(--ui-space-16);
	}
	@media (max-width: 900px) {
		.workspace {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
