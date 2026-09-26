<script lang="ts">
	import { page } from '$app/state';
	import SiteChrome from '$lib/components/layout/SiteChrome.svelte';

	let status = $derived(page.status);
	let error = $derived(page.error);

	let title = $derived(status === 404 ? 'Página não encontrada' : 'Algo correu mal');
	let code = $derived(status);
	let message = $derived(
		status === 404
			? 'A página que procuras não existe, foi movida ou o link está incorreto.'
			: (error?.message ?? 'Ocorreu um erro inesperado.')
	);
</script>

<svelte:head>
	<title>{code} — {title} — Nostos</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<SiteChrome>
	<main id="main" class="err-page">
		<section class="err-inner" aria-labelledby="err-heading">
			<p class="kicker">Erro {code} — Nostos</p>

			<div class="err-code" aria-hidden="true">{code}</div>

			<h1 id="err-heading" class="err-title">{title}</h1>
			<p class="err-desc">{message}</p>

			{#if status === 404}
				<p class="err-note">
					Verifica o endereço ou volta ao início. O arquivo público continua disponível a partir da página
					inicial.
				</p>
			{/if}

			<div class="err-actions">
				<a href="/" class="err-btn err-btn--primary">Voltar à página inicial</a>
				<a href="mailto:hello@nostos.studio" class="err-btn">Contactar Nostos</a>
			</div>

			<p class="err-path">
				{#if page.url.pathname !== '/'}
					Caminho tentado: <span class="err-mono">{page.url.pathname}</span>
				{/if}
			</p>
		</section>
	</main>
</SiteChrome>

<style>
	.err-page {
		background: var(--paper);
		/* offset para Navbar fixed (reutilizável do landing) */
		padding: clamp(4.5rem, 8vw, 6.5rem) clamp(1.25rem, 4vw, 2.75rem) clamp(3rem, 8vw, 5rem);
		min-height: calc(100vh - 280px);
		display: grid;
		place-items: center;
	}

	.err-inner {
		max-width: 38rem;
		width: 100%;
		text-align: center;
	}

	.kicker {
		margin: 0 0 1rem;
		font: 500 0.62rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.err-code {
		font: 500 clamp(5rem, 14vw, 8rem) / 0.85 var(--font-heading);
		letter-spacing: -0.06em;
		color: #eceee9;
		margin: 0.2rem 0 0.6rem;
		user-select: none;
	}

	.err-title {
		margin: 0;
		font: 400 clamp(1.8rem, 3.8vw, 2.6rem) / 1 var(--font-heading);
		letter-spacing: -0.02em;
		color: var(--color-text);
		text-wrap: balance;
	}

	.err-desc {
		margin: 1rem auto 0;
		max-width: 30rem;
		font: 400 0.95rem/1.65 var(--font-body);
		color: #2b2b2b;
		text-wrap: pretty;
	}

	.err-note {
		margin: 0.75rem auto 0;
		max-width: 30rem;
		font: 400 0.82rem/1.6 var(--font-body);
		color: var(--muted);
		text-wrap: pretty;
		padding: 0.85rem 1rem;
		background: var(--paper-soft);
		border-left: 2px solid var(--color-secondary);
		text-align: left;
	}

	.err-actions {
		margin-top: 1.6rem;
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.err-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1.2rem;
		font: 500 0.82rem/1 var(--font-body);
		letter-spacing: 0.02em;
		text-decoration: none;
		border: 1px solid var(--color-secondary);
		background: #fff;
		color: var(--color-text);
		transition:
			background 0.2s,
			border-color 0.2s,
			color 0.2s;
	}

	.err-btn:hover {
		border-color: var(--color-primary);
	}

	.err-btn--primary {
		background: var(--ink);
		border-color: var(--ink);
		color: #fcfcfc;
	}

	.err-btn--primary:hover {
		background: #1a1a1a;
		border-color: #1a1a1a;
		color: #fcfcfc;
	}

	.err-path {
		margin: 1.25rem 0 0;
		font: 400 0.72rem/1.5 var(--font-body);
		color: var(--muted-2);
	}

	.err-mono {
		font: 500 0.72rem/1.5 var(--font-body);
		letter-spacing: 0.02em;
		color: var(--muted);
		background: var(--paper-soft);
		border: 1px solid #e8e9e6;
		padding: 0.15rem 0.4rem;
		word-break: break-all;
	}

	@media (max-width: 480px) {
		.err-page {
			padding-top: 4rem;
		}
		.err-desc {
			font-size: 0.88rem;
		}
	}
</style>
