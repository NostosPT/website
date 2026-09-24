<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, DatePicker, Field, Input, Modal, Select, Switch, Textarea, toast } from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { services } from '$lib/admin/services/store.svelte';
	import { LOCALE } from '$lib/admin/shared/format';
	import { galleries } from './store.svelte';

	let { open = $bindable(false), clientId = '' }: { open?: boolean; clientId?: string } = $props();

	let title = $state('');
	let client = $state('');
	let service = $state('');
	let message = $state('');
	let withCode = $state(true);
	let allowDownload = $state(false);
	let expires = $state<Date | undefined>();
	let submitted = $state(false);

	let errors = $derived({
		title: submitted && !title.trim() ? 'Give the gallery a title.' : undefined,
		client: submitted && !client ? 'Choose who it is for.' : undefined
	});

	$effect(() => {
		if (!open) return;
		title = message = service = '';
		client = clientId;
		withCode = true;
		allowDownload = false;
		// Galleries stay open for 60 days by default.
		expires = new Date(Date.now() + 60 * 86_400_000);
		submitted = false;
	});

	function create(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (errors.title || errors.client) return;
		const { gallery } = galleries.create({
			title: title.trim(),
			message: message.trim() || null,
			clientId: client,
			serviceId: service || null,
			allowDownload,
			expiresAt: expires?.toISOString() ?? null,
			withCode
		});
		open = false;
		toast.success(`“${gallery.title}” created`, { description: 'Add photos, then share it.' });
		goto(`/admin/galleries/${gallery.id}`);
	}
</script>

<Modal bind:open title="New client gallery" description="A private delivery, shared by link." size="md">
	<form id="gallery-form" class="form" onsubmit={create}>
		<Field label="Title" error={errors.title}>
			{#snippet control({ id }: { id: string })}
				<Input {id} bind:value={title} placeholder="e.g. Quinta da Regaleira" invalid={Boolean(errors.title)} />
			{/snippet}
		</Field>
		<div class="two">
			<Field label="Client" error={errors.client}>
				{#snippet control({ id }: { id: string })}
					<Select {id} bind:value={client} placeholder="Choose…" options={clients.options} invalid={Boolean(errors.client)} />
				{/snippet}
			</Field>
			<Field label="Service" optional>
				{#snippet control({ id }: { id: string })}
					<Select {id} bind:value={service} options={[{ value: '', label: 'None' }, ...services.options]} />
				{/snippet}
			</Field>
		</div>
		<Field label="Message to the client" optional>
			{#snippet control({ id }: { id: string })}
				<Textarea {id} bind:value={message} rows={3} placeholder="Shown at the top of the gallery." />
			{/snippet}
		</Field>
		<Field label="Open until">
			{#snippet control({ id }: { id: string })}
				<DatePicker {id} bind:value={expires} locale={LOCALE} min={new Date()} />
			{/snippet}
		</Field>
		<Switch bind:checked={withCode} label="Require an access code" description="Generated now and shown once; the link alone won't open it." />
		<Switch bind:checked={allowDownload} label="Allow downloads" description="Clients can download originals, not just view proofs." />
	</form>
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button type="submit" form="gallery-form">Create gallery</Button>
	{/snippet}
</Modal>

<style>
	.form {
		display: grid;
		gap: var(--ui-space-10);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ui-space-8);
	}
</style>
