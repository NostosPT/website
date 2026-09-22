<script lang="ts">
	import { page } from '$app/state';

	type Link = { label: string; href: string };

	type Props = {
		links?: Link[];
		activeId?: string;
	};

	let { links = [], activeId }: Props = $props();

	let scrolled = $state(false);

	$effect(() => {
		if (typeof window === 'undefined') return;

		const onScroll = () => {
			scrolled = window.scrollY > 8;
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	let pathname = $derived(page.url.pathname);
	let isLightPage = $derived(pathname !== '/');
	let effectiveScrolled = $derived(isLightPage || scrolled);
</script>

<nav class="navbar" class:scrolled={effectiveScrolled} aria-label="Primary">
	<div class="navbar-inner">
		<a class="navbar-brand" href="/" aria-label="Nostos — home">
			<span class="brand-mark" class:visible={effectiveScrolled}>Nostos</span>
			<span class="brand-sep" class:visible={effectiveScrolled} aria-hidden="true">—</span>
			<span class="brand-sub">Photography</span>
		</a>

		{#if links.length > 0}
			<ul class="navbar-links">
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							aria-current={activeId === link.href.replace("#", "")
								? "page"
								: undefined}
						>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</nav>

<style>
	.navbar {
		position: fixed;
		inset: 0 0 auto 0;
		z-index: 40;
		pointer-events: none;
		transition:
			background-color 0.35s ease,
			backdrop-filter 0.35s ease,
			border-color 0.35s ease,
			box-shadow 0.35s ease;
		border-bottom: 1px solid transparent;
	}

	.navbar-inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1.1rem clamp(1.25rem, 4vw, 2.75rem) 1.1rem
			calc(var(--gutter) * 0.66);
		pointer-events: auto;
		max-width: 100%;
	}

	.brand-mark {
		font-family: var(--font-heading);
		font-weight: 400;
		font-size: 1.15rem;
		letter-spacing: -0.02em;
		color: var(--color-text);
		opacity: 0;
		transform: translateY(4px);
		max-width: 0;
		overflow: hidden;
		white-space: nowrap;
		transition:
			opacity 0.35s ease,
			transform 0.35s ease,
			max-width 0.35s ease,
			margin 0.35s ease;
		display: inline-block;
		vertical-align: middle;
		margin-right: 0;
	}

	.brand-mark.visible {
		opacity: 1;
		transform: translateY(0);
		max-width: 6rem;
		margin-right: 0.45rem;
	}

	.brand-sep {
		opacity: 0;
		transform: translateY(4px);
		transition:
			opacity 0.3s ease 0.05s,
			transform 0.3s ease 0.05s;
		color: var(--muted);
		font: 400 0.75rem/1 var(--font-heading);
		margin-right: 0;
		max-width: 0;
		overflow: hidden;
		display: inline-block;
	}
	.brand-sep.visible {
		opacity: 1;
		transform: translateY(0);
		max-width: 1rem;
		margin-right: 0.45rem;
	}

	.navbar-brand {
		display: inline-flex;
		align-items: baseline;
		text-decoration: none;
		white-space: nowrap;
		font: 500 0.62rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.brand-sub {
		color: var(--muted);
		transition: color 0.35s ease;
	}

	.scrolled .brand-sub {
		color: var(--muted);
	}

	/* Links — UI per brand: Raleway, sentence case, restrained */
	.navbar-links {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		gap: clamp(1.25rem, 2.6vw, 2.5rem);
		font: 500 0.82rem/1 var(--font-body);
		letter-spacing: 0.02em;
		text-transform: none;
	}

	.navbar-links a {
		color: #fff;
		text-decoration: none;
		padding-bottom: 0.35rem;
		border-bottom: 1px solid transparent;
		text-shadow: 0 1px 12px rgba(0, 0, 0, 0.55);
		transition:
			color 0.35s ease,
			border-color 0.2s ease,
			text-shadow 0.35s ease;
	}

	.navbar-links a:hover,
	.navbar-links a[aria-current="page"] {
		border-bottom-color: var(--color-primary);
	}

	/* Scrolled state: blurry background, secondary border */
	.navbar.scrolled {
		background: rgba(252, 252, 252, 0.84);
		backdrop-filter: blur(16px) saturate(180%);
		-webkit-backdrop-filter: blur(16px) saturate(180%);
		border-bottom-color: var(--color-secondary);
		box-shadow: 0 1px 0 rgba(179, 194, 178, 0.35);
	}

	.navbar.scrolled .navbar-links a {
		color: var(--color-text);
		text-shadow: none;
	}

	.navbar.scrolled .navbar-links a:hover,
	.navbar.scrolled .navbar-links a[aria-current="page"] {
		border-bottom-color: var(--color-primary);
	}

	@media (max-width: 760px) {
		.navbar {
			--gutter: 1.5rem;
		}
		.navbar-inner {
			padding: 0.9rem 1.25rem 0.9rem calc(var(--gutter) * 0.66);
		}
		.navbar-links li:not(:last-child) {
			display: none;
		}
		.brand-mark {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.navbar {
			--gutter: 1.25rem;
		}
		.navbar-inner {
			padding: 0.85rem 1rem 0.85rem calc(var(--gutter) * 0.66);
		}
		.navbar-brand {
			font-size: 0.58rem;
		}
		.brand-mark {
			font-size: 0.95rem;
		}
	}
</style>
