<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Alert, Button, Field, Input } from '@nostospt/ui';
	import { session } from '$lib/admin/auth/session.svelte';
	import Kicker from '$lib/admin/shared/Kicker.svelte';
	import ThemeMenu from '$lib/admin/theme/ThemeMenu.svelte';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let pending = $state(false);

	// Only same-site dashboard paths are valid return targets.
	let next = $derived.by(() => {
		const target = page.url.searchParams.get('next');
		return target?.startsWith('/admin') ? target : '/admin';
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		pending = true;
		error = null;
		const result = await session.signIn(email, password, fetch);
		pending = false;
		if (result.ok) goto(next);
		else error = result.error;
	}
</script>

<svelte:head>
	<title>Sign in · Nostos Studio</title>
</svelte:head>

<div class="login">
	<figure class="photo">
		<img src="/images/hero.jpg" alt="" />
		<figcaption>
			<Kicker as="span">Nº 001 · Archive</Kicker>
			<span class="line">Archive what has been photographed. Create what has not.</span>
		</figcaption>
	</figure>

	<section class="panel">
		<div class="theme"><ThemeMenu /></div>
		<form class="form" onsubmit={submit}>
			<header>
				<span class="mark">Nostos</span>
				<Kicker>Studio dashboard</Kicker>
			</header>

			<h1>Sign in</h1>

			{#if error}
				<Alert tone="danger" title={error} />
			{/if}

			<Field label="Email">
				{#snippet control({ id }: { id: string })}
					<Input
						{id}
						type="email"
						icon="mail"
						autocomplete="username"
						placeholder="you@nostos.studio"
						required
						bind:value={email}
					/>
				{/snippet}
			</Field>
			<Field label="Password" hint="Forgotten it? Ask a studio admin to reset it.">
				{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
					<Input
						{id}
						type="password"
						icon="lock"
						revealable
						autocomplete="current-password"
						aria-describedby={describedBy}
						required
						bind:value={password}
					/>
				{/snippet}
			</Field>

			<Button type="submit" size="lg" block loading={pending}>Sign in</Button>

			<p class="mock-note">
				Mock mode: sign in as <code>marta@nostos.studio</code> with any password.
			</p>
		</form>
	</section>
</div>

<style>
	.login {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		min-height: 100dvh;
	}
	.photo {
		position: relative;
		margin: 0;
		overflow: hidden;
		background: #060606;
	}
	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: grayscale(1);
		opacity: 0.88;
	}
	figcaption {
		position: absolute;
		left: clamp(1.5rem, 4vw, 3rem);
		bottom: clamp(1.5rem, 4vw, 3rem);
		display: grid;
		gap: var(--ui-space-4);
		max-width: 26rem;
		color: #f0efec;
	}
	figcaption :global(.kicker) {
		color: #b3c2b2;
	}
	.line {
		font: 400 clamp(1.25rem, 2vw, 1.6rem) / 1.25 var(--ui-font-serif);
		letter-spacing: -0.02em;
	}
	.panel {
		position: relative;
		display: grid;
		place-items: center;
		padding: clamp(1.5rem, 5vw, 4rem);
		background: var(--ui-bg-surface);
	}
	.theme {
		position: absolute;
		top: var(--ui-space-8);
		right: var(--ui-space-8);
	}
	.form {
		display: grid;
		gap: var(--ui-space-10);
		width: min(100%, 380px);
	}
	header {
		display: grid;
		gap: var(--ui-space-3);
		padding-bottom: var(--ui-space-10);
		border-bottom: 1px solid var(--ui-border-default);
	}
	.mark {
		font: 400 1.6rem/1 var(--ui-font-serif);
		letter-spacing: -0.02em;
	}
	h1 {
		margin: 0;
		font: 400 2rem/1.1 var(--ui-font-serif);
	}
	.mock-note {
		margin: 0;
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	.mock-note code {
		font-family: var(--ui-font-mono);
		color: var(--ui-fg-muted);
	}
	@media (max-width: 860px) {
		.login {
			grid-template-columns: minmax(0, 1fr);
		}
		.photo {
			display: none;
		}
	}
</style>
