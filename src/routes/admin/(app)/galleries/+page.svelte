<script lang="ts">
	import { page } from '$app/state';
	import {
		Avatar,
		Badge,
		Button,
		EmptyState,
		Input,
		Progress,
		Table,
		TableCell,
		TableHeaderCell,
		TableRow,
		Tabs,
		toast
	} from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import GalleryFormDialog from '$lib/admin/galleries/GalleryFormDialog.svelte';
	import { galleries, galleryStatus } from '$lib/admin/galleries/store.svelte';
	import type { GalleryStatus } from '$lib/admin/galleries/types';
	import { services } from '$lib/admin/services/store.svelte';
	import { formatRelative } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let creating = $state(page.url.searchParams.has('new'));
	let tab = $state<'ALL' | GalleryStatus>('ALL');
	let query = $state('');

	const count = (status: GalleryStatus) => galleries.items.filter((g) => g.status === status).length;
	let tabs = $derived([
		{ value: 'ALL', label: 'All', badge: galleries.items.length },
		{ value: 'PUBLISHED', label: 'Shared', badge: count('PUBLISHED') },
		{ value: 'DRAFT', label: 'Drafts', badge: count('DRAFT') },
		{ value: 'ARCHIVED', label: 'Archived', badge: count('ARCHIVED') }
	]);

	let rows = $derived(
		galleries.items
			.filter((g) => tab === 'ALL' || g.status === tab)
			.filter((g) => {
				const q = query.trim().toLowerCase();
				return !q || g.title.toLowerCase().includes(q) || (clients.get(g.clientId)?.name ?? '').toLowerCase().includes(q);
			})
	);

	const soon = (iso: string | null) => iso !== null && new Date(iso).getTime() - Date.now() < 7 * 86_400_000;

	async function copyLink(url: string) {
		await navigator.clipboard.writeText(url);
		toast.success('Link copied');
	}
</script>

<PageHeader
	kicker="Studio"
	title="Galleries"
	description="Private deliveries for clients: shared by link and an optional access code, with favourites for proofing."
>
	{#snippet actions()}
		<Button icon="plus" onclick={() => (creating = true)}>New gallery</Button>
	{/snippet}
</PageHeader>

<div class="bar">
	<Tabs items={tabs} bind:value={tab} ariaLabel="Gallery status" />
	<div class="search"><Input bind:value={query} icon="search" placeholder="Gallery or client" size="sm" clearable /></div>
</div>

{#if rows.length}
	<Table>
		<thead>
			<TableRow>
				<TableHeaderCell>Gallery</TableHeaderCell>
				<TableHeaderCell>Service</TableHeaderCell>
				<TableHeaderCell>Status</TableHeaderCell>
				<TableHeaderCell width="180px">Favourites</TableHeaderCell>
				<TableHeaderCell>Open until</TableHeaderCell>
				<TableHeaderCell numeric>Views</TableHeaderCell>
				<TableHeaderCell width="48px"><span class="ui-sr-only">Copy link</span></TableHeaderCell>
			</TableRow>
		</thead>
		<tbody>
			{#each rows as gallery (gallery.id)}
				{@const client = clients.get(gallery.clientId)}
				{@const status = galleryStatus[gallery.status]}
				{@const picked = galleries.selectedCount(gallery)}
				<TableRow>
					<TableCell>
						<a class="gallery" href={`/admin/galleries/${gallery.id}`}>
							<Avatar name={client?.name ?? '?'} size="sm" />
							<span>
								<strong>{gallery.title}</strong>
								<small>{client?.name}{gallery.hasAccessCode ? ' · code' : ' · link only'}</small>
							</span>
						</a>
					</TableCell>
					<TableCell muted>{services.get(gallery.serviceId)?.name ?? '—'}</TableCell>
					<TableCell><Badge tone={status.tone} size="sm">{status.label}</Badge></TableCell>
					<TableCell>
						{#if gallery.selectionLimit}
							<Progress value={picked} max={gallery.selectionLimit} size="sm" showValue label={`${picked} of ${gallery.selectionLimit}`} />
						{:else}
							<span class="muted">{picked} of {gallery.photos.length}</span>
						{/if}
					</TableCell>
					<TableCell>
						{#if gallery.expiresAt}
							<span class:warn={gallery.status === 'PUBLISHED' && soon(gallery.expiresAt)}>{formatRelative(gallery.expiresAt)}</span>
						{:else}—{/if}
					</TableCell>
					<TableCell numeric muted>{gallery.views}</TableCell>
					<TableCell align="end">
						<Button size="xs" variant="ghost" tone="neutral" iconOnly icon="link" label="Copy link" onclick={() => copyLink(galleries.shareUrl(gallery))} />
					</TableCell>
				</TableRow>
			{/each}
		</tbody>
	</Table>
{:else}
	<EmptyState icon="share-2" title="No galleries here" description="Create a gallery to deliver photographs to a client." bordered>
		{#snippet actions()}
			<Button icon="plus" onclick={() => (creating = true)}>New gallery</Button>
		{/snippet}
	</EmptyState>
{/if}

<GalleryFormDialog bind:open={creating} />

<style>
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--ui-space-8);
		margin-bottom: var(--ui-space-10);
	}
	.search {
		width: min(100%, 260px);
		padding-bottom: var(--ui-space-3);
	}
	.gallery {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-6);
		color: inherit;
		text-decoration: none;
	}
	.gallery span {
		display: grid;
	}
	.gallery strong {
		font: 400 var(--ui-text-md) / 1.3 var(--ui-font-serif);
	}
	.gallery:hover strong {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.gallery small,
	.muted {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.warn {
		color: var(--ui-warning-text);
	}
</style>
