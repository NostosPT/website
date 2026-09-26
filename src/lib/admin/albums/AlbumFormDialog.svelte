<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Field, Input, Modal, SegmentedControl, Textarea, toast } from '@nostospt/ui';
	import { slugify } from '$lib/admin/shared/format';
	import { visibilityOptions } from '$lib/admin/shared/status';
	import type { Visibility } from '$lib/admin/photos/types';
	import { albums } from './store.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let title = $state('');
	let description = $state('');
	let visibility = $state<Visibility>('PRIVATE');
	let submitted = $state(false);

	let error = $derived(submitted && !title.trim() ? 'Give the album a title.' : undefined);

	$effect(() => {
		if (!open) return;
		title = '';
		description = '';
		visibility = 'PRIVATE';
		submitted = false;
	});

	function create(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (error) return;
		const album = albums.create({ title: title.trim(), description: description.trim() || null, visibility });
		open = false;
		toast.success(`“${album.title}” created`);
		goto(`/admin/albums/${album.id}`);
	}
</script>

<Modal bind:open title="New album" description="A curated, ordered collection of archive photographs." size="md">
	<form id="album-form" class="form" onsubmit={create}>
		<Field label="Title" {error} hint={title ? `nostos.studio/archive/albums/${slugify(title)}` : undefined}>
			{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
				<Input {id} bind:value={title} placeholder="e.g. The city, slowly" aria-describedby={describedBy} invalid={Boolean(error)} autofocus />
			{/snippet}
		</Field>
		<Field label="Description" optional>
			{#snippet control({ id }: { id: string })}
				<Textarea {id} bind:value={description} rows={3} />
			{/snippet}
		</Field>
		<Field label="Visibility">
			{#snippet control()}
				<SegmentedControl bind:value={visibility} items={visibilityOptions} block ariaLabel="Visibility" />
			{/snippet}
		</Field>
	</form>
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button type="submit" form="album-form">Create album</Button>
	{/snippet}
</Modal>

<style>
	.form {
		display: grid;
		gap: var(--ui-space-10);
	}
</style>
