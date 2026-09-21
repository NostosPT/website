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
		padding: clamp(3.5rem, 8vw, 6.5rem) clamp(1.25rem, 4vw, 2.75rem);
	}

	.quote-inner {
		max-width: 44rem;
		margin: 0 auto;
		text-align: center;
	}

	.quote-title {
		margin: 0;
		font: 400 clamp(1.6rem, 3vw, 2.15rem) / 1.25 var(--font-heading);
		letter-spacing: -0.02em;
		color: var(--color-text);
		text-wrap: balance;
	}

	.quote-body {
		margin: 1.25rem auto 0;
		max-width: 36rem;
		font: 400 0.95rem/1.7 var(--font-body);
		color: var(--muted);
		text-wrap: pretty;
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
