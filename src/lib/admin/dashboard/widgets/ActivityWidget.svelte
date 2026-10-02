<script lang="ts">
	import { Badge, Button, Card, CardHeader, EmptyState, Icon } from '@nostospt/ui';
	import { notifications } from '$lib/admin/notifications/store.svelte';
	import { formatRelative } from '$lib/admin/shared/format';
	import { dashboard } from '../store.svelte';

	type Entry = { id: string; icon: string; title: string; body: string; href: string; createdAt: string; live: boolean };

	/** Notifications plus, on the mock source, the simulated live feed. */
	let entries = $derived.by(() => {
		const live: Entry[] = dashboard.events
			.filter((e) => dashboard.allows(e.area))
			.map((e) => ({ ...e, live: true }));
		const stored: Entry[] = notifications.items.map((n) => ({ ...n, live: false }));
		return [...live, ...stored].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
	});

	// Relative times refresh every half minute.
	let now = $state(new Date());
	$effect(() => {
		const timer = setInterval(() => (now = new Date()), 30_000);
		return () => clearInterval(timer);
	});
</script>

<Card>
	<CardHeader title="Activity" divided>
		{#snippet actions()}
			{#if dashboard.simulating}
				<Button variant="ghost" tone="neutral" size="sm" onclick={() => (dashboard.paused = !dashboard.paused)}>
					{dashboard.paused ? 'Resume' : 'Pause'}
				</Button>
			{/if}
		{/snippet}
	</CardHeader>
	{#if entries.length}
		<ol class="feed" aria-live="polite">
			{#each entries as entry (entry.id)}
				<li class:fresh={entry.live}>
					<a href={entry.href}>
						<span class="icon"><Icon name={entry.icon} size={15} /></span>
						<span class="text">
							<span class="title">
								{entry.title}
								{#if entry.live}<Badge size="sm" variant="outline">Sample</Badge>{/if}
							</span>
							<span class="body">{entry.body}</span>
						</span>
						<time datetime={entry.createdAt}>{formatRelative(entry.createdAt, now)}</time>
					</a>
				</li>
			{/each}
		</ol>
	{:else}
		<EmptyState icon="bell" size="sm" title="Quiet so far" />
	{/if}
</Card>

<style>
	.feed {
		margin: 0;
		padding: var(--ui-space-3) 0;
		list-style: none;
	}
	a {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: var(--ui-space-6);
		align-items: start;
		padding: var(--ui-space-5) var(--ui-space-10);
		color: inherit;
		text-decoration: none;
	}
	a:hover {
		background: var(--ui-bg-hover);
	}
	a:focus-visible {
		outline: 2px solid var(--ui-accent-ring);
		outline-offset: -2px;
	}
	.icon {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: var(--ui-radius-full);
		background: var(--ui-bg-muted);
		color: var(--ui-fg-muted);
	}
	.text {
		display: grid;
		gap: 2px;
		min-width: 0;
	}
	.title {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-3);
		font-size: var(--ui-text-sm);
		font-weight: var(--ui-weight-medium);
	}
	.body {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	time {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
		white-space: nowrap;
	}
	.fresh {
		animation: arrive var(--ui-duration-slow) var(--ui-ease-out);
	}
	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.fresh {
			animation: none;
		}
	}
</style>
