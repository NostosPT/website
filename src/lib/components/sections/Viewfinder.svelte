<script lang="ts">
	type Props = {
		settings?: string;
		date?: string;
	};

	let { settings = 'f/2.8 · 1/250 · ISO 100', date = 'SEPT 2026' }: Props = $props();
</script>

<div class="viewfinder" aria-hidden="true">
	<i></i><i></i><i></i><i></i>
	<small class="settings">{settings}</small>
	<small class="date">{date}</small>
</div>

<style>
	.viewfinder {
		position: absolute;
		left: var(--win-left);
		top: var(--win-top);
		width: var(--win-w);
		height: var(--win-h);
		pointer-events: none;
		color: rgba(255, 255, 255, 0.95);
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
		z-index: 3;
		transition: box-shadow 280ms ease;
	}

	.viewfinder i {
		position: absolute;
		width: 22px;
		height: 22px;
		border: 1.5px solid currentColor;
		transition:
			width 140ms ease,
			height 140ms ease,
			top 140ms ease,
			left 140ms ease,
			right 140ms ease,
			bottom 140ms ease;
	}

	.viewfinder i:nth-child(1) {
		top: 14px;
		left: 14px;
		border-right: 0;
		border-bottom: 0;
	}
	.viewfinder i:nth-child(2) {
		top: 14px;
		right: 14px;
		border-left: 0;
		border-bottom: 0;
	}
	.viewfinder i:nth-child(3) {
		bottom: 14px;
		left: 14px;
		border-right: 0;
		border-top: 0;
	}
	.viewfinder i:nth-child(4) {
		bottom: 14px;
		right: 14px;
		border-left: 0;
		border-top: 0;
	}

	@media (max-width: 480px) {
		.viewfinder i {
			width: 16px;
			height: 16px;
		}
		.viewfinder i:nth-child(1),
		.viewfinder i:nth-child(2) {
			top: 10px;
		}
		.viewfinder i:nth-child(1),
		.viewfinder i:nth-child(3) {
			left: 10px;
		}
		.viewfinder i:nth-child(2),
		.viewfinder i:nth-child(4) {
			right: 10px;
		}
		.viewfinder i:nth-child(3),
		.viewfinder i:nth-child(4) {
			bottom: 10px;
		}
	}

	.viewfinder::before,
	.viewfinder::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		background: currentColor;
		opacity: 0.8;
		transition: opacity 120ms ease;
	}
	.viewfinder::before {
		width: 14px;
		height: 1px;
		transform: translate(-50%, -50%);
	}
	.viewfinder::after {
		width: 1px;
		height: 14px;
		transform: translate(-50%, -50%);
	}

	.viewfinder small.settings {
		position: absolute;
		left: 44px;
		bottom: 14px;
		font: 500 10px/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.9;
	}

	.viewfinder small.date {
		position: absolute;
		right: 44px;
		bottom: 14px;
		font: 500 9px/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		opacity: 0.85;
	}

	@media (max-width: 480px) {
		.viewfinder small.settings {
			left: 30px;
			bottom: 10px;
			font-size: 8px;
		}
		.viewfinder small.date {
			right: 30px;
			bottom: 10px;
			font-size: 8px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.viewfinder,
		.viewfinder i,
		.viewfinder::before,
		.viewfinder::after {
			transition: none;
		}
	}
</style>
