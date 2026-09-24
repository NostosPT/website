<script lang="ts">
	import { page } from '$app/state';
	import { Breadcrumb, Button, Menu, MenuItem } from '@nostospt/ui';
	import { breadcrumbsFor, createActions } from '$lib/admin/navigation/nav';
	import NotificationsPopover from '$lib/admin/notifications/NotificationsPopover.svelte';
	import ThemeMenu from '$lib/admin/theme/ThemeMenu.svelte';
	import { pageContext } from './page-context.svelte';

	let { onmenu, onsearch }: { onmenu: () => void; onsearch: () => void } = $props();

	let crumbs = $derived(breadcrumbsFor(page.url.pathname, pageContext.detailLabel));
</script>

<header class="topbar">
	<div class="start">
		<span class="mobile-only">
			<Button
				variant="ghost"
				tone="neutral"
				iconOnly
				icon="menu"
				label="Open navigation"
				onclick={onmenu}
			/>
		</span>
		<Breadcrumb items={crumbs} size="sm" maxItems={3} />
	</div>

	<div class="end">
		<span class="mobile-only">
			<Button variant="ghost" tone="neutral" iconOnly icon="search" label="Search" onclick={onsearch} />
		</span>
		<Menu ariaLabel="Create">
			{#snippet trigger({ toggle }: { toggle: () => void })}
				<Button size="sm" icon="plus" trailingIcon="chevron-down" onclick={toggle}>New</Button>
			{/snippet}
			{#each createActions as action (action.href)}
				<MenuItem icon={action.icon} href={action.href}>{action.label}</MenuItem>
			{/each}
		</Menu>
		<NotificationsPopover />
		<ThemeMenu />
	</div>
</header>

<style>
	.topbar {
		position: sticky;
		top: 0;
		z-index: var(--ui-z-sticky);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ui-space-8);
		min-height: 56px;
		padding: var(--ui-space-4) clamp(1rem, 3vw, 2.5rem);
		/* The site's scrolled navbar: translucent paper, blur, a single rule. */
		background: color-mix(in oklch, var(--ui-bg-canvas) 84%, transparent);
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
		border-bottom: 1px solid var(--ui-border-default);
	}
	.start,
	.end {
		display: flex;
		align-items: center;
		gap: var(--ui-space-4);
		min-width: 0;
	}
	.mobile-only {
		display: none;
	}
	@media (max-width: 900px) {
		.mobile-only {
			display: contents;
		}
	}
</style>
