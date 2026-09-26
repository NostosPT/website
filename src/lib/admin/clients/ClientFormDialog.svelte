<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Button,
		COUNTRIES,
		Field,
		Input,
		Modal,
		PhoneInput,
		Select,
		TagInput,
		Textarea,
		toast
	} from '@nostospt/ui';
	import { isEmail } from '$lib/admin/mail/store.svelte';
	import { clients, clientStatus } from './store.svelte';
	import type { Client, ClientStatus, LeadSource } from './types';

	/** Create a client, or edit one when `client` is given. */
	let { open = $bindable(false), client }: { open?: boolean; client?: Client } = $props();

	const sources: { value: LeadSource; label: string }[] = [
		{ value: 'website', label: 'Website request' },
		{ value: 'email', label: 'Email' },
		{ value: 'referral', label: 'Referral' },
		{ value: 'instagram', label: 'Instagram' },
		{ value: 'archive', label: 'Archive purchase' }
	];

	let form = $state(blank());
	let submitted = $state(false);

	function blank() {
		return {
			name: '',
			email: '',
			country: 'PT',
			phone: '',
			company: '',
			taxId: '',
			address: '',
			tags: [] as string[],
			status: 'LEAD' as ClientStatus,
			source: 'email' as LeadSource,
			notes: ''
		};
	}

	/** "+351 912 345 678" → country PT, local "912 345 678". */
	function splitPhone(phone: string | null) {
		if (!phone) return { country: 'PT', phone: '' };
		const match = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length).find((c) => phone.startsWith(c.dial));
		return match ? { country: match.iso, phone: phone.slice(match.dial.length).trim() } : { country: 'PT', phone };
	}

	$effect(() => {
		if (!open) return;
		submitted = false;
		form = client
			? {
					...blank(),
					...splitPhone(client.phone),
					name: client.name,
					email: client.email,
					company: client.company ?? '',
					taxId: client.taxId ?? '',
					address: client.address ?? '',
					tags: [...client.tags],
					status: client.status,
					source: client.source,
					notes: client.notes ?? ''
				}
			: blank();
	});

	let errors = $derived({
		name: submitted && !form.name.trim() ? 'Name is required.' : undefined,
		email: submitted && !isEmail(form.email) ? 'Enter a valid email.' : undefined,
		taxId: submitted && form.taxId && !/^\d{9}$/.test(form.taxId) ? 'A Portuguese NIF has 9 digits.' : undefined
	});

	function save(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (errors.name || errors.email || errors.taxId) return;
		const dial = COUNTRIES.find((c) => c.iso === form.country)?.dial ?? '';
		const fields = {
			name: form.name.trim(),
			email: form.email.trim().toLowerCase(),
			phone: form.phone.trim() ? `${dial} ${form.phone.trim()}` : null,
			company: form.company.trim() || null,
			taxId: form.taxId.trim() || null,
			address: form.address.trim() || null,
			tags: form.tags,
			status: form.status,
			source: form.source,
			notes: form.notes.trim() || null
		};
		if (client) {
			clients.update(client.id, fields);
			toast.success('Client updated');
		} else {
			const created = clients.create(fields);
			toast.success(`${created.name} added`);
			goto(`/admin/clients/${created.id}`);
		}
		open = false;
	}
</script>

<Modal bind:open title={client ? `Edit ${client.name}` : 'New client'} size="lg">
	<form id="client-form" class="form" onsubmit={save}>
		<div class="two">
			<Field label="Name" error={errors.name}>
				{#snippet control({ id }: { id: string })}
					<Input {id} bind:value={form.name} invalid={Boolean(errors.name)} />
				{/snippet}
			</Field>
			<Field label="Company" optional>
				{#snippet control({ id }: { id: string })}
					<Input {id} bind:value={form.company} />
				{/snippet}
			</Field>
			<Field label="Email" error={errors.email}>
				{#snippet control({ id }: { id: string })}
					<Input {id} type="email" icon="mail" bind:value={form.email} invalid={Boolean(errors.email)} />
				{/snippet}
			</Field>
			<Field label="Phone" optional>
				{#snippet control({ id }: { id: string })}
					<PhoneInput {id} bind:country={form.country} bind:value={form.phone} />
				{/snippet}
			</Field>
			<Field label="NIF" optional hint="Needed on invoices." error={errors.taxId}>
				{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
					<Input {id} bind:value={form.taxId} inputmode="numeric" maxlength={9} aria-describedby={describedBy} invalid={Boolean(errors.taxId)} />
				{/snippet}
			</Field>
			<Field label="Billing address" optional>
				{#snippet control({ id }: { id: string })}
					<Input {id} bind:value={form.address} />
				{/snippet}
			</Field>
			<Field label="Status">
				{#snippet control({ id }: { id: string })}
					<Select
						{id}
						bind:value={form.status}
						options={Object.entries(clientStatus).map(([value, s]) => ({ value, label: s.label }))}
					/>
				{/snippet}
			</Field>
			<Field label="Source">
				{#snippet control({ id }: { id: string })}
					<Select {id} bind:value={form.source} options={sources} />
				{/snippet}
			</Field>
		</div>
		<Field label="Tags" optional>
			{#snippet control({ id }: { id: string })}
				<TagInput {id} bind:value={form.tags} placeholder="Wedding, Commercial…" />
			{/snippet}
		</Field>
		<Field label="Notes" optional>
			{#snippet control({ id }: { id: string })}
				<Textarea {id} bind:value={form.notes} rows={3} autogrow />
			{/snippet}
		</Field>
	</form>
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button type="submit" form="client-form">{client ? 'Save' : 'Add client'}</Button>
	{/snippet}
</Modal>

<style>
	.form {
		display: grid;
		gap: var(--ui-space-10);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--ui-space-10) var(--ui-space-8);
	}
	@media (max-width: 640px) {
		.two {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
