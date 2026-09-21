<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	type Props = {
		src: string;
		alt?: string;
		open: boolean;
		onclose: () => void;
	};

	let { src, alt = '', open, onclose }: Props = $props();

	function onkeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
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
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<img
			{src}
			{alt}
			class="lightbox-img"
			onclick={(e) => e.stopPropagation()}
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
		cursor: default;
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
	}

	.lightbox-close:hover {
		background: rgba(252, 252, 252, 0.14);
	}

	@media (prefers-reduced-motion: reduce) {
		.lightbox,
		.lightbox-img {
			transition: none !important;
		}
	}
</style>
