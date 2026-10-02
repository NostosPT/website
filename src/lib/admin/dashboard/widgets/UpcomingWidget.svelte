<script lang="ts">
	import { Avatar, Card, CardHeader, EmptyState, List, ListItem } from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { pipeline } from '$lib/admin/pipeline/store.svelte';
	import { services } from '$lib/admin/services/store.svelte';
	import { formatTime, LOCALE } from '$lib/admin/shared/format';
	import { team } from '$lib/admin/team/store.svelte';
	import { dayIndex, todayIndex } from '../ranges';

	const day = new Intl.DateTimeFormat(LOCALE, { day: 'numeric' });
	const month = new Intl.DateTimeFormat(LOCALE, { month: 'short' });

	let shoots = $derived(pipeline.upcoming.slice(0, 5));

	function when(iso: string): string {
		const days = dayIndex(new Date(iso)) - todayIndex();
		const label = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;
		return `${label}, ${formatTime(iso)}`;
	}
</script>

<Card>
	<CardHeader title="Upcoming shoots" description="Booked, soonest first." divided />
	{#if shoots.length}
		<List>
			{#each shoots as shoot (shoot.id)}
				{@const date = shoot.project.date!}
				{@const assignee = team.get(shoot.assigneeId)}
				<ListItem
					title={shoot.title}
					description={[clients.get(shoot.clientId)?.name, shoot.project.location].filter(Boolean).join(' · ')}
					href={`/admin/pipeline?request=${shoot.id}`}
				>
					{#snippet leading()}
						<time class="date" datetime={date}>
							<span class="d">{day.format(new Date(date))}</span>
							<span class="m">{month.format(new Date(date))}</span>
						</time>
					{/snippet}
					{#snippet meta()}
						<span class="when">{when(date)}</span>
						<span class="service">{services.get(shoot.serviceId)?.name ?? ''}</span>
					{/snippet}
					{#snippet trailing()}
						{#if assignee}<Avatar name={assignee.name} size="xs" />{/if}
					{/snippet}
				</ListItem>
			{/each}
		</List>
	{:else}
		<EmptyState icon="calendar" size="sm" title="Nothing booked" description="Booked requests with a date show up here." />
	{/if}
</Card>

<style>
	.date {
		display: grid;
		place-items: center;
		width: 2.75rem;
		padding: var(--ui-space-2) 0;
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-md);
		line-height: 1.1;
	}
	.d {
		font: 400 var(--ui-text-lg) var(--ui-font-serif);
	}
	.m {
		font-size: var(--ui-text-2xs);
		text-transform: uppercase;
		letter-spacing: var(--nostos-kicker-tracking);
		color: var(--ui-fg-subtle);
	}
	.when,
	.service {
		display: block;
		text-align: end;
		font-size: var(--ui-text-xs);
		white-space: nowrap;
	}
	.service {
		color: var(--ui-fg-subtle);
	}
	@container (max-width: 440px) {
		.service {
			display: none;
		}
	}
</style>
