<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, EmptyState, Icon, List, ListItem, Popover } from '@nostospt/ui';
	import { formatRelative } from '$lib/admin/shared/format';
	import { notifications, type Notification } from './store.svelte';

	function open(item: Notification, close: () => void) {
		notifications.markRead(item.id);
		close();
		goto(item.href);
	}
</script>

<Popover placement="bottom-end" ariaLabel="Notifications" padded={false}>
	{#snippet trigger({ toggle }: { toggle: () => void })}
		<Button
			variant="ghost"
			tone="neutral"
			iconOnly
			icon="bell"
			label={notifications.unread ? `${notifications.unread} unread notifications` : 'Notifications'}
			badge={notifications.unread || undefined}
			onclick={toggle}
		/>
	{/snippet}
	{#snippet children({ close }: { close: () => void })}
		<div class="panel">
			<header>
				<h2>Notifications</h2>
				<Button
					variant="link"
					size="xs"
					disabled={!notifications.unread}
					onclick={() => notifications.markAllRead()}>Mark all read</Button
				>
			</header>
			{#if notifications.items.length === 0}
				<EmptyState icon="bell" title="All caught up" size="sm" />
			{:else}
				<List>
					{#each notifications.items as item (item.id)}
						<ListItem
							title={item.title}
							description={item.body}
							interactive
							align="start"
							onclick={() => open(item, close)}
						>
							{#snippet leading()}
								<span class="icon" data-unread={!item.read || undefined}>
									<Icon name={item.icon} size={15} />
								</span>
							{/snippet}
							{#snippet meta()}
								<span class="time">{formatRelative(item.createdAt)}</span>
							{/snippet}
						</ListItem>
					{/each}
				</List>
			{/if}
		</div>
	{/snippet}
</Popover>

<style>
	.panel {
		width: min(92vw, 380px);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--ui-space-6) var(--ui-space-8);
		border-bottom: 1px solid var(--ui-border-subtle);
	}
	h2 {
		margin: 0;
		font-size: var(--ui-text-lg);
		font-weight: var(--ui-heading-weight);
	}
	.icon {
		position: relative;
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: var(--ui-radius-md);
		background: var(--ui-bg-muted);
		color: var(--ui-fg-muted);
	}
	.icon[data-unread]::after {
		content: '';
		position: absolute;
		top: -2px;
		right: -2px;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--ui-accent-solid);
		box-shadow: 0 0 0 2px var(--ui-bg-raised);
	}
	.time {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
		white-space: nowrap;
	}
</style>
