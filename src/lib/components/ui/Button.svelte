<script lang="ts">
	type Props = {
		href?: string;
		variant?: 'primary' | 'ghost' | 'quiet';
		size?: 'sm' | 'md';
		children: import('svelte').Snippet;
		onclick?: () => void;
		ariaLabel?: string;
	};

	let { href, variant = 'primary', size = 'md', children, onclick, ariaLabel }: Props = $props();

	const cls = $derived(
		['btn', `btn--${variant}`, `btn--${size}`].join(' ')
	);
</script>

{#if href}
	<a {href} class={cls} aria-label={ariaLabel}>
		<span class="btn-label">{@render children()}</span>
	</a>
{:else}
	<button class={cls} onclick={onclick} aria-label={ariaLabel}>
		<span class="btn-label">{@render children()}</span>
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		font: 500 0.7rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		text-decoration: none;
		border: 1px solid transparent;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
		white-space: nowrap;
	}

	.btn--sm {
		padding: 0.65rem 1rem;
	}

	.btn--md {
		padding: 0.9rem 1.35rem;
	}

	.btn--primary {
		background: var(--color-primary);
		color: var(--color-background);
		border-color: var(--color-primary);
	}
	.btn--primary:hover {
		background: var(--color-accent);
		border-color: var(--color-accent);
		transform: translateY(-1px);
	}

	.btn--ghost {
		background: transparent;
		color: var(--color-text);
		border-color: var(--color-text);
	}
	.btn--ghost:hover {
		background: var(--color-text);
		color: var(--color-background);
	}

	.btn--quiet {
		background: transparent;
		color: var(--color-text);
		border-color: var(--color-secondary);
	}
	.btn--quiet:hover {
		border-color: var(--color-text);
	}

	.btn-label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
