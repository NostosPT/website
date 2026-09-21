<script lang="ts">
	import Lightbox from '$lib/components/ui/Lightbox.svelte';

	type Photo = {
		src: string;
		alt: string;
	};

	// 15 fotos locais — ordem aleatória baralhada no cliente
	const rawPhotos: Photo[] = [
		{ src: '/galeria/_MG_0665.jpg', alt: 'Nostos — _MG_0665' },
		{ src: '/galeria/_MG_0670.jpg', alt: 'Nostos — _MG_0670' },
		{ src: '/galeria/_MG_0686.jpg', alt: 'Nostos — _MG_0686' },
		{ src: '/galeria/_MG_0747.jpg', alt: 'Nostos — _MG_0747' },
		{ src: '/galeria/_MG_1090.jpg', alt: 'Nostos — _MG_1090' },
		{ src: '/galeria/_MG_1131.jpg', alt: 'Nostos — _MG_1131' },
		{ src: '/galeria/_MG_1155.jpg', alt: 'Nostos — _MG_1155' },
		{ src: '/galeria/_MG_1232.jpg', alt: 'Nostos — _MG_1232' },
		{ src: '/galeria/_MG_1245.jpg', alt: 'Nostos — _MG_1245' },
		{ src: '/galeria/IMG_3405.webp', alt: 'Nostos — IMG_3405' },
		{ src: '/galeria/IMG_4471.webp', alt: 'Nostos — IMG_4471' },
		{ src: '/galeria/IMG_4474.webp', alt: 'Nostos — IMG_4474' },
		{ src: '/galeria/IMG_4482.webp', alt: 'Nostos — IMG_4482' },
		{ src: '/galeria/IMG_4486.webp', alt: 'Nostos — IMG_4486' },
		{ src: '/galeria/IMG_4487.jpg', alt: 'Nostos — IMG_4487' }
	];

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	let photos: Photo[] = $state(rawPhotos);
	// baralha uma vez no cliente
	$effect(() => {
		photos = shuffle(rawPhotos);
	});

	let active: string | null = $state(null);
	let activeAlt = $state('');
</script>

<section class="gallery" aria-labelledby="galeria-heading">
	<div class="gallery-inner">
		<header class="gallery-head">
			<p class="eyebrow">Galeria — Seleção editorial</p>
			<h2 id="galeria-heading" class="gallery-title">Um arquivo vivo.</h2>
			<p class="gallery-desc">
				15 fotografias. Diferentes formatos, momentos e histórias, reunidos num arquivo em constante construção.
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
		filter: grayscale(1);
		transition:
			opacity 280ms ease,
			filter 380ms ease,
			transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
	}

	.ph:hover img,
	.ph:focus-visible img {
		opacity: 1;
		filter: grayscale(0);
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
