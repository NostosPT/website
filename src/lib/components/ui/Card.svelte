<script lang="ts">
	type Props = {
		title: string;
		kicker?: string;
		meta?: string;
		image?: string;
		alt?: string;
		href?: string;
		variant?: 'default' | 'wide' | 'tall';
	};

	let { title, kicker, meta, image, alt = '', href, variant = 'default' }: Props = $props();
</script>

{#snippet inner()}
	<div class="card-media">
		{#if image}
			<img src={image} {alt} loading="lazy" decoding="async" />
		{:else}
			<div class="card-ph" aria-hidden="true">
				<span>—</span>
			</div>
		{/if}
		{#if kicker}
			<span class="card-kicker">{kicker}</span>
		{/if}
	</div>
	<div class="card-body">
		<h3 class="card-title">{title}</h3>
		{#if meta}
			<p class="card-meta">{meta}</p>
		{/if}
	</div>
{/snippet}

{#if href}
	<a {href} class="card card--{variant}" aria-label={title}>
		{@render inner()}
	</a>
{:else}
	<article class="card card--{variant}">
		{@render inner()}
	</article>
{/if}

<style>
	.card {
		display: flex;
		flex-direction: column;
		background: var(--paper);
		border: 1px solid var(--rule);
		text-decoration: none;
		color: inherit;
		transition:
			border-color 0.2s ease,
			transform 0.2s ease;
		overflow: hidden;
	}

	.card:hover {
		border-color: var(--color-accent);
		transform: translateY(-2px);
	}

	.card--wide {
		grid-column: span 8;
	}
	.card--tall {
		grid-column: span 4;
	}

	@media (max-width: 760px) {
		.card--wide,
		.card--tall,
		.card {
			grid-column: 1 / -1;
		}
	}

	.card-media {
		position: relative;
		aspect-ratio: 4 / 3;
		background: var(--paper-soft);
		overflow: hidden;
		display: grid;
		place-items: center;
		border-bottom: 1px solid var(--color-secondary);
	}

	.card-media img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: grayscale(1);
		transition:
			filter 0.4s ease,
			transform 0.4s ease;
	}

	.card:hover .card-media img {
		filter: grayscale(0);
		transform: scale(1.02);
	}

	.card-ph {
		font: 500 0.7rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted-2);
	}

	.card-kicker {
		position: absolute;
		top: 0.9rem;
		left: 0.9rem;
		background: var(--paper);
		border: 1px solid var(--color-secondary);
		padding: 0.35rem 0.5rem;
		font: 500 0.6rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-text);
	}

	.card-body {
		padding: 1.1rem 1.1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.card-title {
		margin: 0;
		font: 400 1.15rem/1.2 var(--font-heading);
		letter-spacing: -0.02em;
		color: var(--color-text);
	}

	.card-meta {
		margin: 0;
		font: 400 0.82rem/1.5 var(--font-body);
		color: var(--muted);
	}
</style>
