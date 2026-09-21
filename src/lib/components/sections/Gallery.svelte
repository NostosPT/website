<script lang="ts">
	import Lightbox from '$lib/components/ui/Lightbox.svelte';

	type Photo = {
		src: string;
		alt: string;
	};

	// 12 fotos — 3 por row, alturas variadas naturais como Hugo Santos (sem grelha rígida, masonry com gap mínimo)
	const photos: Photo[] = [
		{ src: '/images/hero.jpg', alt: 'Eléctrico ao anoitecer — Lisboa' },
		{ src: 'https://picsum.photos/seed/nostos2/700/900', alt: 'Rua de Lisboa — manhã' },
		{ src: 'https://picsum.photos/seed/nostos3/900/700', alt: 'Detalhe urbano' },
		{ src: 'https://picsum.photos/seed/nostos4/700/700', alt: 'Retrato espontâneo' },
		{ src: 'https://picsum.photos/seed/nostos5/700/1000', alt: 'Noite, chuva em Alfama' },
		{ src: 'https://picsum.photos/seed/nostos6/900/600', alt: 'Mercado da manhã' },
		{ src: 'https://picsum.photos/seed/nostos7/700/800', alt: 'Cais — espera' },
		{ src: 'https://picsum.photos/seed/nostos8/700/950', alt: 'Janela com roupa' },
		{ src: 'https://picsum.photos/seed/nostos9/800/800', alt: 'Sombra e luz' },
		{ src: 'https://picsum.photos/seed/nostos10/900/650', alt: 'Eléctrico 28' },
		{ src: 'https://picsum.photos/seed/nostos11/700/850', alt: 'Passageiros' },
		{ src: 'https://picsum.photos/seed/nostos12/700/920', alt: 'Rua vazia' }
	];

	let active: string | null = $state(null);
	let activeAlt = $state('');
</script>

<section class="gallery" aria-labelledby="galeria-heading">
	<div class="gallery-inner">
		<header class="gallery-head">
			<p class="eyebrow">Galeria — Seleção editorial</p>
			<h2 id="galeria-heading" class="gallery-title">Um arquivo vivo.</h2>
			<p class="gallery-desc">
				12 fotografias. Diferentes formatos, momentos e histórias, reunidos num arquivo em constante construção.
			</p>
		</header>

		<div class="masonry">
			{#each photos as p, i (p.src + i)}
				<button
					class="ph"
					aria-label="Ampliar: {p.alt}"
					onclick={() => {
						active = p.src;
						activeAlt = p.alt;
					}}
				>
					<img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
				</button>
			{/each}
		</div>

	</div>
</section>

<Lightbox src={active ?? ''} alt={activeAlt} open={!!active} onclose={() => (active = null)} />

<style>
	/* Hugo Santos reference: full-bleed, tight uniform gutter, no card chrome, varied heights natural */
	.gallery {
		background: var(--color-background);
		padding: clamp(2rem, 5vw, 3.5rem) clamp(0.75rem, 2vw, 1.5rem) clamp(2rem, 5vw, 3rem);
		border-top: 1px solid var(--color-secondary);
	}

	.gallery-inner {
		max-width: var(--content-max);
		margin: 0 auto;
	}

	.gallery-head {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1rem;
		align-items: end;
		padding: 0 0.5rem 1.25rem;
		margin-bottom: 0.75rem;
	}

	.eyebrow {
		grid-column: 1 / -1;
		margin: 0;
		font: 500 0.62rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.gallery-title {
		grid-column: 1 / span 6;
		margin: 0;
		font: 400 clamp(1.8rem, 3.2vw, 2.6rem) / 0.98 var(--font-heading);
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.gallery-desc {
		grid-column: 7 / span 6;
		margin: 0;
		font: 400 0.88rem/1.6 var(--font-body);
		color: var(--muted);
		align-self: end;
	}

	@media (max-width: 900px) {
		.gallery-title {
			grid-column: 1 / -1;
		}
		.gallery-desc {
			grid-column: 1 / -1;
		}
	}

	/* Masonry like Hugo: columns, not grid rows — gap mínimo uniforme */
	.masonry {
		columns: 3;
		column-gap: 10px;
	}

	.ph {
		position: relative;
		display: block;
		width: 100%;
		padding: 0;
		margin: 0 0 10px;
		border: 0;
		background: transparent;
		cursor: zoom-in;
		break-inside: avoid;
	}

	.ph img {
		width: 100%;
		height: auto;
		display: block;
		transition:
			opacity 280ms ease,
			filter 280ms ease,
			transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.ph:hover img {
		opacity: 0.86;
	}

	@media (prefers-reduced-motion: reduce) {
		.ph img {
			transition: none;
		}
	}

	.ph:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}



	/* Tablet: 2 cols */
	@media (max-width: 900px) {
		.masonry {
			columns: 2;
			column-gap: 10px;
		}
	}

	/* Mobile: 1 col, mantém variação natural */
	@media (max-width: 520px) {
		.masonry {
			columns: 1;
		}
		.gallery {
			padding-left: 0.75rem;
			padding-right: 0.75rem;
		}
	}
</style>
