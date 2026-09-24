<script lang="ts">
	import { goto } from '$app/navigation';
	import { Icon, Input, Kbd, List, ListItem, Modal } from '@nostospt/ui';
	import { allNavItems, createActions, type CreateAction } from '$lib/admin/navigation/nav';
	import Kicker from '$lib/admin/shared/Kicker.svelte';

	let { open = $bindable(false), query = $bindable('') }: { open?: boolean; query?: string } =
		$props();

	type Command = CreateAction;

	const actions = createActions;

	const destinations: Command[] = allNavItems.map((item) => ({
		label: item.label,
		hint: 'Go to',
		icon: item.icon,
		href: item.href
	}));

	let active = $state(0);

	const matches = (c: Command) => c.label.toLowerCase().includes(query.trim().toLowerCase());
	let groups = $derived(
		[
			{ title: 'Actions', items: actions.filter(matches) },
			{ title: 'Pages', items: destinations.filter(matches) }
		].filter((g) => g.items.length)
	);
	let flat = $derived(groups.flatMap((g) => g.items));

	$effect(() => {
		// Reset the highlight whenever the result set changes.
		void flat;
		active = 0;
	});

	function run(command: Command | undefined) {
		if (!command) return;
		open = false;
		query = '';
		goto(command.href);
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			active = (active + 1) % Math.max(flat.length, 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			active = (active - 1 + flat.length) % Math.max(flat.length, 1);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			run(flat[active]);
		}
	}

	function onWindowKey(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			open = !open;
		}
	}
</script>

<svelte:window onkeydown={onWindowKey} />

<Modal bind:open size="md" class="command-palette">
	{#snippet header()}
		<div class="search">
			<Input
				bind:value={query}
				icon="search"
				placeholder="Search pages and actions…"
				aria-label="Search pages and actions"
				autofocus
				{onkeydown}
			/>
		</div>
	{/snippet}

	{#if flat.length === 0}
		<p class="empty">Nothing matches “{query}”.</p>
	{:else}
		{#each groups as group (group.title)}
			<div class="group">
				<Kicker>{group.title}</Kicker>
				<List divided={false}>
					{#each group.items as command (command.label)}
						<ListItem
							title={command.label}
							selected={flat[active] === command}
							interactive
							padding="sm"
							onclick={() => run(command)}
							onmouseenter={() => (active = flat.indexOf(command))}
						>
							{#snippet leading()}<Icon name={command.icon} size={16} />{/snippet}
							{#snippet meta()}<span class="hint">{command.hint}</span>{/snippet}
						</ListItem>
					{/each}
				</List>
			</div>
		{/each}
	{/if}

	{#snippet footer()}
		<div class="keys">
			<span><Kbd size="sm">↑</Kbd><Kbd size="sm">↓</Kbd> to move</span>
			<span><Kbd size="sm">↵</Kbd> to open</span>
			<span><Kbd size="sm">esc</Kbd> to close</span>
		</div>
	{/snippet}
</Modal>

<style>
	.search {
		padding: var(--ui-space-8) var(--ui-space-8) 0;
	}
	.group {
		display: grid;
		gap: var(--ui-space-3);
		padding-bottom: var(--ui-space-6);
	}
	.hint {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.empty {
		margin: 0;
		padding: var(--ui-space-12) 0;
		text-align: center;
		color: var(--ui-fg-muted);
	}
	.keys {
		display: flex;
		gap: var(--ui-space-8);
		width: 100%;
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.keys span {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-2);
	}
</style>
