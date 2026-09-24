<script lang="ts">
	import { page } from '$app/state';
	import { Button, EmptyState } from '@nostospt/ui';

	let notFound = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{page.status} · Nostos Studio</title>
</svelte:head>

<div class="error">
	<EmptyState
		icon={notFound ? 'search' : 'alert-triangle'}
		title={notFound ? 'This page doesn’t exist' : 'Something went wrong'}
		description={notFound
			? `Nothing lives at ${page.url.pathname}. It may have moved, or the link is wrong.`
			: (page.error?.message ?? 'An unexpected error occurred.')}
		size="lg"
	>
		{#snippet actions()}
			<Button href="/admin" icon="arrow-left" variant="outline">Back to overview</Button>
		{/snippet}
	</EmptyState>
</div>

<style>
	.error {
		display: grid;
		place-items: center;
		min-height: 60vh;
	}
</style>
