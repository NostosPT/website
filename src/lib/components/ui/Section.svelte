<script lang="ts">
	import Eyebrow from './Eyebrow.svelte';

	type Props = {
		id?: string;
		eyebrow?: string;
		title: string;
		description?: string;
		bleed?: boolean;
		children: import('svelte').Snippet;
	};

	let { id, eyebrow, title, description, bleed = false, children }: Props = $props();
</script>

<section {id} class="section" class:bleed aria-labelledby={id ? `${id}-heading` : undefined}>
	<div class="section-inner">
		<header class="section-head">
			{#if eyebrow}
				<Eyebrow>{eyebrow}</Eyebrow>
			{/if}
			<h2 id={id ? `${id}-heading` : undefined} class="section-title">{title}</h2>
			{#if description}
				<p class="section-desc">{description}</p>
			{/if}
		</header>

		<div class="section-body">
			{@render children()}
		</div>
	</div>
</section>

<style>
	.section {
		background: var(--paper);
		padding: clamp(3.5rem, 8vw, 7rem) clamp(1.25rem, 4vw, 2.75rem);
		border-top: 1px solid var(--rule);
	}

	.section.bleed {
		border-top: 0;
		padding-top: 0;
		padding-bottom: 0;
	}

	.section-inner {
		max-width: var(--content-max);
		margin: 0 auto;
	}

	.section-head {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		gap: 1rem;
		align-items: end;
		padding-bottom: clamp(1.5rem, 3vw, 2rem);
		margin-bottom: clamp(2rem, 4vw, 3rem);
		border-bottom: 1px solid var(--rule);
	}

	.section-title {
		grid-column: 1 / span 7;
		margin: 0.6rem 0 0;
		font: 400 clamp(1.9rem, 4.5vw, 3.4rem) / 0.98 var(--font-heading);
		letter-spacing: -0.03em;
		color: var(--color-text);
	}

	.section-desc {
		grid-column: 8 / span 5;
		margin: 0;
		font: 400 1rem / 1.6 var(--font-body);
		color: var(--muted);
		align-self: end;
	}

	@media (max-width: 900px) {
		.section-title {
			grid-column: 1 / -1;
		}
		.section-desc {
			grid-column: 1 / -1;
		}
	}
</style>
