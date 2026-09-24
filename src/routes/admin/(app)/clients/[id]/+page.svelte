<script lang="ts">
	import {
		Avatar,
		Badge,
		Button,
		Card,
		CardBody,
		CardHeader,
		DataList,
		DataListRow,
		EmptyState,
		List,
		ListItem,
		Stat,
		TabPanel,
		Tabs,
		Tag
	} from '@nostospt/ui';
	import ClientFormDialog from '$lib/admin/clients/ClientFormDialog.svelte';
	import ClientTimeline from '$lib/admin/clients/ClientTimeline.svelte';
	import { clientStatus } from '$lib/admin/clients/store.svelte';
	import GalleryFormDialog from '$lib/admin/galleries/GalleryFormDialog.svelte';
	import { galleries, galleryStatus } from '$lib/admin/galleries/store.svelte';
	import { documentStatus, documentTypes, invoices, totalOf } from '$lib/admin/invoices/store.svelte';
	import { mail } from '$lib/admin/mail/store.svelte';
	import { pipeline, stageStatus } from '$lib/admin/pipeline/store.svelte';
	import { services } from '$lib/admin/services/store.svelte';
	import { formatDate, formatMoney, formatRelative } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let { data } = $props();
	let client = $derived(data.client);

	let editing = $state(false);
	let newGallery = $state(false);
	let tab = $state('timeline');

	let requests = $derived(pipeline.forClient(client.id));
	let clientGalleries = $derived(galleries.forClient(client.id));
	let documents = $derived(invoices.forClient(client.id));
	let threads = $derived(mail.forClient(client.id));
	let outstanding = $derived(
		documents.filter((d) => d.type === 'INVOICE' && ['SENT', 'ISSUED', 'OVERDUE'].includes(d.status)).reduce((s, d) => s + totalOf(d), 0)
	);
	let status = $derived(clientStatus[client.status]);

	const tabs = [
		{ value: 'timeline', label: 'Timeline' },
		{ value: 'requests', label: 'Requests' },
		{ value: 'galleries', label: 'Galleries' },
		{ value: 'documents', label: 'Quotes & invoices' },
		{ value: 'mail', label: 'Mail' }
	];
</script>

<PageHeader
	kicker={`Client since ${formatDate(client.createdAt)}`}
	title={client.name}
	back={{ href: '/admin/clients', label: 'Clients' }}
	detail
>
	{#snippet meta()}
		<Badge tone={status.tone}>{status.label}</Badge>
		{#if client.company}<span class="company">{client.company}</span>{/if}
	{/snippet}
	{#snippet actions()}
		<Button variant="outline" icon="mail" onclick={() => mail.compose({ to: [client.email] })}>Email</Button>
		<Button variant="outline" icon="receipt" href={`/admin/invoices/new?client=${client.id}&type=QUOTE`}>New quote</Button>
		<Button variant="outline" icon="share-2" onclick={() => (newGallery = true)}>New gallery</Button>
		<Button icon="pencil" onclick={() => (editing = true)}>Edit</Button>
	{/snippet}
</PageHeader>

<div class="stats">
	<Card padding="md"><Stat label="Paid to date" value={formatMoney(invoices.lifetimeValue(client.id))} /></Card>
	<Card padding="md"><Stat label="Outstanding" value={formatMoney(outstanding)} /></Card>
	<Card padding="md"><Stat label="Open requests" value={String(requests.filter((r) => !['COMPLETED', 'LOST'].includes(r.stage)).length)} /></Card>
	<Card padding="md"><Stat label="Galleries" value={String(clientGalleries.length)} /></Card>
</div>

<div class="layout">
	<aside>
		<Card>
			<CardHeader title="Contact" divided>
				{#snippet actions()}<Avatar name={client.name} size="md" />{/snippet}
			</CardHeader>
			<CardBody>
				<DataList size="sm" dividers>
					<DataListRow label="Email">
						{#snippet valueSlot()}<a href={`mailto:${client.email}`}>{client.email}</a>{/snippet}
					</DataListRow>
					<DataListRow label="Phone" value={client.phone ?? '—'} />
					<DataListRow label="NIF" value={client.taxId ?? '—'} />
					<DataListRow label="Address" value={client.address ?? '—'} />
					<DataListRow label="Source" value={client.source} />
					<DataListRow label="Last contact" value={client.lastContactAt ? formatRelative(client.lastContactAt) : '—'} />
				</DataList>
				{#if client.tags.length}
					<div class="tags">{#each client.tags as tag (tag)}<Tag size="sm" label={tag} />{/each}</div>
				{/if}
				{#if client.notes}<p class="notes">{client.notes}</p>{/if}
			</CardBody>
		</Card>
	</aside>

	<section>
		<Tabs items={tabs} bind:value={tab} ariaLabel="Client records">
			<TabPanel value="timeline"><div class="panel"><ClientTimeline clientId={client.id} /></div></TabPanel>

			<TabPanel value="requests">
				<div class="panel">
					{#if requests.length}
						<List bordered>
							{#each requests as request (request.id)}
								{@const s = stageStatus[request.stage]}
								<ListItem
									title={request.title}
									description={`${request.reference} · ${services.get(request.serviceId)?.name} · ${request.project.date ? formatDate(request.project.date) : 'No date yet'}`}
									href={`/admin/pipeline?request=${request.id}`}
								>
									{#snippet trailing()}<Badge tone={s.tone} size="sm">{s.label}</Badge>{/snippet}
								</ListItem>
							{/each}
						</List>
					{:else}
						<EmptyState icon="board" title="No requests" size="sm" />
					{/if}
				</div>
			</TabPanel>

			<TabPanel value="galleries">
				<div class="panel">
					{#if clientGalleries.length}
						<List bordered>
							{#each clientGalleries as gallery (gallery.id)}
								{@const s = galleryStatus[gallery.status]}
								<ListItem
									title={gallery.title}
									description={`${gallery.photos.length} photos · ${galleries.selectedCount(gallery)} favourites`}
									href={`/admin/galleries/${gallery.id}`}
								>
									{#snippet trailing()}<Badge tone={s.tone} size="sm">{s.label}</Badge>{/snippet}
								</ListItem>
							{/each}
						</List>
					{:else}
						<EmptyState icon="share-2" title="No galleries" size="sm" />
					{/if}
				</div>
			</TabPanel>

			<TabPanel value="documents">
				<div class="panel">
					{#if documents.length}
						<List bordered>
							{#each documents as doc (doc.id)}
								{@const s = documentStatus[doc.status]}
								<ListItem
									title={doc.number ?? `${documentTypes[doc.type].label} draft`}
									description={`${documentTypes[doc.type].label} · ${formatDate(doc.issueDate)}`}
									href={`/admin/invoices/${doc.id}`}
								>
									{#snippet meta()}<span class="amount">{formatMoney(totalOf(doc))}</span>{/snippet}
									{#snippet trailing()}<Badge tone={s.tone} size="sm">{s.label}</Badge>{/snippet}
								</ListItem>
							{/each}
						</List>
					{:else}
						<EmptyState icon="receipt" title="No quotes or invoices" size="sm" />
					{/if}
				</div>
			</TabPanel>

			<TabPanel value="mail">
				<div class="panel">
					{#if threads.length}
						<List bordered>
							{#each threads as thread (thread.id)}
								<ListItem
									title={thread.subject}
									description={thread.messages.at(-1)?.text.slice(0, 90)}
									href={`/admin/mail?thread=${thread.id}`}
								>
									{#snippet meta()}<span class="amount">{formatRelative(thread.updatedAt)}</span>{/snippet}
								</ListItem>
							{/each}
						</List>
					{:else}
						<EmptyState icon="mail" title="No conversations" size="sm" />
					{/if}
				</div>
			</TabPanel>
		</Tabs>
	</section>
</div>

<ClientFormDialog bind:open={editing} {client} />
<GalleryFormDialog bind:open={newGallery} clientId={client.id} />

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--ui-space-8);
		margin-bottom: var(--ui-space-12);
	}
	.layout {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr);
		gap: clamp(1.5rem, 3vw, 2.5rem);
		align-items: start;
	}
	.panel {
		padding-top: var(--ui-space-10);
	}
	.company {
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
	}
	a {
		color: var(--ui-accent-text);
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-space-2);
		margin-top: var(--ui-space-8);
	}
	.notes {
		margin: var(--ui-space-8) 0 0;
		padding-top: var(--ui-space-8);
		border-top: 1px solid var(--ui-border-subtle);
		font-size: var(--ui-text-sm);
		line-height: var(--ui-leading-relaxed);
		color: var(--ui-fg-muted);
	}
	.amount {
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
		white-space: nowrap;
	}
	@media (max-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
