<script lang="ts">
	import { Button, EmptyState, Icon, Textarea, toast } from '@nostospt/ui';
	import { session } from '$lib/admin/auth/session.svelte';
	import { formatDateTime, formatRelative } from '$lib/admin/shared/format';
	import { team } from '$lib/admin/team/store.svelte';
	import { clients } from './store.svelte';
	import type { ActivityKind } from './types';

	let { clientId }: { clientId: string } = $props();

	const icons: Record<ActivityKind, string> = {
		note: 'pencil',
		email: 'mail',
		request: 'board',
		invoice: 'receipt',
		gallery: 'share-2',
		order: 'credit-card',
		call: 'phone'
	};

	let note = $state('');
	let entries = $derived(clients.timeline(clientId));

	function addNote() {
		if (!note.trim()) return;
		clients.addNote(clientId, note.trim(), session.user?.id ?? null);
		note = '';
		toast.success('Note added');
	}
</script>

<form class="compose" onsubmit={(e) => (e.preventDefault(), addNote())}>
	<Textarea bind:value={note} rows={2} autogrow placeholder="Add a note — only the team sees it" aria-label="New note" />
	<Button type="submit" size="sm" disabled={!note.trim()}>Add note</Button>
</form>

{#if entries.length}
	<ol class="timeline">
		{#each entries as entry (entry.id)}
			{@const author = team.get(entry.authorId)}
			<li data-kind={entry.kind}>
				<span class="dot"><Icon name={icons[entry.kind]} size={14} /></span>
				<div class="body">
					<div class="head">
						{#if entry.href}
							<a href={entry.href}>{entry.title}</a>
						{:else}
							<strong>{entry.title}</strong>
						{/if}
						<time datetime={entry.createdAt} title={formatDateTime(entry.createdAt)}>{formatRelative(entry.createdAt)}</time>
					</div>
					{#if entry.body}<p>{entry.body}</p>{/if}
					{#if author}<span class="author">{author.name}</span>{/if}
				</div>
			</li>
		{/each}
	</ol>
{:else}
	<EmptyState icon="clock" title="No activity yet" size="sm" />
{/if}

<style>
	.compose {
		display: grid;
		gap: var(--ui-space-4);
		justify-items: end;
		margin-bottom: var(--ui-space-12);
	}
	.compose > :global(:first-child) {
		width: 100%;
	}
	.timeline {
		position: relative;
		display: grid;
		gap: var(--ui-space-10);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.timeline::before {
		content: '';
		position: absolute;
		top: 8px;
		bottom: 8px;
		left: 15px;
		width: 1px;
		background: var(--ui-border-default);
	}
	li {
		position: relative;
		display: grid;
		grid-template-columns: 32px minmax(0, 1fr);
		gap: var(--ui-space-6);
	}
	.dot {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border: 1px solid var(--ui-border-default);
		border-radius: 50%;
		background: var(--ui-bg-surface);
		color: var(--ui-fg-muted);
	}
	li[data-kind='note'] .dot {
		background: var(--ui-accent-soft);
		color: var(--ui-accent-text);
		border-color: var(--ui-accent-border);
	}
	.body {
		display: grid;
		gap: var(--ui-space-2);
		padding-top: 5px;
	}
	.head {
		display: flex;
		justify-content: space-between;
		gap: var(--ui-space-6);
	}
	.head a,
	.head strong {
		font-weight: var(--ui-weight-medium);
		color: var(--ui-fg-default);
	}
	.head a {
		text-decoration: none;
	}
	.head a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	time,
	.author {
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
		white-space: nowrap;
	}
	p {
		margin: 0;
		font-size: var(--ui-text-sm);
		line-height: var(--ui-leading-relaxed);
		color: var(--ui-fg-muted);
	}
</style>
