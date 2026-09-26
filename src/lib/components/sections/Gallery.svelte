<script lang="ts">
	import Lightbox from '$lib/components/ui/Lightbox.svelte';

	type Photo = {
		src: string;
		alt: string;
		id: string;
		category: string;
		date: string;
	};

	// 15 fotos — ordem fixa editorial (com metadados arquivísticos para caption)
	const photos: Photo[] = [
		{ src: '/galeria/_MG_0665.jpg', alt: 'Nostos — _MG_0665', id: 'NST-0665', category: 'Urban', date: 'Mar 2024' },
		{ src: '/galeria/_MG_0670.jpg', alt: 'Nostos — _MG_0670', id: 'NST-0670', category: 'Urban', date: 'Mar 2024' },
		{ src: '/galeria/_MG_0686.jpg', alt: 'Nostos — _MG_0686', id: 'NST-0686', category: 'Landscape', date: 'Nov 2023' },
		{ src: '/galeria/_MG_0747.jpg', alt: 'Nostos — _MG_0747', id: 'NST-0747', category: 'Portrait', date: 'Jan 2024' },
		{ src: '/galeria/_MG_1090.jpg', alt: 'Nostos — _MG_1090', id: 'NST-1090', category: 'Wedding', date: 'Sept 2023' },
		{ src: '/galeria/_MG_1131.jpg', alt: 'Nostos — _MG_1131', id: 'NST-1131', category: 'Event', date: 'Jun 2024' },
		{ src: '/galeria/_MG_1155.jpg', alt: 'Nostos — _MG_1155', id: 'NST-1155', category: 'Automotive', date: 'May 2024' },
		{ src: '/galeria/_MG_1232.jpg', alt: 'Nostos — _MG_1232', id: 'NST-1232', category: 'Landscape', date: 'Aug 2023' },
		{ src: '/galeria/_MG_1245.jpg', alt: 'Nostos — _MG_1245', id: 'NST-1245', category: 'Portrait', date: 'Feb 2024' },
		{ src: '/galeria/IMG_3405.webp', alt: 'Nostos — IMG_3405', id: 'NST-3405', category: 'Automotive', date: 'Jul 2024' },
		{ src: '/galeria/IMG_4471.webp', alt: 'Nostos — IMG_4471', id: 'NST-4471', category: 'Urban', date: 'Apr 2024' },
		{ src: '/galeria/IMG_4474.webp', alt: 'Nostos — IMG_4474', id: 'NST-4474', category: 'Portrait', date: 'Aug 2024' },
		{ src: '/galeria/IMG_4482.webp', alt: 'Nostos — IMG_4482', id: 'NST-4482', category: 'Event', date: 'Oct 2023' },
		{ src: '/galeria/IMG_4486.webp', alt: 'Nostos — IMG_4486', id: 'NST-4486', category: 'Wedding', date: 'Sept 2024' },
		{ src: '/galeria/IMG_4487.jpg', alt: 'Nostos — IMG_4487', id: 'NST-4487', category: 'Landscape', date: 'Dec 2023' }
	];

	let activeIndex: number | null = $state(null);
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
					aria-label="Ampliar: {p.alt} — {p.id} · {p.category} · {p.date}"
					onclick={() => {
						activeIndex = i;
					}}
				>
					<img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
					<span class="ph-cap" aria-hidden="true">
						<span class="ph-cap-id">{p.id}</span>
						<span class="ph-cap-meta">{p.category} · {p.date}</span>
					</span>
				</button>
			{/each}
		</div>

	</div>
</section>

<Lightbox
	photos={photos}
	index={activeIndex}
	open={activeIndex !== null}
	onclose={() => (activeIndex = null)}
	onIndexChange={(i) => (activeIndex = i)}
/>

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

	.ph-cap {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.55rem;
		background: linear-gradient(to top, rgba(6, 6, 6, 0.68), transparent);
		opacity: 0;
		transform: translateY(4px);
		transition:
			opacity 220ms ease,
			transform 220ms ease;
		pointer-events: none;
	}

	.ph-cap-id {
		font: 600 0.62rem/1 var(--font-body);
		letter-spacing: 0.06em;
		color: #fcfcfc;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
	}

	.ph-cap-meta {
		font: 500 0.58rem/1 var(--font-body);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgba(252, 252, 252, 0.88);
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
	}

	@media (hover: hover) {
		.ph:hover img {
			opacity: 1;
			filter: grayscale(0);
		}
		.ph:hover .ph-cap {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.ph:focus-visible img {
		opacity: 1;
		filter: grayscale(0);
	}

	.ph:focus-visible .ph-cap {
		opacity: 1;
		transform: translateY(0);
	}

	@media (prefers-reduced-motion: reduce) {
		.ph img,
		.ph-cap {
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
