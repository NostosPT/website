<script lang="ts">
	import { Checkbox, Icon, Tooltip } from '@nostospt/ui';
	import Kicker from '$lib/admin/shared/Kicker.svelte';
	import { photoNumber } from '$lib/admin/shared/format';
	import type { Photo } from './types';

	/**
	 * A photograph on a sunken mat, uncropped, with an archival caption,
	 * like a contact sheet rather than a feed.
	 */
	let {
		photo,
		href,
		selectable = false,
		selected = false,
		ontoggle,
		dimmed = false
	}: {
		photo: Photo;
		href?: string;
		selectable?: boolean;
		selected?: boolean;
		ontoggle?: () => void;
		dimmed?: boolean;
	} = $props();
</script>

<article class="tile" data-selected={selected || undefined} data-dimmed={dimmed || undefined}>
	<svelte:element this={href ? 'a' : 'div'} {href} class="mat">
		{#if photo.urls?.thumbnail}
			<img src={photo.urls.thumbnail} alt={photo.title ?? photoNumber(photo.number)} loading="lazy" decoding="async" />
		{:else}
			<Icon name="image" size={24} />
		{/if}
	</svelte:element>

	{#if selectable}
		<span class="check">
			<Checkbox
				checked={selected}
				onchange={() => ontoggle?.()}
				aria-label={`Select ${photoNumber(photo.number)}`}
			/>
		</span>
	{/if}

	<div class="caption">
		<div class="text">
			<Kicker as="span">{photoNumber(photo.number)}{photo.category ? ` · ${photo.category}` : ''}</Kicker>
			<span class="title">{photo.title ?? 'Untitled'}</span>
		</div>
		<span class="flags">
			{#if photo.visibility !== 'PUBLIC'}
				<Tooltip content={photo.visibility === 'PRIVATE' ? 'Private' : 'Unlisted'}>
					<Icon name={photo.visibility === 'PRIVATE' ? 'lock' : 'eye-off'} size={14} />
				</Tooltip>
			{/if}
			{#if photo.watermarked}
				<Tooltip content="Watermarked previews">
					<Icon name="typography" size={14} />
				</Tooltip>
			{/if}
		</span>
	</div>
</article>

<style>
	.tile {
		position: relative;
		display: grid;
		gap: var(--ui-space-4);
		min-width: 0;
	}
	.mat {
		position: relative;
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		background: var(--nostos-photo-mat);
		border: 1px solid var(--ui-border-subtle);
		border-radius: var(--ui-radius-sm);
		color: var(--ui-fg-faint);
		transition:
			border-color var(--ui-duration-fast) var(--ui-ease-out),
			box-shadow var(--ui-duration-fast) var(--ui-ease-out);
	}
	a.mat:hover {
		border-color: var(--ui-border-strong);
	}
	img {
		position: absolute;
		inset: 8%;
		width: 84%;
		height: 84%;
		object-fit: contain;
		filter: drop-shadow(0 1px 2px rgb(0 0 0 / 0.14));
	}
	.tile[data-selected] .mat {
		border-color: var(--ui-accent-solid);
		box-shadow: 0 0 0 2px var(--ui-accent-ring);
	}
	.tile[data-dimmed] img {
		opacity: 0.45;
	}
	.check {
		position: absolute;
		top: var(--ui-space-4);
		left: var(--ui-space-4);
		padding: 2px;
		border-radius: var(--ui-radius-xs);
		background: var(--ui-bg-surface);
		opacity: 0;
		transition: opacity var(--ui-duration-fast) var(--ui-ease-out);
	}
	.tile:hover .check,
	.tile:focus-within .check,
	.tile[data-selected] .check {
		opacity: 1;
	}
	.caption {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--ui-space-4);
	}
	.text {
		display: grid;
		gap: var(--ui-space-2);
		min-width: 0;
	}
	.title {
		overflow: hidden;
		font: 400 var(--ui-text-md) / 1.3 var(--ui-font-serif);
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.flags {
		display: inline-flex;
		gap: var(--ui-space-3);
		color: var(--ui-fg-subtle);
	}
	@media (hover: none) {
		.check {
			opacity: 1;
		}
	}
</style>
