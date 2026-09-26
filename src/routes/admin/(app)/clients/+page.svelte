<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Avatar,
		Badge,
		Button,
		EmptyState,
		Input,
		Pagination,
		SegmentedControl,
		Table,
		TableCell,
		TableHeaderCell,
		TableRow,
		Tag
	} from '@nostospt/ui';
	import ClientFormDialog from '$lib/admin/clients/ClientFormDialog.svelte';
	import { clients, clientStatus } from '$lib/admin/clients/store.svelte';
	import type { Client } from '$lib/admin/clients/types';
	import { invoices } from '$lib/admin/invoices/store.svelte';
	import { pipeline } from '$lib/admin/pipeline/store.svelte';
	import { formatMoney, formatRelative } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	const PAGE_SIZE = 8;

	let creating = $state(page.url.searchParams.has('new'));
	let query = $state('');
	let status = $state('ALL');
	let sort = $state<{ key: 'name' | 'lastContactAt' | 'value'; dir: 'asc' | 'desc' }>({ key: 'lastContactAt', dir: 'desc' });
	let current = $state(1);

	const value = (c: Client) => invoices.lifetimeValue(c.id);

	let rows = $derived.by(() => {
		const q = query.trim().toLowerCase();
		const filtered = clients.items
			.filter((c) => status === 'ALL' || c.status === status)
			.filter((c) => !q || [c.name, c.email, c.company ?? '', ...c.tags].some((f) => f.toLowerCase().includes(q)));
		const factor = sort.dir === 'asc' ? 1 : -1;
		return filtered.sort((a, b) => {
			if (sort.key === 'value') return (value(a) - value(b)) * factor;
			return String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? '')) * factor;
		});
	});
	let pages = $derived(Math.max(1, Math.ceil(rows.length / PAGE_SIZE)));
	let visible = $derived(rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE));

	$effect(() => {
		// Back to the first page whenever the filters change.
		void query;
		void status;
		current = 1;
	});

	function sortBy(key: typeof sort.key) {
		return (dir: 'asc' | 'desc') => (sort = { key, dir });
	}
</script>

<PageHeader kicker="Studio" title="Clients" description="Everyone who commissions work or buys from the archive.">
	{#snippet actions()}
		<Button icon="user-plus" onclick={() => (creating = true)}>New client</Button>
	{/snippet}
</PageHeader>

<div class="filters">
	<div class="search"><Input bind:value={query} icon="search" placeholder="Name, email, company or tag" clearable /></div>
	<SegmentedControl
		bind:value={status}
		ariaLabel="Status"
		items={[{ value: 'ALL', label: 'All' }, ...Object.entries(clientStatus).map(([value, s]) => ({ value, label: s.label }))]}
	/>
</div>

{#if rows.length}
	<Table>
		<thead>
			<TableRow>
				<TableHeaderCell sortable direction={sort.key === 'name' ? sort.dir : undefined} onsort={sortBy('name')}>Client</TableHeaderCell>
				<TableHeaderCell>Status</TableHeaderCell>
				<TableHeaderCell>Tags</TableHeaderCell>
				<TableHeaderCell numeric>Open requests</TableHeaderCell>
				<TableHeaderCell numeric sortable direction={sort.key === 'value' ? sort.dir : undefined} onsort={sortBy('value')}>Paid to date</TableHeaderCell>
				<TableHeaderCell sortable direction={sort.key === 'lastContactAt' ? sort.dir : undefined} onsort={sortBy('lastContactAt')}>Last contact</TableHeaderCell>
			</TableRow>
		</thead>
		<tbody>
			{#each visible as client (client.id)}
				{@const s = clientStatus[client.status]}
				{@const open = pipeline.forClient(client.id).filter((r) => !['COMPLETED', 'LOST'].includes(r.stage)).length}
				<TableRow interactive onclick={() => goto(`/admin/clients/${client.id}`)}>
					<TableCell>
						<span class="who">
							<Avatar name={client.name} size="sm" />
							<span>
								<a href={`/admin/clients/${client.id}`} onclick={(e) => e.stopPropagation()}>{client.name}</a>
								<small>{client.company ?? client.email}</small>
							</span>
						</span>
					</TableCell>
					<TableCell><Badge tone={s.tone} size="sm">{s.label}</Badge></TableCell>
					<TableCell>
						<span class="tags">{#each client.tags as tag (tag)}<Tag size="sm" label={tag} />{/each}</span>
					</TableCell>
					<TableCell numeric muted={!open}>{open || '—'}</TableCell>
					<TableCell numeric>{formatMoney(value(client))}</TableCell>
					<TableCell muted>{client.lastContactAt ? formatRelative(client.lastContactAt) : '—'}</TableCell>
				</TableRow>
			{/each}
		</tbody>
	</Table>
	{#if pages > 1}
		<div class="pagination"><Pagination bind:page={current} total={pages} /></div>
	{/if}
{:else}
	<EmptyState icon="users" title="No clients found" description="Try another search, or add someone new." bordered>
		{#snippet actions()}
			<Button icon="user-plus" onclick={() => (creating = true)}>New client</Button>
		{/snippet}
	</EmptyState>
{/if}

<ClientFormDialog bind:open={creating} />

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-space-6);
		margin-bottom: var(--ui-space-10);
	}
	.search {
		flex: 1 1 260px;
		max-width: 380px;
	}
	.who {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-6);
	}
	.who span {
		display: grid;
	}
	.who a {
		font: 400 var(--ui-text-md) / 1.3 var(--ui-font-serif);
		color: inherit;
		text-decoration: none;
	}
	.who a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.who small {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.tags {
		display: inline-flex;
		flex-wrap: wrap;
		gap: var(--ui-space-2);
	}
	.pagination {
		display: flex;
		justify-content: center;
		margin-top: var(--ui-space-12);
	}
</style>
