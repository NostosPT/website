<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Badge,
		Card,
		SegmentedControl,
		Stat,
		Table,
		TableCell,
		TableHeaderCell,
		TableRow,
		toast
	} from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import RequestCard from '$lib/admin/pipeline/RequestCard.svelte';
	import RequestDialog from '$lib/admin/pipeline/RequestDialog.svelte';
	import { pipeline, stages, stageStatus } from '$lib/admin/pipeline/store.svelte';
	import type { Stage } from '$lib/admin/pipeline/types';
	import { services } from '$lib/admin/services/store.svelte';
	import { formatDate, formatMoney, formatPriceRange } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let view = $state<'board' | 'list'>('board');
	let dragging = $state<string | null>(null);
	let over = $state<Stage | null>(null);

	// `?request=` opens a request, so other pages can link straight to one.
	let openId = $derived(page.url.searchParams.get('request'));
	let openRequest = $derived(pipeline.get(openId));
	let dialogOpen = $state(false);
	$effect(() => {
		dialogOpen = Boolean(openRequest);
	});

	function show(id: string | null) {
		const url = new URL(page.url);
		if (id) url.searchParams.set('request', id);
		else url.searchParams.delete('request');
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}

	$effect(() => {
		if (!dialogOpen && openId) show(null);
	});

	function drop(stage: Stage) {
		const request = pipeline.get(dragging);
		if (request && request.stage !== stage) {
			pipeline.move(request.id, stage);
			toast(`${request.reference} → ${stageStatus[stage].label}`);
		}
		dragging = over = null;
	}

	let closed = $derived(pipeline.items.filter((r) => r.stage === 'COMPLETED' || r.stage === 'LOST'));
	let winRate = $derived(
		closed.length ? Math.round((closed.filter((r) => r.stage === 'COMPLETED').length / closed.length) * 100) : 0
	);
	const columnValue = (stage: Stage) =>
		pipeline.byStage(stage).reduce((sum, r) => sum + (r.quoteCents ?? r.estimate?.fromCents ?? 0), 0);
</script>

<PageHeader
	kicker="Studio"
	title="Pipeline"
	description="Every request, from the first message to delivery. Estimates are ranges; the quote is the promise."
>
	{#snippet actions()}
		<SegmentedControl
			bind:value={view}
			ariaLabel="View"
			items={[
				{ value: 'board', label: 'Board', icon: 'board' },
				{ value: 'list', label: 'List', icon: 'list' }
			]}
		/>
	{/snippet}
</PageHeader>

<div class="stats">
	<Card padding="md"><Stat label="New requests" value={String(pipeline.newCount)} hint="Waiting for a first reply" /></Card>
	<Card padding="md"><Stat label="Open quotes" value={formatMoney(pipeline.quotedValueCents)} hint="Net, awaiting the client" /></Card>
	<Card padding="md"><Stat label="Booked ahead" value={String(pipeline.upcoming.length)} hint="Confirmed shoots" /></Card>
	<Card padding="md"><Stat label="Win rate" value={`${winRate}%`} hint="Completed vs lost" /></Card>
</div>

{#if view === 'board'}
	<div class="board">
		{#each stages as stage (stage.key)}
			{@const items = pipeline.byStage(stage.key)}
			<section
				class="column"
				data-over={over === stage.key || undefined}
				aria-label={stage.label}
				ondragover={(e) => (e.preventDefault(), (over = stage.key))}
				ondragleave={() => over === stage.key && (over = null)}
				ondrop={(e) => (e.preventDefault(), drop(stage.key))}
			>
				<header>
					<span class="name">
						<Badge tone={stageStatus[stage.key].tone} variant="dot" size="sm">{stage.label}</Badge>
						<span class="count">{items.length}</span>
					</span>
					<span class="sum">{columnValue(stage.key) ? formatMoney(columnValue(stage.key)) : ''}</span>
				</header>
				<p class="hint">{stage.hint}</p>
				<ul>
					{#each items as request (request.id)}
						<li
							draggable="true"
							ondragstart={(e) => {
								dragging = request.id;
								e.dataTransfer?.setData('text/plain', request.id);
							}}
							ondragend={() => (dragging = over = null)}
							data-dragging={dragging === request.id || undefined}
						>
							<RequestCard {request} onopen={() => show(request.id)} />
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
{:else}
	<Table>
		<thead>
			<TableRow>
				<TableHeaderCell>Request</TableHeaderCell>
				<TableHeaderCell>Client</TableHeaderCell>
				<TableHeaderCell>Service</TableHeaderCell>
				<TableHeaderCell>Stage</TableHeaderCell>
				<TableHeaderCell>Date</TableHeaderCell>
				<TableHeaderCell numeric>Value</TableHeaderCell>
			</TableRow>
		</thead>
		<tbody>
			{#each pipeline.items as request (request.id)}
				{@const s = stageStatus[request.stage]}
				<TableRow interactive onclick={() => show(request.id)}>
					<TableCell><strong class="req">{request.title}</strong> <small>{request.reference}</small></TableCell>
					<TableCell>{clients.get(request.clientId)?.name}</TableCell>
					<TableCell muted>{services.get(request.serviceId)?.name}</TableCell>
					<TableCell><Badge tone={s.tone} size="sm">{s.label}</Badge></TableCell>
					<TableCell muted>{request.project.date ? formatDate(request.project.date) : '—'}</TableCell>
					<TableCell numeric>
						{request.quoteCents != null
							? formatMoney(request.quoteCents)
							: formatPriceRange(request.estimate?.fromCents ?? null, request.estimate?.toCents ?? null)}
					</TableCell>
				</TableRow>
			{/each}
		</tbody>
	</Table>
{/if}

{#if openRequest}
	{#key openRequest.id}
		<RequestDialog request={openRequest} bind:open={dialogOpen} />
	{/key}
{/if}

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
		gap: var(--ui-space-8);
		margin-bottom: var(--ui-space-12);
	}
	.board {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(250px, 1fr);
		gap: var(--ui-space-8);
		overflow-x: auto;
		padding-bottom: var(--ui-space-8);
	}
	.column {
		display: flex;
		flex-direction: column;
		gap: var(--ui-space-4);
		min-height: 320px;
		padding: var(--ui-space-6);
		background: var(--ui-bg-muted);
		border: 1px solid transparent;
		border-radius: var(--ui-radius-lg);
		transition:
			background-color var(--ui-duration-fast) var(--ui-ease-out),
			border-color var(--ui-duration-fast) var(--ui-ease-out);
	}
	.column[data-over] {
		background: var(--ui-accent-soft);
		border-color: var(--ui-accent-border);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.name {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-4);
	}
	.count,
	.sum,
	.hint {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.hint {
		margin: 0 0 var(--ui-space-4);
	}
	ul {
		display: grid;
		gap: var(--ui-space-6);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li[data-dragging] {
		opacity: 0.45;
	}
	.req {
		font: 400 var(--ui-text-md) / 1.3 var(--ui-font-serif);
	}
	small {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
</style>
