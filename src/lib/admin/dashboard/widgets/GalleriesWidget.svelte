<script lang="ts">
	import { Button, Card, CardHeader, EmptyState, Icon, List, ListItem, Progress } from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { galleries } from '$lib/admin/galleries/store.svelte';
	import { formatRelative, pluralize } from '$lib/admin/shared/format';

	/** Published client galleries, most recently viewed first, with selection progress. */
	let live = $derived(
		galleries.items
			.filter((g) => g.status === 'PUBLISHED')
			.sort((a, b) => (b.lastViewedAt ?? '').localeCompare(a.lastViewedAt ?? ''))
			.slice(0, 5)
	);
</script>

<Card>
	<CardHeader title="Client galleries" description="Published deliveries and how clients are using them." divided>
		{#snippet actions()}
			<Button href="/admin/galleries" variant="ghost" tone="neutral" size="sm" trailingIcon="arrow-right">All</Button>
		{/snippet}
	</CardHeader>
	{#if live.length}
		<List>
			{#each live as gallery (gallery.id)}
				{@const picked = galleries.selectedCount(gallery)}
				{@const target = gallery.selectionLimit ?? gallery.photos.length}
				<ListItem title={gallery.title} href={`/admin/galleries/${gallery.id}`} align="start">
					<span class="sub">
						{clients.get(gallery.clientId)?.name ?? 'Client'} ·
						<Icon name="eye" size={12} /> {pluralize(gallery.views, 'view')}
						{#if gallery.lastViewedAt}· {formatRelative(gallery.lastViewedAt)}{/if}
					</span>
					{#if target}
						<span class="progress">
							<Progress value={picked} max={target} size="sm" label={`${picked} of ${target} favourites`} />
						</span>
					{/if}
				</ListItem>
			{/each}
		</List>
	{:else}
		<EmptyState icon="share-2" size="sm" title="No published galleries" />
	{/if}
</Card>

<style>
	.sub {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ui-space-2);
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.progress {
		display: block;
		margin-top: var(--ui-space-3);
	}
</style>
