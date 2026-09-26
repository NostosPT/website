<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		Button,
		Menu,
		MenuItem,
		MenuLabel,
		MenuSeparator,
		Sidebar,
		SidebarFooter,
		SidebarHeader,
		SidebarItem,
		SidebarNav,
		SidebarSearch,
		SidebarSection
	} from '@nostospt/ui';
	import { session } from '$lib/admin/auth/session.svelte';
	import { mail } from '$lib/admin/mail/store.svelte';
	import { pipeline } from '$lib/admin/pipeline/store.svelte';
	import { isActive, navigation } from '$lib/admin/navigation/nav';
	import { can, roles } from '$lib/admin/team/roles';
	import { theme, themeModes } from '$lib/admin/theme/theme.svelte';

	let {
		collapsed = $bindable(false),
		onsearch
	}: { collapsed?: boolean; onsearch: (query?: string) => void } = $props();

	let pathname = $derived(page.url.pathname);
	let role = $derived(session.user?.role ?? 'ADMIN');

	let badges: Record<string, number> = $derived({
		'/admin/mail': mail.unreadCount,
		'/admin/pipeline': pipeline.newCount
	});

	let sections = $derived(
		navigation
			.map((section) => ({
				...section,
				items: section.items.filter((item) => !item.area || can(role, item.area))
			}))
			.filter((section) => section.items.length)
	);

	function signOut() {
		session.signOut();
		goto('/admin/login');
	}
</script>

<Sidebar bind:collapsed variant="subtle">
	<SidebarHeader>
		{#snippet logo()}<span class="monogram" aria-hidden="true">N</span>{/snippet}
		<a class="wordmark" href="/admin">
			<span class="mark">Nostos</span>
			<span class="sub">Studio</span>
		</a>
	</SidebarHeader>

	<SidebarSearch
		placeholder="Search…"
		shortcut="⌘K"
		onclick={() => onsearch()}
		onsearch={(query: string) => onsearch(query)}
	/>

	<SidebarNav>
		{#each sections as section (section.title ?? 'main')}
			<SidebarSection title={section.title ?? undefined}>
				{#each section.items as item (item.href)}
					<SidebarItem
						icon={item.icon}
						label={item.label}
						href={item.href}
						active={isActive(item, pathname)}
						badge={badges[item.href] || undefined}
						badgeTone="accent"
						aria-current={isActive(item, pathname) ? 'page' : undefined}
					/>
				{/each}
			</SidebarSection>
		{/each}
	</SidebarNav>

	{#if session.user}
		<SidebarFooter
			user={{ name: session.user.name, email: roles[session.user.role].label, presence: 'online' }}
		>
			{#snippet action()}
				<Menu placement="top-end" ariaLabel="Account">
					{#snippet trigger({ toggle }: { toggle: () => void })}
						<Button
							variant="ghost"
							tone="neutral"
							size="xs"
							iconOnly
							icon="more-vertical"
							label="Account menu"
							onclick={toggle}
						/>
					{/snippet}
					<MenuLabel>{session.user?.email}</MenuLabel>
					<MenuItem icon="user" href="/admin/settings?tab=account">Account</MenuItem>
					<MenuItem icon="settings" href="/admin/settings">Studio settings</MenuItem>
					<MenuSeparator />
					<MenuLabel>Theme</MenuLabel>
					{#each themeModes as option (option.value)}
						<MenuItem
							icon={option.icon}
							selected={theme.mode === option.value}
							closeOnSelect={false}
							onselect={() => theme.set(option.value)}
						>
							{option.label}
						</MenuItem>
					{/each}
					<MenuSeparator />
					<MenuItem icon="external-link" href="/" target="_blank">View website</MenuItem>
					<MenuItem icon="arrow-left" tone="danger" onselect={signOut}>Sign out</MenuItem>
				</Menu>
			{/snippet}
		</SidebarFooter>
	{/if}
</Sidebar>

<style>
	.monogram {
		font: 400 17px/1 var(--ui-font-serif);
	}
	.wordmark {
		display: flex;
		align-items: baseline;
		gap: var(--ui-space-4);
		text-decoration: none;
		color: inherit;
	}
	.mark {
		font: 400 1.2rem/1 var(--ui-font-serif);
		letter-spacing: -0.02em;
		color: var(--ui-fg-default);
	}
	.sub {
		font-size: var(--ui-text-2xs);
		font-weight: var(--ui-weight-medium);
		letter-spacing: var(--nostos-kicker-tracking);
		text-transform: uppercase;
		color: var(--ui-fg-subtle);
	}
</style>
