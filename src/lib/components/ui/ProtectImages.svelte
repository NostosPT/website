<script lang="ts">
	let visible = $state(false);
	let x = $state(0);
	let y = $state(0);
	let timeout: ReturnType<typeof setTimeout> | null = null;

	function show(e: MouseEvent) {
		const target = e.target as HTMLElement;
		// só para imagens / hero / galeria — mas para simplificar protege em todo o site
		// se quiseres só em fotos, descomenta:
		// const isImg = target.closest('img, .hero, .gallery, .lens-unit');
		// if (!isImg) return;
		e.preventDefault();
		const pad = 16;
		const w = 320;
		const h = 148;
		let nx = e.clientX + 12;
		let ny = e.clientY + 12;
		if (nx + w + pad > window.innerWidth) nx = window.innerWidth - w - pad;
		if (ny + h + pad > window.innerHeight) ny = window.innerHeight - h - pad;
		if (nx < pad) nx = pad;
		if (ny < pad) ny = pad;
		x = nx;
		y = ny;
		visible = true;
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => (visible = false), 3200);
	}

	function hide() {
		visible = false;
		if (timeout) clearTimeout(timeout);
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') hide();
	}
</script>

<svelte:window on:contextmenu={show} on:keydown={onKey} on:scroll={hide} />

{#if visible}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="guard-backdrop" onclick={hide} aria-hidden="true"></div>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<div
		class="guard"
		style:left="{x}px"
		style:top="{y}px"
		role="dialog"
		aria-label="Direitos reservados"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
	>
		<div class="guard-head">
			<span class="guard-mark">Nostos</span>
			<span class="guard-badge">© 2026</span>
		</div>
		<p class="guard-title">Direitos reservados</p>
		<p class="guard-text">
			As fotografias da Nostos não podem ser copiadas ou descarregadas sem autorização.
			<br />Para licenciamento ou impressões, contacta <a href="mailto:hello@nostos.studio">hello@nostos.studio</a>.
		</p>
	</div>
{/if}

<style>
	.guard-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10000;
		background: transparent;
		cursor: default;
	}

	.guard {
		position: fixed;
		z-index: 10001;
		width: 320px;
		background: #fcfcfc;
		border: 1px solid #b3c2b2;
		box-shadow:
			0 8px 32px rgba(6, 6, 6, 0.12),
			0 1px 0 rgba(6, 6, 6, 0.04);
		padding: 1rem 1.1rem 1rem;
		animation: in 160ms ease;
	}

	.guard-head {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: 0.6rem;
	}

	.guard-mark {
		font: 500 1rem/1 var(--font-heading);
		letter-spacing: -0.02em;
		color: #060606;
	}

	.guard-badge {
		font: 500 0.62rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #6e7c6e;
		border: 1px solid #b3c2b2;
		padding: 0.2rem 0.35rem;
	}

	.guard-title {
		margin: 0;
		font: 500 0.84rem/1.3 var(--font-heading);
		color: #060606;
	}

	.guard-text {
		margin: 0.4rem 0 0;
		font: 400 0.8rem/1.5 var(--font-body);
		color: #6e7c6e;
	}

	.guard-text a {
		color: #060606;
		text-underline-offset: 3px;
	}

	@keyframes in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.guard {
			animation: none;
		}
	}
</style>
