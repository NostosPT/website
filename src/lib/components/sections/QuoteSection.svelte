<script lang="ts">
	type Props = {
		title?: string;
		body?: string;
	};

	let {
		title = 'Uma coleção de momentos, lugares e histórias aos quais vale a pena regressar.',
		body = 'A Nostos é um espaço para a fotografia que vive entre a memória e o presente — desde pequenos fragmentos do quotidiano às pessoas, lugares e ocasiões que merecem ser recordados. Documentamos aquilo que nos chama a atenção, aquilo que permanece connosco e aquilo que, com o tempo, se transforma numa forma de regressar.'
	}: Props = $props();
</script>

<section class="quote-section" aria-labelledby="quote-heading">
	<div class="quote-inner">
		<h2 id="quote-heading" class="quote-title">{title}</h2>
		<p class="quote-body">{body}</p>
	</div>
</section>

<style>
	.quote-section {
		background: var(--color-background);
		padding: clamp(3rem, 7vw, 5.5rem) clamp(1.25rem, 4vw, 2.75rem);
		border-top: 1px solid var(--color-secondary);
	}

	.quote-inner {
		max-width: var(--content-max);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.15fr 0.85fr;
		gap: clamp(2rem, 5vw, 4rem);
		align-items: start;
		text-align: left;
	}

	.quote-title {
		margin: 0;
		font: 400 clamp(1.6rem, 3vw, 2.2rem) / 1.2 var(--font-heading);
		letter-spacing: -0.02em;
		color: var(--color-text);
		text-wrap: balance;
		padding-right: 1rem;
		border-right: 1px solid #eceee9;
	}

	.quote-body {
		margin: 0;
		align-self: center;
		font: 400 0.92rem/1.7 var(--font-body);
		color: var(--muted);
		text-wrap: pretty;
		padding-left: 0.85rem;
		border-left: 1px solid var(--color-secondary);
	}

	@media (max-width: 860px) {
		.quote-inner {
			grid-template-columns: 1fr;
			gap: 1.25rem;
			text-align: left;
		}
		.quote-title {
			border-right: 0;
			padding-right: 0;
			padding-bottom: 1rem;
			border-bottom: 1px solid #eceee9;
		}
		.quote-body {
			border-left: 1px solid var(--color-secondary);
		}
	}

	@media (max-width: 520px) {
		.quote-title {
			font-size: clamp(1.35rem, 6vw, 1.65rem);
		}
		.quote-body {
			font-size: 0.86rem;
		}
	}
</style>
