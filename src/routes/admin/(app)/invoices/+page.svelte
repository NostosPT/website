<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Alert,
		Badge,
		Button,
		Card,
		EmptyState,
		Input,
		Menu,
		MenuItem,
		Stat,
		Table,
		TableCell,
		TableHeaderCell,
		TableRow,
		Tabs
	} from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { documentStatus, documentTypes, invoices, totalOf } from '$lib/admin/invoices/store.svelte';
	import type { DocumentType } from '$lib/admin/invoices/types';
	import { settings } from '$lib/admin/settings/store.svelte';
	import { formatDate, formatMoney } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let tab = $state<'ALL' | DocumentType>('ALL');
	let query = $state('');

	let tabs = $derived([
		{ value: 'ALL', label: 'All' },
		...(Object.keys(documentTypes) as DocumentType[]).map((type) => ({
			value: type,
			label: documentTypes[type].plural,
			badge: invoices.items.filter((d) => d.type === type).length || undefined
		}))
	]);

	let rows = $derived(
		invoices.items
			.filter((d) => tab === 'ALL' || d.type === tab)
			.filter((d) => {
				const q = query.trim().toLowerCase();
				return !q || (d.number ?? 'draft').toLowerCase().includes(q) || (clients.get(d.clientId)?.name ?? '').toLowerCase().includes(q);
			})
			.sort((a, b) => b.issueDate.localeCompare(a.issueDate))
	);

	let openQuotes = $derived(
		invoices.items.filter((d) => d.type === 'QUOTE' && d.status === 'SENT').reduce((s, d) => s + totalOf(d), 0)
	);
</script>

<PageHeader
	kicker="Business"
	title="Quotes & invoices"
	description="Draft here; numbers, ATCUD and PDFs come from the certified invoicing provider when a document is issued."
>
	{#snippet actions()}
		<Menu ariaLabel="New document">
			{#snippet trigger({ toggle }: { toggle: () => void })}
				<Button icon="plus" trailingIcon="chevron-down" onclick={toggle}>New</Button>
			{/snippet}
			{#each ['QUOTE', 'PROFORMA', 'INVOICE'] as const as type (type)}
				<MenuItem icon="receipt" href={`/admin/invoices/new?type=${type}`}>{documentTypes[type].label}</MenuItem>
			{/each}
		</Menu>
	{/snippet}
</PageHeader>

{#if settings.invoicing.state !== 'connected'}
	<Alert tone="info" title={`${settings.providerName ?? 'No provider'} · ${settings.invoicing.state}`}>
		Documents issued now are sandbox copies. Connect the live account in <a class="inline" href="/admin/settings?tab=integrations">Settings</a>
		before issuing real invoices.
	</Alert>
{/if}

<div class="stats">
	<Card padding="md"><Stat label="Outstanding" value={formatMoney(invoices.outstandingCents)} hint={`${invoices.outstanding.length} unpaid invoices`} /></Card>
	<Card padding="md"><Stat label="Overdue" value={String(invoices.overdue.length)} hint="Past their due date" /></Card>
	<Card padding="md"><Stat label="Paid, last 30 days" value={formatMoney(invoices.paidInLast(30))} /></Card>
	<Card padding="md"><Stat label="Open quotes" value={formatMoney(openQuotes)} hint="Sent, awaiting a reply" /></Card>
</div>

<div class="bar">
	<Tabs items={tabs} bind:value={tab} ariaLabel="Document type" />
	<div class="search"><Input bind:value={query} icon="search" size="sm" placeholder="Number or client" clearable /></div>
</div>

{#if rows.length}
	<Table>
		<thead>
			<TableRow>
				<TableHeaderCell>Number</TableHeaderCell>
				<TableHeaderCell>Client</TableHeaderCell>
				<TableHeaderCell>Date</TableHeaderCell>
				<TableHeaderCell>Due</TableHeaderCell>
				<TableHeaderCell>Status</TableHeaderCell>
				<TableHeaderCell numeric>Total</TableHeaderCell>
			</TableRow>
		</thead>
		<tbody>
			{#each rows as doc (doc.id)}
				{@const s = documentStatus[doc.status]}
				<TableRow interactive onclick={() => goto(`/admin/invoices/${doc.id}`)}>
					<TableCell>
						<span class="number">
							<a href={`/admin/invoices/${doc.id}`} onclick={(e) => e.stopPropagation()}>{doc.number ?? 'Draft'}</a>
							<small>{documentTypes[doc.type].label}{doc.issued ? ` · ${doc.issued.atcud}` : ''}</small>
						</span>
					</TableCell>
					<TableCell>{clients.get(doc.clientId)?.name ?? '—'}</TableCell>
					<TableCell muted>{formatDate(doc.issueDate)}</TableCell>
					<TableCell muted>{formatDate(doc.dueDate)}</TableCell>
					<TableCell><Badge tone={s.tone} size="sm">{s.label}</Badge></TableCell>
					<TableCell numeric>{formatMoney(totalOf(doc), doc.currency)}</TableCell>
				</TableRow>
			{/each}
		</tbody>
	</Table>
{:else}
	<EmptyState icon="receipt" title="Nothing here yet" description="Quotes and invoices you draft appear here." bordered />
{/if}

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: var(--ui-space-8);
		margin: var(--ui-space-12) 0;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--ui-space-8);
		margin-bottom: var(--ui-space-10);
	}
	.search {
		width: min(100%, 240px);
		padding-bottom: var(--ui-space-3);
	}
	.number {
		display: grid;
	}
	.number a {
		font-weight: var(--ui-weight-medium);
		color: inherit;
		text-decoration: none;
	}
	.number a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	small {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.inline {
		color: inherit;
	}
</style>
