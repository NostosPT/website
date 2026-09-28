<script lang="ts">
	import { Badge, Icon } from '@nostospt/ui';
	import { photos } from '$lib/admin/photos/store.svelte';
	import Kicker from '$lib/admin/shared/Kicker.svelte';
	import { formatDate, pluralize } from '$lib/admin/shared/format';
	import { statusOf, albumStatusStatus } from '$lib/admin/shared/status';
	import { albums } from './store.svelte';
	import type { Album } from './types';

	/** Mirrors the public site's card: grayscale at rest, colour on hover. */
	let { album }: { album: Album } = $props();

	let cover = $derived(photos.get(albums.coverOf(album)));
	let status = $derived(statusOf(albumStatusStatus, album.status));
</script>

<a class="card" href={`/admin/albums/${album.id}`}>
	<div class="media">
		{#if cover?.urls?.thumbnail}
			<img src={cover.urls.thumbnail} alt="" loading="lazy" />
		{:else}
			<Icon name="bookmark" size={22} />
		{/if}
		<span class="badge"><Badge tone={status.tone} size="sm" variant="surface">{status.label}</Badge></span>
	</div>
	<div class="body">
		<Kicker as="span">{pluralize(album.photoIds.length, 'photo')} · {album.publishedAt ? `Published ${formatDate(album.publishedAt)}` : 'Not published'}</Kicker>
		<h2>{album.title}</h2>
		{#if album.description}<p>{album.description}</p>{/if}
	</div>
</a>

<style>
	.card {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		color: inherit;
		text-decoration: none;
		background: var(--ui-bg-surface);
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-md);
		transition:
			border-color var(--ui-duration-normal) var(--ui-ease-out),
			transform var(--ui-duration-normal) var(--ui-ease-out);
	}
	.card:hover {
		border-color: var(--ui-accent-border);
		transform: translateY(-2px);
	}
	.media {
		position: relative;
		display: grid;
		place-items: center;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: var(--nostos-photo-mat);
		border-bottom: 1px solid var(--ui-border-default);
		color: var(--ui-fg-faint);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1);
		transition:
			filter 0.4s ease,
			transform 0.4s ease;
	}
	.card:hover img {
		filter: grayscale(0);
		transform: scale(1.02);
	}
	.badge {
		position: absolute;
		top: var(--ui-space-6);
		left: var(--ui-space-6);
	}
	.body {
		display: grid;
		gap: var(--ui-space-3);
		padding: var(--ui-space-8);
	}
	h2 {
		margin: var(--ui-space-2) 0 0;
		font: 400 1.2rem/1.2 var(--ui-font-serif);
	}
	p {
		margin: 0;
		font-size: var(--ui-text-sm);
		line-height: var(--ui-leading-normal);
		color: var(--ui-fg-muted);
	}
	@media (prefers-reduced-motion: reduce) {
		.card,
		img {
			transition: none;
		}
	}
</style>
