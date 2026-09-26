<script lang="ts">
	import { Button, Modal, toast } from '@nostospt/ui';
	import { goto } from '$app/navigation';
	import PhotoEditor from '$lib/admin/photos/PhotoEditor.svelte';
	import { photos } from '$lib/admin/photos/store.svelte';
	import { photoNumber } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let { data } = $props();
	let photo = $derived(data.photo);
	let confirmDelete = $state(false);

	function remove() {
		photos.remove([photo.id]);
		toast(`${photoNumber(photo.number)} deleted`);
		goto('/admin/photos');
	}
</script>

<PageHeader
	kicker={`${photoNumber(photo.number)}${photo.category ? ` · ${photo.category}` : ''}`}
	title={photo.title ?? 'Untitled'}
	back={{ href: '/admin/photos', label: 'Photos' }}
	detail
>
	{#snippet actions()}
		<Button
			variant="outline"
			icon="external-link"
			href={`/archive/${photo.number}`}
			target="_blank"
			rel="noopener noreferrer"
			disabled={photo.visibility === 'PRIVATE'}
		>
			View in archive
		</Button>
		<Button variant="soft" tone="danger" icon="trash" onclick={() => (confirmDelete = true)}>Delete</Button>
	{/snippet}
</PageHeader>

{#key photo.id}
	<PhotoEditor {photo} />
{/key}

<Modal
	bind:open={confirmDelete}
	title={`Delete ${photoNumber(photo.number)}?`}
	description="The original and its renditions are removed from storage. The Photo ID is never reused."
	size="sm"
>
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button tone="danger" onclick={remove}>Delete</Button>
	{/snippet}
</Modal>
