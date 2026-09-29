<script lang="ts">
	import {
		Avatar,
		Badge,
		Card,
		CardBody,
		CardHeader,
		Checkbox,
		EmptyState,
		Icon,
		List,
		ListItem,
		SegmentedControl,
		Stat,
		Switch,
		toast
	} from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { formatRelative, formatShortDate } from '$lib/admin/shared/format';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';
	import { followUpKinds, success } from '$lib/admin/success/store.svelte';
	import { team } from '$lib/admin/team/store.svelte';

	let show = $state<'open' | 'done'>('open');

	let items = $derived(
		success.followUps
			.filter((f) => (show === 'open' ? !f.done : f.done))
			.sort((a, b) => a.dueAt.localeCompare(b.dueAt))
	);

	const overdue = (iso: string) => new Date(iso).getTime() < Date.now() - 86_400_000;
</script>

<PageHeader
	kicker="Work"
	title="Feedback"
	description="What happens after delivery: follow-ups, reviews, anniversaries, and the quiet work of being remembered."
/>

<div class="stats">
	<Card padding="md"><Stat label="Open follow-ups" value={String(success.open.length)} /></Card>
	<Card padding="md"><Stat label="Due this week" value={String(success.dueThisWeek.length)} /></Card>
	<Card padding="md"><Stat label="Average rating" value={success.averageRating.toFixed(1)} unit="/ 5" /></Card>
	<Card padding="md"><Stat label="Testimonials" value={String(success.feedback.filter((f) => f.testimonial).length)} /></Card>
</div>

<div class="layout">
	<Card>
		<CardHeader title="Follow-ups" divided>
			{#snippet actions()}
				<SegmentedControl
					bind:value={show}
					size="sm"
					ariaLabel="Show"
					items={[
						{ value: 'open', label: 'Open' },
						{ value: 'done', label: 'Done' }
					]}
				/>
			{/snippet}
		</CardHeader>
		{#if items.length}
			<List>
				{#each items as item (item.id)}
					{@const client = clients.get(item.clientId)}
					{@const kind = followUpKinds[item.kind]}
					{@const assignee = team.get(item.assigneeId)}
					<ListItem title={item.title} href={item.href ?? undefined} align="start">
						{#snippet leading()}
							<Checkbox
								checked={item.done}
								aria-label={item.done ? 'Mark as open' : 'Mark as done'}
								onclick={(e: MouseEvent) => e.stopPropagation()}
								onchange={() => {
									success.toggle(item.id);
									if (item.done) toast.success('Done', { description: item.title });
								}}
							/>
						{/snippet}
						{#snippet children()}
							<span class="sub">
								<Icon name={kind.icon} size={13} /> {kind.label} · {client?.name}
								{#if item.automationId}<Badge size="sm" variant="outline">Automatic</Badge>{/if}
							</span>
						{/snippet}
						{#snippet meta()}
							<span class="due" class:late={!item.done && overdue(item.dueAt)}>{formatShortDate(item.dueAt)}</span>
						{/snippet}
						{#snippet trailing()}
							{#if assignee}<Avatar name={assignee.name} size="xs" />{/if}
						{/snippet}
					</ListItem>
				{/each}
			</List>
		{:else}
			<EmptyState icon="check-circle" title={show === 'open' ? 'Nothing to follow up' : 'Nothing done yet'} size="sm" />
		{/if}
	</Card>

	<div class="side">
		<Card>
			<CardHeader title="Automations" description="Run daily by the API's scheduler." divided />
			<CardBody>
				<div class="automations">
					{#each success.automations as automation (automation.id)}
						<Switch
							bind:checked={automation.enabled}
							label={automation.name}
							description={automation.description}
						/>
					{/each}
				</div>
			</CardBody>
		</Card>

		<Card>
			<CardHeader title="Feedback" divided />
			<CardBody>
				<div class="feedback">
					{#each success.feedback as entry (entry.id)}
						<div class="entry">
							<figure>
								<span class="stars" aria-label={`${entry.rating} of 5`}>
									{#each { length: 5 } as _, i (i)}
										<Icon name="star" size={13} filled={i < entry.rating} />
									{/each}
								</span>
								<blockquote>“{entry.comment}”</blockquote>
								<figcaption>{clients.get(entry.clientId)?.name} · {formatRelative(entry.createdAt)}</figcaption>
							</figure>
							<Switch bind:checked={entry.testimonial} size="sm" label="Show on the website" />
						</div>
					{/each}
				</div>
			</CardBody>
		</Card>
	</div>
</div>

<style>
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--ui-space-8);
		margin-bottom: var(--ui-space-12);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(300px, 1fr);
		gap: var(--ui-space-12);
		align-items: start;
	}
	.side,
	.automations,
	.feedback {
		display: grid;
		gap: var(--ui-space-12);
	}
	.automations {
		gap: var(--ui-space-10);
	}
	.sub {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ui-space-3);
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.due {
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
		white-space: nowrap;
	}
	.due.late {
		color: var(--ui-warning-text);
	}
	.entry {
		display: grid;
		gap: var(--ui-space-6);
		padding-bottom: var(--ui-space-10);
		border-bottom: 1px solid var(--ui-border-subtle);
	}
	.entry:last-child {
		padding-bottom: 0;
		border-bottom: 0;
	}
	figure {
		display: grid;
		gap: var(--ui-space-4);
		margin: 0;
	}
	.stars {
		display: inline-flex;
		gap: 2px;
		color: var(--ui-accent-solid);
	}
	blockquote {
		margin: 0;
		font: italic 400 var(--ui-text-lg) / 1.45 var(--ui-font-serif);
	}
	figcaption {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	@media (max-width: 1100px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
