<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '@nostospt/ui';
	import Kicker from '$lib/admin/shared/Kicker.svelte';
	import { pageContext } from './page-context.svelte';

	/**
	 * Editorial page heading, as on the public site: an archival kicker, a Lora
	 * title and a ruled bottom edge. Also owns the document title and, on detail
	 * pages, the breadcrumb label.
	 */
	let {
		title,
		kicker,
		description,
		back,
		detail = false,
		actions,
		meta
	}: {
		title: string;
		kicker?: string;
		description?: string;
		back?: { href: string; label: string };
		/** Detail pages feed their title to the breadcrumb. */
		detail?: boolean;
		actions?: Snippet;
		meta?: Snippet;
	} = $props();

	$effect(() => {
		if (!detail) return;
		pageContext.detailLabel = title;
		return () => (pageContext.detailLabel = undefined);
	});
</script>

<svelte:head>
	<title>{title} · Nostos Studio</title>
</svelte:head>

<header class="page-header">
	{#if back}
		<Button href={back.href} variant="link" tone="neutral" size="sm" icon="arrow-left">
			{back.label}
		</Button>
	{/if}
	<div class="row">
		<div class="text">
			{#if kicker}<Kicker>{kicker}</Kicker>{/if}
			<h1>{title}</h1>
			{#if description}<p class="description">{description}</p>{/if}
			{#if meta}<div class="meta">{@render meta()}</div>{/if}
		</div>
		{#if actions}
			<div class="actions">{@render actions()}</div>
		{/if}
	</div>
</header>

<style>
	.page-header {
		display: grid;
		gap: var(--ui-space-6);
		padding-bottom: var(--ui-space-12);
		margin-bottom: var(--ui-space-12);
		border-bottom: 1px solid var(--ui-border-default);
	}
	.page-header > :global(.ui-btn) {
		justify-self: start;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--ui-space-8);
	}
	.text {
		display: grid;
		gap: var(--ui-space-4);
		min-width: min(100%, 22rem);
		flex: 1;
	}
	h1 {
		margin: 0;
		font: 400 clamp(1.75rem, 2.6vw, 2.25rem) / 1.05 var(--ui-font-serif);
		letter-spacing: -0.025em;
		color: var(--ui-fg-default);
	}
	.description {
		margin: 0;
		max-width: 60ch;
		font-size: var(--ui-text-md);
		line-height: var(--ui-leading-relaxed);
		color: var(--ui-fg-muted);
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--ui-space-4);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-space-4);
	}
</style>
