<script lang="ts">
	import { Avatar, Icon } from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { services } from '$lib/admin/services/store.svelte';
	import Kicker from '$lib/admin/shared/Kicker.svelte';
	import { formatMoney, formatPriceRange, formatShortDate } from '$lib/admin/shared/format';
	import { team } from '$lib/admin/team/store.svelte';
	import type { ServiceRequest } from './types';

	let { request, onopen }: { request: ServiceRequest; onopen: () => void } = $props();

	let client = $derived(clients.get(request.clientId));
	let service = $derived(services.get(request.serviceId));
	let assignee = $derived(team.get(request.assigneeId));
</script>

<button type="button" class="card" onclick={onopen}>
	<Kicker as="span">{request.reference}</Kicker>
	<span class="title">{request.title}</span>
	<span class="client">{client?.company ?? client?.name}</span>
	<span class="meta">
		{#if service}<span><Icon name={service.icon} size={13} /> {service.name}</span>{/if}
		{#if request.project.date}<span><Icon name="calendar" size={13} /> {formatShortDate(request.project.date)}</span>{/if}
	</span>
	<span class="foot">
		<span class="value">
			{#if request.quoteCents != null}
				{formatMoney(request.quoteCents)}
			{:else if request.estimate}
				<span class="estimate">{formatPriceRange(request.estimate.fromCents, request.estimate.toCents)}</span>
			{/if}
		</span>
		{#if assignee}<Avatar name={assignee.name} size="xs" />{/if}
	</span>
</button>

<style>
	.card {
		display: grid;
		gap: var(--ui-space-3);
		width: 100%;
		padding: var(--ui-space-7) var(--ui-space-8);
		text-align: left;
		background: var(--ui-bg-surface);
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-md);
		box-shadow: var(--ui-shadow-xs);
		cursor: grab;
		transition:
			border-color var(--ui-duration-fast) var(--ui-ease-out),
			box-shadow var(--ui-duration-fast) var(--ui-ease-out);
	}
	.card:hover {
		border-color: var(--ui-border-strong);
		box-shadow: var(--ui-shadow-sm);
	}
	.title {
		font: 400 var(--ui-text-lg) / 1.25 var(--ui-font-serif);
		color: var(--ui-fg-default);
	}
	.client {
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-space-2) var(--ui-space-6);
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.meta span {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-2);
	}
	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: var(--ui-space-3);
		padding-top: var(--ui-space-5);
		border-top: 1px solid var(--ui-border-subtle);
	}
	.value {
		font-size: var(--ui-text-sm);
		font-weight: var(--ui-numeric-weight);
		color: var(--ui-fg-default);
	}
	.estimate {
		font-weight: var(--ui-weight-normal);
		color: var(--ui-fg-muted);
	}
</style>
