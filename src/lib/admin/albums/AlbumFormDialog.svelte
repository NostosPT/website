<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Field, Input, Modal, SegmentedControl, Select, Textarea, toast } from '@nostospt/ui';
	import { slugify } from '$lib/admin/shared/format';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { albums } from './store.svelte';
	import type { AlbumStatus, AlbumType } from './types';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let title = $state('');
	let description = $state('');
	let clientId = $state('');
	let status = $state<AlbumStatus>('DRAFT');
	let type = $state<AlbumType>('FREE');
	let submitted = $state(false);

	let error = $derived(submitted && !title.trim() ? 'Give the album a title.' : undefined);
	let clientError = $derived(submitted && !clientId ? 'Choose the client who owns this album.' : undefined);

	$effect(() => {
		if (!open) return;
		title = '';
		description = '';
		clientId = clients.items.length === 1 ? (clients.items[0]?.id ?? '') : '';
		status = 'DRAFT';
		type = 'FREE';
		submitted = false;
	});

	async function create(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (error || clientError) return;
		try {
			// Real backend first (Website API → Real API, needs a real client).
			const album = await albums.createRemote(
				{ title: title.trim(), description: description.trim() || null, status, type },
				clientId
			);
			open = false;
			toast.success(`�?o${album.title}�?? created`);
			goto(`/admin/albums/${album.id}`);
		} catch {
			// Offline backend: local-only album.
			const album = albums.create({ title: title.trim(), description: description.trim() || null, status, type });
			open = false;
			toast.success(`�?o${album.title}�?? created`);
			goto(`/admin/albums/${album.id}`);
		}
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
		<Field label="Client" error={clientError}>
			{#snippet control({ id }: { id: string })}
				<Select {id} bind:value={clientId} options={clients.options} placeholder="Select a client" invalid={Boolean(clientError)} />
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
