<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Badge,
		Button,
		Card,
		CardBody,
		DataList,
		DataListRow,
		Menu,
		MenuItem,
		MenuSeparator,
		Modal,
		TabPanel,
		Tabs,
		toast
	} from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import GalleryPhotos from '$lib/admin/galleries/GalleryPhotos.svelte';
	import GallerySharing from '$lib/admin/galleries/GallerySharing.svelte';
	import { galleries, galleryStatus } from '$lib/admin/galleries/store.svelte';
	import { mail } from '$lib/admin/mail/store.svelte';
	import { fillTemplate, templates } from '$lib/admin/mail/templates';
	import { services } from '$lib/admin/services/store.svelte';
	import { formatDate, formatDateTime, formatRelative } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let { data } = $props();
	let gallery = $derived(data.gallery);
	let client = $derived(clients.get(gallery.clientId));
	let status = $derived(galleryStatus[gallery.status]);

	const tabs = [
		{ value: 'photos', label: 'Photos', icon: 'image' },
		{ value: 'sharing', label: 'Sharing', icon: 'link' },
		{ value: 'activity', label: 'Activity', icon: 'clock' }
	];
	let tab = $state('photos');
	let confirmDelete = $state(false);

	function sendToClient() {
		if (!client) return;
		const template = templates.find((t) => t.id === 'gallery-ready')!;
		const values = {
			firstName: client.name.split(' ')[0],
			gallery: gallery.title,
			link: galleries.shareUrl(gallery),
			code: galleries.revealedCodes[gallery.id] ?? (gallery.hasAccessCode ? '(sent separately)' : 'none needed'),
			expires: formatDate(gallery.expiresAt)
		};
		mail.compose({
			to: [client.email],
			subject: fillTemplate(template.subject, values),
			text: fillTemplate(template.text, values)
		});
	}

	function publish(next: typeof gallery.status) {
		galleries.update(gallery.id, { status: next });
		toast.success(next === 'PUBLISHED' ? 'Gallery shared' : next === 'ARCHIVED' ? 'Gallery archived' : 'Back to draft');
	}

	function remove() {
		galleries.remove(gallery.id);
		toast(`“${gallery.title}” deleted`);
		goto('/admin/galleries');
	}
</script>

<PageHeader
	kicker={`Client gallery · ${client?.name ?? 'Unknown client'}`}
	title={gallery.title}
	back={{ href: '/admin/galleries', label: 'Galleries' }}
	detail
>
	{#snippet meta()}
		<Badge tone={status.tone}>{status.label}</Badge>
		{#if gallery.expiresAt}<span class="meta">Open until {formatDate(gallery.expiresAt)}</span>{/if}
	{/snippet}
	{#snippet actions()}
		<Button variant="outline" icon="send" onclick={sendToClient}>Send to client</Button>
		{#if gallery.status === 'DRAFT'}
			<Button icon="share-2" disabled={!gallery.photos.length} onclick={() => publish('PUBLISHED')}>Share gallery</Button>
		{/if}
		<Menu ariaLabel="More">
			{#snippet trigger({ toggle }: { toggle: () => void })}
				<Button variant="ghost" tone="neutral" iconOnly icon="more-horizontal" label="More actions" onclick={toggle} />
			{/snippet}
			<MenuItem icon="external-link" href={galleries.shareUrl(gallery)} target="_blank">Open as client</MenuItem>
			{#if gallery.status === 'PUBLISHED'}
				<MenuItem icon="eye-off" onselect={() => publish('DRAFT')}>Unshare</MenuItem>
			{/if}
			{#if gallery.status !== 'ARCHIVED'}
				<MenuItem icon="folder" onselect={() => publish('ARCHIVED')}>Archive</MenuItem>
			{/if}
			<MenuSeparator />
			<MenuItem icon="trash" tone="danger" onselect={() => (confirmDelete = true)}>Delete gallery</MenuItem>
		</Menu>
	{/snippet}
</PageHeader>

<Tabs bind:value={tab} ariaLabel="Gallery" items={tabs}>
	<TabPanel value="photos"><div class="panel"><GalleryPhotos {gallery} /></div></TabPanel>
	<TabPanel value="sharing"><div class="panel"><GallerySharing {gallery} /></div></TabPanel>
	<TabPanel value="activity">
		<div class="panel">
			<Card>
				<CardBody>
					<DataList dividers>
						<DataListRow label="Client">
							{#snippet valueSlot()}<a href={`/admin/clients/${client?.id}`}>{client?.name}</a>{/snippet}
						</DataListRow>
						<DataListRow label="Service" value={services.get(gallery.serviceId)?.name ?? '—'} />
						<DataListRow label="Views" value={String(gallery.views)} />
						<DataListRow label="Last viewed" value={gallery.lastViewedAt ? formatRelative(gallery.lastViewedAt) : 'Not yet'} />
						<DataListRow label="Selection submitted" value={gallery.selectionSubmittedAt ? formatDateTime(gallery.selectionSubmittedAt) : 'Not yet'} />
						<DataListRow label="Created" value={formatDateTime(gallery.createdAt)} />
					</DataList>
				</CardBody>
			</Card>
		</div>
	</TabPanel>
</Tabs>

<Modal bind:open={confirmDelete} title={`Delete “${gallery.title}”?`} description="The client link stops working. Photos stay in the archive." size="sm">
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button tone="danger" onclick={remove}>Delete</Button>
	{/snippet}
</Modal>

<style>
	.panel {
		padding-top: var(--ui-space-12);
	}
	.meta {
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-subtle);
	}
	.panel a {
		color: var(--ui-accent-text);
	}
</style>
