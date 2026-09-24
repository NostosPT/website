<script lang="ts">
	import { Button, EmptyState, Input, Modal } from '@nostospt/ui';
	import PhotoTile from './PhotoTile.svelte';
	import { photos } from './store.svelte';

	/** Choose archive photos to add to an album or gallery. */
	let {
		open = $bindable(false),
		title = 'Add photos',
		exclude = [],
		onconfirm
	}: {
		open?: boolean;
		title?: string;
		exclude?: string[];
		onconfirm: (ids: string[]) => void;
	} = $props();

	let query = $state('');
	let picked = $state<string[]>([]);

	let results = $derived(
		photos
			.filter({ query, category: '', visibility: 'ALL', availability: 'ALL' })
			.filter((p) => !exclude.includes(p.id))
	);

	$effect(() => {
		if (open) picked = [];
	});

	function toggle(id: string) {
		picked = picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id];
	}
</script>

<Modal bind:open {title} description="Photos already added are hidden." size="xl">
	<div class="picker">
		<Input bind:value={query} icon="search" placeholder="Search by Nº, title, place or tag" clearable />
		{#if results.length === 0}
			<EmptyState icon="image" title="No photos to add" size="sm" />
		{:else}
			<div class="grid">
				{#each results as photo (photo.id)}
					<PhotoTile
						{photo}
						selectable
						selected={picked.includes(photo.id)}
						ontoggle={() => toggle(photo.id)}
					/>
				{/each}
			</div>
		{/if}
	</div>

	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button
			disabled={!picked.length}
			onclick={() => {
				onconfirm(picked);
				close();
			}}
		>
			{picked.length ? `Add ${picked.length}` : 'Add'}
		</Button>
	{/snippet}
</Modal>

<style>
	.picker {
		display: grid;
		gap: var(--ui-space-8);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: var(--ui-space-8);
		max-height: 60vh;
		overflow-y: auto;
		padding: var(--ui-space-2);
	}
</style>
