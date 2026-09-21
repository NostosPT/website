<script lang="ts">
	import Lightbox from "$lib/components/ui/Lightbox.svelte";
	import Viewfinder from "./Viewfinder.svelte";

	type Props = {
		title?: string;
		description?: string;
		quote?: string;
		photo?: string;
		settings?: string;
	};

	let {
		title = "Nostos",
		description = "Fotografia para aquilo que merece permanecer. A Nostos cria imagens através de um olhar atento, entre histórias pessoais, experiências e momentos que merecem ser lembrados.",
		quote = "Entre partir e pertencer.",
		photo = "/images/hero.jpg",
		settings = "f/3.5 · 1/125 · ISO 6400",
	}: Props = $props();

	let lightbox = $state(false);
</script>

<header class="hero" style:--hero-photo="url('{photo}')">
	<!-- Hero image with mask fade — white to image -->
	<div
		class="hero-image"
		role="img"
		aria-label="A tram at night in a city street"
		aria-hidden="true"
	></div>

	<!-- Blurred overlay with rectangular hole -->
	<div class="blur" aria-hidden="true"></div>

	<!-- Lens emulation — hover/focus isolated to lens only, clickable to lightbox -->
	<button
		class="lens-unit"
		aria-label="Ampliar imagem"
		onclick={() => (lightbox = true)}
	>
		<div class="lens-photo" style:background-image="url('{photo}')"></div>
		<Viewfinder {settings} />
	</button>

	<!-- Subtle top veil -->
	<div class="top-veil" aria-hidden="true"></div>

	<!-- Left panel — text over hero-image white fade -->
	<div class="panel">
		<div aria-hidden="true"></div>
		<div class="panel-copy">
			<h1 class="brand">{title}</h1>
			<p class="desc">{description}</p>
			<blockquote class="quote">
				“{quote}” <span class="quote-attrib">— nostos</span>
			</blockquote>
		</div>
		<div aria-hidden="true" class="panel-spacer"></div>
	</div>

	<!-- Scroll cue — bottom-right, vertical pulsing -->
	<a class="scroll-cue" href="#main" aria-label="Scroll to content">
		<span class="sr-only">Scroll</span>
		<span class="scroll-track" aria-hidden="true">
			<span class="scroll-line"></span>
			<span class="scroll-dot"></span>
		</span>
	</a>
</header>

<Lightbox
	src={photo}
	alt="Tram at night"
	open={lightbox}
	onclose={() => (lightbox = false)}
/>

<style>
	.hero {
		--panel-w: clamp(24rem, 42vw, 38rem);
		--win-w: min(calc((100vw - var(--panel-w)) * 0.44), 440px);
		--win-h: calc(var(--win-w) * 0.667);
		--win-left: calc(
			var(--panel-w) + (100vw - var(--panel-w) - var(--win-w)) / 2 +
				clamp(0.75rem, 1.6vw, 1.75rem)
		);
		--win-top: calc((100svh - var(--win-h)) / 2 + 4vh);
		--photo-zoom: 150%;
		--photo-pos: 45% 98%;

		position: relative;
		height: 100vh;
		height: 100svh;
		min-height: 480px;
		overflow: hidden;
		background: #fcfcfc;
	}

	.hero-image {
		position: absolute;
		inset: 0;
		background-image: var(--hero-photo);
		background-position: var(--photo-pos);
		background-size: auto var(--photo-zoom);
		background-repeat: no-repeat;
		-webkit-mask-image: linear-gradient(
			to right,
			transparent 0%,
			transparent 8%,
			rgba(0, 0, 0, 0.06) 16%,
			rgba(0, 0, 0, 0.2) 24%,
			rgba(0, 0, 0, 0.45) 34%,
			rgba(0, 0, 0, 0.72) 44%,
			rgba(0, 0, 0, 0.92) 54%,
			black 65%
		);
		mask-image: linear-gradient(
			to right,
			transparent 0%,
			transparent 8%,
			rgba(0, 0, 0, 0.06) 16%,
			rgba(0, 0, 0, 0.2) 24%,
			rgba(0, 0, 0, 0.45) 34%,
			rgba(0, 0, 0, 0.72) 44%,
			rgba(0, 0, 0, 0.92) 54%,
			black 65%
		);
	}

	.lens-unit {
		position: absolute;
		left: var(--win-left);
		top: var(--win-top);
		width: var(--win-w);
		height: var(--win-h);
		z-index: 3;
		overflow: hidden;
		pointer-events: auto;
		border-radius: 1px;
		border: 1px solid rgba(255, 255, 255, 0.72);
		padding: 0;
		background: transparent;
		cursor: zoom-in;
		appearance: none;
	}

	.lens-photo {
		position: absolute;
		left: calc(-1 * var(--win-left));
		top: calc(-1 * var(--win-top));
		width: 100vw;
		height: 100vh;
		height: 100svh;
		background-color: #5a5a5a;
		background-position: var(--photo-pos);
		background-size: auto var(--photo-zoom);
		background-repeat: no-repeat;
		transition:
			transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
			filter 280ms ease;
		will-change: transform, filter;
		transform-origin: calc(var(--win-left) + var(--win-w) / 2)
			calc(var(--win-top) + var(--win-h) / 2);
	}

	.lens-unit :global(.viewfinder) {
		position: absolute !important;
		left: 0 !important;
		top: 0 !important;
		width: 100% !important;
		height: 100% !important;
	}

	@media (hover: hover) {
		.lens-unit:hover {
			border-color: rgba(179, 194, 178, 0.95);
		}
		.lens-unit:hover .lens-photo {
			transform: scale(1.015);
			filter: contrast(1.03) brightness(1.02);
		}
		.lens-unit:hover :global(.viewfinder) {
			box-shadow: 0 0 0 1px rgba(179, 194, 178, 0.9);
		}
		.lens-unit:hover :global(.viewfinder i) {
			width: 16px;
			height: 16px;
		}
		.lens-unit:hover :global(.viewfinder::before),
		.lens-unit:hover :global(.viewfinder::after) {
			opacity: 0;
		}
	}

	.lens-unit:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.lens-photo {
			transition: none;
		}
	}

	.blur {
		position: absolute;
		inset: 0;
		z-index: 1;
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		will-change: backdrop-filter;
		mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
		-webkit-mask-image: linear-gradient(#000 0 0), linear-gradient(#000 0 0);
		mask-size:
			100% 100%,
			var(--win-w) var(--win-h);
		-webkit-mask-size:
			100% 100%,
			var(--win-w) var(--win-h);
		mask-position:
			0 0,
			var(--win-left) var(--win-top);
		-webkit-mask-position:
			0 0,
			var(--win-left) var(--win-top);
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
		mask-composite: exclude;
		-webkit-mask-composite: xor;
	}

	.top-veil {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 7.5rem;
		z-index: 1;
		pointer-events: none;
		background: linear-gradient(
			to bottom,
			rgba(0, 0, 0, 0.28),
			rgba(0, 0, 0, 0.08) 60%,
			rgba(0, 0, 0, 0)
		);
		opacity: 0.9;
	}

	.panel {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: var(--panel-w);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: clamp(4.5rem, 9vw, 6rem) 0 clamp(1.75rem, 4vw, 2.5rem);
		padding-left: calc(var(--gutter) * 0.66);
		padding-right: calc(var(--panel-w) * 0.2);
		background: transparent;
		z-index: 2;
	}

	.brand {
		font-family: var(--font-heading);
		font-weight: 400;
		font-size: clamp(2rem, 3.2vw, 3.2rem);
		letter-spacing: -0.02em;
		line-height: 0.95;
		margin: 0;
		color: var(--color-text);
	}

	.desc {
		margin: 1.15rem 0 0;
		font: 400 clamp(0.82rem, 1.05vw, 0.95rem) / 1.65 var(--font-body);
		color: #1a1a1a;
		max-width: 20rem;
		text-wrap: pretty;
	}

	.quote {
		margin: 1.3rem 0 0;
		padding-left: 0.75rem;
		border-left: 0.8px solid var(--color-secondary);
		font: 400 0.88rem/1.5 var(--font-heading);
		font-style: italic;
		color: var(--color-text);
		letter-spacing: -0.01em;
		max-width: 18rem;
		opacity: 0.92;
	}

	.quote-attrib {
		font-style: normal;
		font-family: var(--font-body);
		font-weight: 500;
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		margin-left: 0.35rem;
		white-space: nowrap;
	}

	.panel-spacer {
		height: 1.5rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.scroll-cue {
		position: absolute;
		right: clamp(1.25rem, 3vw, 2.5rem);
		bottom: clamp(1.25rem, 3vw, 2rem);
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 56px;
		text-decoration: none;
		color: #fff;
	}

	.scroll-track {
		position: relative;
		display: block;
		width: 1px;
		height: 3.25rem;
		background: rgba(255, 255, 255, 0.32);
		overflow: visible;
		border-radius: 999px;
	}

	.scroll-line {
		position: absolute;
		left: 0;
		top: 0;
		width: 1px;
		height: 100%;
		background: #fff;
		transform-origin: top center;
		animation: pulseLineV 2.2s ease-in-out infinite;
		border-radius: 999px;
	}

	.scroll-dot {
		position: absolute;
		left: 50%;
		top: 0;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: #fff;
		transform: translate(-50%, -50%);
		box-shadow: 0 0 8px rgba(255, 255, 255, 0.85);
		animation: dotTravelV 2.2s ease-in-out infinite;
	}

	@keyframes pulseLineV {
		0% {
			transform: scaleY(0);
			opacity: 0.35;
		}
		12% {
			opacity: 1;
		}
		88% {
			opacity: 1;
		}
		100% {
			transform: scaleY(1);
			opacity: 0;
		}
	}

	@keyframes dotTravelV {
		0% {
			top: 0;
			opacity: 0.7;
		}
		12% {
			opacity: 1;
		}
		88% {
			opacity: 1;
		}
		100% {
			top: 100%;
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-line,
		.scroll-dot {
			animation: none;
		}
		.scroll-line {
			transform: scaleY(0.7);
		}
		.scroll-dot {
			top: 70%;
		}
	}

	@media (min-width: 761px) and (max-width: 1024px) {
		.hero {
			--panel-w: clamp(24rem, 42vw, 34rem);
			--win-w: min(calc((100vw - var(--panel-w)) * 0.48), 480px);
		}
	}

	@media (max-width: 760px) {
		.hero {
			--photo-pos: 50% 88%;
			--panel-w: min(70vw, 19.5rem);
			--win-w: 56vw;
			--win-left: calc((100vw - var(--win-w)) / 2 + 0.6rem);
			--win-top: calc((100svh - var(--win-h)) / 2 + 2.5vh);
			--gutter: 1.5rem;
		}

		.panel {
			padding: clamp(3.5rem, 12vw, 4.5rem) 0 1.25rem;
			padding-left: calc(var(--gutter) * 0.66);
			padding-right: calc(var(--panel-w) * 0.12);
		}

		.brand {
			font-size: clamp(1.75rem, 7vw, 2.2rem);
		}
		.desc {
			font-size: 0.86rem;
			line-height: 1.55;
			margin-top: 0.9rem;
			max-width: 17rem;
		}
		.quote {
			font-size: 0.82rem;
			margin-top: 1rem;
			padding-left: 0.7rem;
			max-width: 15rem;
		}
		.quote-attrib {
			font-size: 0.62rem;
		}

		.scroll-cue {
			right: 1.25rem;
			bottom: 1.1rem;
		}
	}

	@media (max-width: 480px) {
		.hero {
			--panel-w: min(78vw, 17.5rem);
			--win-w: 56vw;
			--gutter: 1.25rem;
			--photo-zoom: 140%;
			min-height: 440px;
		}
		.panel {
			padding-left: calc(var(--gutter) * 0.66);
			padding-right: calc(var(--panel-w) * 0.1);
		}
		.brand {
			font-size: 1.65rem;
		}
		.desc {
			font-size: 0.8rem;
			max-width: 14rem;
		}
		.quote {
			font-size: 0.76rem;
		}
	}

	@media (max-width: 360px) {
		.hero {
			--panel-w: 82vw;
			--gutter: 1rem;
		}
		.panel {
			padding-left: calc(var(--gutter) * 0.66);
			padding-right: 0.9rem;
		}
	}
</style>
