<script lang="ts">
	import { Badge, Button, Menu, MenuItem, MenuSeparator } from '@nostospt/ui';
	import PhotoTile from '$lib/admin/photos/PhotoTile.svelte';
	import { photos } from '$lib/admin/photos/store.svelte';

	/**
	 * Drag to reorder. Every move is also in each tile's menu, so ordering works
	 * without a pointer.
	 */
	let {
		photoIds,
		coverId,
		onreorder,
		onremove,
		oncover
	}: {
		photoIds: string[];
		coverId: string | null;
		onreorder: (from: number, to: number) => void;
		onremove: (photoId: string) => void;
		oncover: (photoId: string) => void;
	} = $props();

	let dragFrom = $state<number | null>(null);
	let dropAt = $state<number | null>(null);

	function ondragstart(event: DragEvent, index: number) {
		dragFrom = index;
		event.dataTransfer?.setData('text/plain', String(index));
		if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
	}

	function ondrop(event: DragEvent) {
		event.preventDefault();
		if (dragFrom !== null && dropAt !== null) onreorder(dragFrom, dropAt);
		dragFrom = dropAt = null;
	}
</script>

<ol class="grid" aria-label="Photos in order">
	{#each photoIds as id, index (id)}
		{@const photo = photos.get(id)}
		{#if photo}
			<li
				draggable="true"
				data-dragging={dragFrom === index || undefined}
				data-drop-target={dropAt === index && dragFrom !== index || undefined}
				ondragstart={(e) => ondragstart(e, index)}
				ondragover={(e) => (e.preventDefault(), (dropAt = index))}
				ondrop={ondrop}
				ondragend={() => (dragFrom = dropAt = null)}
			>
				<PhotoTile {photo} href={`/admin/photos/${photo.id}`} />
				{#if id === coverId || (!coverId && index === 0)}
					<span class="cover"><Badge size="sm" tone="accent" variant="solid">Cover</Badge></span>
				{/if}
				<span class="menu">
					<Menu ariaLabel={`Actions for Nº ${photo.number}`}>
						{#snippet trigger({ toggle }: { toggle: () => void })}
							<Button size="xs" variant="secondary" iconOnly icon="more-horizontal" label="Photo actions" onclick={toggle} />
						{/snippet}
						<MenuItem icon="star" onselect={() => oncover(id)}>Set as cover</MenuItem>
						<MenuItem icon="arrow-left" disabled={index === 0} onselect={() => onreorder(index, index - 1)}>Move earlier</MenuItem>
						<MenuItem icon="arrow-right" disabled={index === photoIds.length - 1} onselect={() => onreorder(index, index + 1)}>Move later</MenuItem>
						<MenuSeparator />
						<MenuItem icon="minus-circle" tone="danger" onselect={() => onremove(id)}>Remove from album</MenuItem>
					</Menu>
				</span>
			</li>
		{/if}
	{/each}
</ol>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
		gap: var(--ui-space-12) var(--ui-space-8);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		position: relative;
		cursor: grab;
		transition: opacity var(--ui-duration-fast) var(--ui-ease-out);
	}
	li[data-dragging] {
		opacity: 0.4;
	}
	li[data-drop-target]::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(var(--ui-space-4) * -1 - 1px);
		width: 2px;
		background: var(--ui-accent-solid);
	}
	.cover {
		position: absolute;
		top: var(--ui-space-4);
		left: var(--ui-space-4);
	}
	.menu {
		position: absolute;
		top: var(--ui-space-4);
		right: var(--ui-space-4);
		opacity: 0;
		transition: opacity var(--ui-duration-fast) var(--ui-ease-out);
	}
	li:hover .menu,
	li:focus-within .menu {
		opacity: 1;
	}
	@media (hover: none) {
		.menu {
			opacity: 1;
		}
	}
</style>
