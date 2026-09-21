<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	type Photo = { src: string; alt?: string };

	type Props = {
		src?: string;
		alt?: string;
		open: boolean;
		onclose: () => void;
		photos?: Photo[];
		index?: number | null;
		onIndexChange?: (i: number) => void;
	};

	let { src, alt = '', open, onclose, photos, index = null, onIndexChange }: Props = $props();

	// Deriva src/alt a partir de photos+index quando fornecido (galeria)
	let displaySrc = $derived(
		photos && index !== null && index !== undefined && photos[index] ? photos[index].src : (src ?? '')
	);
	let displayAlt = $derived(
		photos && index !== null && index !== undefined && photos[index] ? (photos[index].alt ?? alt) : alt
	);
	let count = $derived(photos?.length ?? 0);
	let hasNav = $derived(!!photos && count > 1 && index !== null);

	let side: 'left' | 'right' = $state('right');

	function onkeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') onclose();
		if (!hasNav || index === null) return;
		if (e.key === 'ArrowLeft') prev(e);
		if (e.key === 'ArrowRight') next(e);
	}

	function prev(e?: Event) {
		e?.stopPropagation();
		if (!hasNav || index === null || !photos) return;
		const nextIdx = (index - 1 + photos.length) % photos.length;
		onIndexChange?.(nextIdx);
	}

	function next(e?: Event) {
		e?.stopPropagation();
		if (!hasNav || index === null || !photos) return;
		const nextIdx = (index + 1) % photos.length;
		onIndexChange?.(nextIdx);
	}

	function onImgClick(e: MouseEvent) {
		e.stopPropagation();
		if (!hasNav) return;
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left;
		if (x < rect.width / 2) prev();
		else next();
	}

	function onImgMove(e: MouseEvent) {
		if (!hasNav) return;
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = e.clientX - rect.left;
		side = x < rect.width / 2 ? 'left' : 'right';
	}

	$effect(() => {
		if (!open) return;
		const prevOverflow = document.body.style.overflow;
		const prevPadding = document.body.style.paddingRight;
		const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = 'hidden';
		if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
		return () => {
			document.body.style.overflow = prevOverflow;
			document.body.style.paddingRight = prevPadding;
		};
	});
</script>

<svelte:window onkeydown={onkeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="lightbox"
		onclick={onclose}
		transition:fade={{ duration: 220 }}
	>
		<button class="lightbox-close" onclick={onclose} aria-label="Fechar">×</button>

		{#if hasNav}
			<button class="nav nav--left" onclick={prev} aria-label="Anterior">‹</button>
			<button class="nav nav--right" onclick={next} aria-label="Seguinte">›</button>
			<span class="counter">{(index ?? 0) + 1} / {count}</span>
		{/if}

		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<img
			src={displaySrc}
			alt={displayAlt}
			class="lightbox-img"
			class:with-nav={hasNav}
			style:cursor={hasNav ? (side === 'left' ? 'w-resize' : 'e-resize') : 'default'}
			onclick={onImgClick}
			onmousemove={onImgMove}
			in:scale={{ duration: 260, start: 0.96, opacity: 0 }}
			out:scale={{ duration: 200, start: 0.98, opacity: 0 }}
		/>
	</div>
{/if}

<style>
	.lightbox {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(6, 6, 6, 0.92);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		display: grid;
		place-items: center;
		padding: clamp(1rem, 4vw, 3rem);
		cursor: zoom-out;
	}

	.lightbox-img {
		max-width: min(92vw, 1400px);
		max-height: 92vh;
		width: auto;
		height: auto;
		object-fit: contain;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
	}

	.lightbox-img.with-nav {
		cursor: e-resize;
	}

	.lightbox-close {
		position: absolute;
		top: 1.25rem;
		right: 1.25rem;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 999px;
		border: 1px solid rgba(252, 252, 252, 0.2);
		background: rgba(252, 252, 252, 0.08);
		color: #fcfcfc;
		font: 500 1.4rem/1 var(--font-body);
		display: grid;
		place-items: center;
		cursor: pointer;
		z-index: 1;
	}

	.lightbox-close:hover {
		background: rgba(252, 252, 252, 0.14);
	}

	.nav {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 3rem;
		height: 3rem;
		border-radius: 999px;
		border: 1px solid rgba(252, 252, 252, 0.18);
		background: rgba(252, 252, 252, 0.08);
		color: #fcfcfc;
		font: 500 1.8rem/1 var(--font-body);
		display: grid;
		place-items: center;
		cursor: pointer;
		z-index: 1;
		padding-bottom: 0.15rem;
	}

	.nav:hover {
		background: rgba(252, 252, 252, 0.14);
	}

	.nav--left {
		left: clamp(0.75rem, 2vw, 1.5rem);
	}

	.nav--right {
		right: clamp(0.75rem, 2vw, 1.5rem);
	}

	.counter {
		position: absolute;
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		font: 500 0.72rem/1 var(--font-body);
		letter-spacing: 0.08em;
		color: rgba(252, 252, 252, 0.72);
		background: rgba(6, 6, 6, 0.22);
		border: 1px solid rgba(252, 252, 252, 0.12);
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
	}

	@media (max-width: 600px) {
		.nav {
			width: 2.5rem;
			height: 2.5rem;
			font-size: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lightbox,
		.lightbox-img {
			transition: none !important;
		}
	}
</style>
