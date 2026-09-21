<script lang="ts">
	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer-inner">
		<div class="footer-brand">
			<span class="footer-mark">Nostos</span>
			<p class="footer-tagline">
				Quiet frames, meaningful stories, and the long way home.<br
				/>Lisbon — and the places around it.
			</p>
		</div>

		<nav class="footer-nav" aria-label="Footer">
			<div class="footer-col">
				<p class="footer-kicker">Contact</p>
				<p class="footer-address">
					<a href="mailto:hello@nostos.studio">hello@nostos.studio</a>
				</p>
			</div>
			<div class="footer-col">
				<p class="footer-kicker">Follow</p>
				<ul>
					<li>
						<a
							href="https://instagram.com"
							target="_blank"
							rel="noreferrer">Instagram</a
						>
					</li>
				</ul>
			</div>
			<div class="footer-col">
				<p class="footer-kicker">Info</p>
				<ul>
					<li>
						<a href="mailto:hello@nostos.studio"
							>Prints &amp; enquiries</a
						>
					</li>
					<li>
						<span class="footer-muted">About Nostos</span>
					</li>
				</ul>
			</div>
		</nav>
	</div>

	<div class="footer-bottom">
		<p>© {year} Nostos. All rights reserved.</p>
		<p class="footer-legal">
			No trackers. No ad cookies. Just photography.
		</p>
	</div>
</footer>

<style>
	.footer {
		background: var(--ink);
		color: #f0efec;
		padding: clamp(2.5rem, 6vw, 4.5rem) clamp(1.25rem, 4vw, 2.75rem) 2rem;
	}

	.footer-inner {
		max-width: var(--content-max);
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1.2fr 1.8fr;
		gap: clamp(2rem, 5vw, 4rem);
		padding-bottom: 2.5rem;
		border-bottom: 1px solid #2a2a2a;
	}

	@media (max-width: 860px) {
		.footer-inner {
			grid-template-columns: 1fr;
		}
	}

	.footer-mark {
		font: 500 clamp(1.8rem, 3vw, 2.4rem) / 1 var(--font-heading);
		letter-spacing: -0.02em;
		color: #fcfcfc;
	}

	.footer-tagline {
		margin: 0.9rem 0 0;
		max-width: 26rem;
		font: 400 0.95rem/1.6 var(--font-body);
		color: #b3c2b2;
	}

	.footer-nav {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
	}

	@media (max-width: 600px) {
		.footer-nav {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 480px) {
		.footer {
			padding: 2rem 1.25rem 1.5rem;
		}
		.footer-nav {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
		.footer-bottom {
			flex-direction: column;
			gap: 0.5rem;
		}
	}

	.footer-kicker {
		margin: 0 0 1rem;
		font: 500 0.62rem/1 var(--font-body);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-secondary);
	}

	.footer-nav ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.6rem;
	}

	.footer-nav a {
		color: #f0efec;
		text-decoration: none;
		font: 400 0.9rem/1.4 var(--font-body);
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s;
	}

	.footer-nav a:hover {
		border-bottom-color: var(--color-accent);
	}

	.footer-address {
		margin: 0;
		font: 400 0.9rem/1.6 var(--font-body);
		color: #d6d5d0;
	}

	.footer-address a {
		color: inherit;
	}

	.footer-muted {
		color: #b3c2b2;
		font: 400 0.85rem/1.4 var(--font-body);
	}

	.footer-bottom {
		max-width: var(--content-max);
		margin: 0 auto;
		padding-top: 1.5rem;
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		font: 400 0.78rem/1.5 var(--font-body);
		color: #7e7d7a;
	}

	.footer-bottom p {
		margin: 0;
	}
</style>
