<script lang="ts">
	import { Button, ButtonGroup, Card, Icon, Switch, toast } from '@nostospt/ui';
	import { pipeline } from '$lib/admin/pipeline/store.svelte';
	import ServiceDialog from '$lib/admin/services/ServiceDialog.svelte';
	import { services } from '$lib/admin/services/store.svelte';
	import type { Service } from '$lib/admin/services/types';
	import Kicker from '$lib/admin/shared/Kicker.svelte';
	import { formatMoney, pluralize } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let editing = $state<Service | undefined>();
	let dialogOpen = $state(false);

	function edit(service?: Service) {
		editing = service;
		dialogOpen = true;
	}

	/** How the request flow phrases it (STUDIO.md › 03 — Estimate). */
	function estimateCopy(s: Service): string {
		if (s.priceFromCents == null) return 'Priced after a conversation';
		if (s.priceToCents == null) return `From ${formatMoney(s.priceFromCents)}`;
		return `Typical projects: ${formatMoney(s.priceFromCents)}–${formatMoney(s.priceToCents)}`;
	}

	const openRequests = (id: string) =>
		pipeline.items.filter((r) => r.serviceId === id && !['COMPLETED', 'LOST'].includes(r.stage)).length;
</script>

<PageHeader
	kicker="Studio"
	title="Services"
	description="What the Studio offers, in the order the request form lists it. Estimates are ranges, never guaranteed prices."
>
	{#snippet actions()}
		<Button icon="plus" onclick={() => edit()}>New service</Button>
	{/snippet}
</PageHeader>

<ol class="list">
	{#each services.sorted as service, index (service.id)}
		<li>
			<Card padding="lg">
				<div class="service" data-inactive={!service.active || undefined}>
					<span class="icon"><Icon name={service.icon} size={20} /></span>
					<div class="text">
						<Kicker as="span">{String(index + 1).padStart(2, '0')} · {pluralize(openRequests(service.id), 'open request')}</Kicker>
						<h2>{service.name}</h2>
						{#if service.description}<p>{service.description}</p>{/if}
						<span class="estimate">{estimateCopy(service)}</span>
					</div>
					<div class="controls">
						<Switch
							checked={service.active}
							label="Offered"
							size="sm"
							onchange={(e: Event) => {
								services.update(service.id, { active: (e.currentTarget as HTMLInputElement).checked });
								toast(`${service.name} ${service.active ? 'offered' : 'hidden'} on the website`);
							}}
						/>
						<ButtonGroup size="sm" ariaLabel="Order">
							<Button variant="outline" iconOnly icon="chevron-up" label="Move up" disabled={index === 0} onclick={() => services.move(service.id, -1)} />
							<Button variant="outline" iconOnly icon="chevron-down" label="Move down" disabled={index === services.sorted.length - 1} onclick={() => services.move(service.id, 1)} />
						</ButtonGroup>
						<Button size="sm" variant="ghost" tone="neutral" icon="pencil" onclick={() => edit(service)}>Edit</Button>
					</div>
				</div>
			</Card>
		</li>
	{/each}
</ol>

<ServiceDialog bind:open={dialogOpen} service={editing} />

<style>
	.list {
		display: grid;
		gap: var(--ui-space-8);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.service {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: var(--ui-space-10);
		align-items: start;
	}
	.service[data-inactive] .text {
		opacity: 0.55;
	}
	.icon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-lg);
		color: var(--ui-fg-muted);
	}
	.text {
		display: grid;
		gap: var(--ui-space-3);
	}
	h2 {
		margin: 0;
		font: 400 1.35rem/1.2 var(--ui-font-serif);
	}
	p {
		margin: 0;
		max-width: 60ch;
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
	}
	.estimate {
		margin-top: var(--ui-space-2);
		font-size: var(--ui-text-sm);
		font-weight: var(--ui-weight-medium);
		color: var(--ui-accent-text);
	}
	.controls {
		display: flex;
		align-items: center;
		gap: var(--ui-space-6);
	}
	@media (max-width: 760px) {
		.service {
			grid-template-columns: auto minmax(0, 1fr);
		}
		.controls {
			grid-column: 1 / -1;
			flex-wrap: wrap;
		}
	}
</style>
