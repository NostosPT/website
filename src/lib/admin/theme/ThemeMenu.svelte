<script lang="ts">
	import { Button, Menu, MenuItem, MenuLabel } from '@nostospt/ui';
	import { theme, themeModes } from './theme.svelte';
</script>

<Menu ariaLabel="Theme">
	{#snippet trigger({ toggle }: { toggle: () => void })}
		<Button
			variant="ghost"
			tone="neutral"
			iconOnly
			icon={theme.resolved === 'dark' ? 'moon' : 'sun'}
			label="Change theme"
			onclick={toggle}
		/>
	{/snippet}
	<MenuLabel>Appearance</MenuLabel>
	{#each themeModes as option (option.value)}
		<MenuItem
			icon={option.icon}
			selected={theme.mode === option.value}
			onselect={() => theme.set(option.value)}
		>
			{option.label}
		</MenuItem>
	{/each}
</Menu>
