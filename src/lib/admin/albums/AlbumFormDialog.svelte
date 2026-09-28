<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Field, Input, Modal, SegmentedControl, Textarea, toast } from '@nostospt/ui';
	import { slugify } from '$lib/admin/shared/format';
	import { albums } from './store.svelte';
	import type { AlbumStatus, AlbumType } from './types';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let title = $state('');
	let description = $state('');
	let status = $state<AlbumStatus>('DRAFT');
	let type = $state<AlbumType>('FREE');
	let submitted = $state(false);

	let error = $derived(submitted && !title.trim() ? 'Give the album a title.' : undefined);

	$effect(() => {
		if (!open) return;
		title = '';
		description = '';
		status = 'DRAFT';
		type = 'FREE';
		submitted = false;
	});

	function create(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (error) return;
		const album = albums.create({ title: title.trim(), description: description.trim() || null, status, type });
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
		<Field label="Status">
			{#snippet control()}
				<SegmentedControl
					bind:value={status}
					ariaLabel="Album status"
					items={[
						{ value: 'DRAFT', label: 'Draft' },
						{ value: 'PUBLISHED', label: 'Published' },
						{ value: 'ARCHIVED', label: 'Archived' }
					]}
					block
				/>
			{/snippet}
		</Field>
		<Field label="Type" optional>
			{#snippet control()}
				<SegmentedControl
					bind:value={type}
					ariaLabel="Album type"
					items={[
						{ value: 'FREE', label: 'Free' },
						{ value: 'WATERMARK', label: 'Watermark' },
						{ value: 'PAID', label: 'Paid' }
					]}
					block
				/>
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
