<script lang="ts">
	import {
		Alert,
		Button,
		Card,
		CardBody,
		CardHeader,
		DatePicker,
		Field,
		Input,
		Modal,
		NumberInput,
		Switch,
		Textarea,
		toast
	} from '@nostospt/ui';
	import { LOCALE } from '$lib/admin/shared/format';
	import { watermarks } from '$lib/admin/watermark/store.svelte';
	import { galleries } from './store.svelte';
	import type { Gallery } from './types';

	let { gallery }: { gallery: Gallery } = $props();

	let confirmRotate = $state(false);
	let link = $derived(galleries.shareUrl(gallery));
	let revealed = $derived(galleries.revealedCodes[gallery.id]);
	let proofPreset = $derived(watermarks.get(watermarks.rules.galleryProofs));

	let expires = $state<Date | undefined>();
	$effect(() => {
		expires = gallery.expiresAt ? new Date(gallery.expiresAt) : undefined;
	});

	async function copy(text: string, what: string) {
		await navigator.clipboard.writeText(text);
		toast.success(`${what} copied`);
	}

	function rotate() {
		galleries.rotateLink(gallery.id);
		confirmRotate = false;
		toast.success('New link created', { description: 'The old link stopped working.' });
	}
</script>

<div class="cards">
	<Card>
		<CardHeader title="Link" description="Anyone with the link, and the code if set, can open the gallery." divided />
		<CardBody>
			<div class="stack">
				<div class="row">
					<Input value={link} readonly aria-label="Gallery link" icon="link" />
					<Button variant="outline" icon="copy" onclick={() => copy(link, 'Link')}>Copy</Button>
				</div>

				{#if revealed}
					<Alert tone="warning" title={`Access code: ${revealed}`} dismissible ondismiss={() => delete galleries.revealedCodes[gallery.id]}>
						Copy it now. Only its hash is stored, so it can't be shown again.
						{#snippet actions()}
							<Button size="sm" variant="outline" icon="copy" onclick={() => copy(revealed, 'Code')}>Copy code</Button>
						{/snippet}
					</Alert>
				{/if}

				<Switch
					checked={gallery.hasAccessCode}
					label="Require an access code"
					description={gallery.hasAccessCode ? 'A code is set. Replacing it signs out anyone who used the old one.' : 'Link-only access.'}
					onchange={(e: Event) => galleries.setAccessCode(gallery.id, (e.currentTarget as HTMLInputElement).checked)}
				/>
				<div class="buttons">
					{#if gallery.hasAccessCode}
						<Button size="sm" variant="outline" icon="rotate-ccw" onclick={() => galleries.setAccessCode(gallery.id, true)}>New code</Button>
					{/if}
					<Button size="sm" variant="outline" tone="danger" icon="link-diagonal" onclick={() => (confirmRotate = true)}>Replace link</Button>
				</div>
			</div>
		</CardBody>
	</Card>

	<Card>
		<CardHeader title="Client experience" divided />
		<CardBody>
			<div class="stack">
				<Field label="Message" hint="Shown at the top of the gallery.">
					{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
						<Textarea
							{id}
							value={gallery.message ?? ''}
							rows={3}
							autogrow
							aria-describedby={describedBy}
							onchange={(e: Event) => galleries.update(gallery.id, { message: (e.currentTarget as HTMLTextAreaElement).value || null })}
						/>
					{/snippet}
				</Field>
				<div class="two">
					<Field label="Open until">
						{#snippet control({ id }: { id: string })}
							<DatePicker
								{id}
								bind:value={expires}
								locale={LOCALE}
								onchange={(date: Date | undefined) => galleries.update(gallery.id, { expiresAt: date?.toISOString() ?? null })}
							/>
						{/snippet}
					</Field>
					<Field label="Favourites limit" optional hint="e.g. photos included in the album">
						{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
							<NumberInput
								{id}
								value={gallery.selectionLimit ?? 0}
								min={0}
								max={2000}
								aria-describedby={describedBy}
								onchange={(value: number) => galleries.update(gallery.id, { selectionLimit: value || null })}
							/>
						{/snippet}
					</Field>
				</div>
				<Switch
					checked={gallery.allowDownload}
					label="Allow downloads"
					description="Originals become downloadable. Keep off while the client is still proofing."
					onchange={(e: Event) => galleries.update(gallery.id, { allowDownload: (e.currentTarget as HTMLInputElement).checked })}
				/>
				<p class="watermark">
					Proofs use the <a href="/admin/watermarks">{proofPreset ? `“${proofPreset.name}”` : 'no'}</a> watermark.
				</p>
			</div>
		</CardBody>
	</Card>
</div>

<Modal bind:open={confirmRotate} title="Replace the link?" description="The current link stops working immediately. Send the client the new one." size="sm">
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button tone="danger" onclick={rotate}>Replace link</Button>
	{/snippet}
</Modal>

<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: var(--ui-space-12);
		align-items: start;
	}
	.stack {
		display: grid;
		gap: var(--ui-space-10);
	}
	.row {
		display: flex;
		gap: var(--ui-space-4);
	}
	.row > :global(:first-child) {
		flex: 1;
	}
	.buttons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ui-space-4);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ui-space-8);
	}
	.watermark {
		margin: 0;
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
	}
	.watermark a {
		color: var(--ui-accent-text);
	}
</style>
