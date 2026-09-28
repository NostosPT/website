<script lang="ts">
	import { Button, CurrencyInput, Field, Input, Modal, Select, Switch, Textarea, toast } from '@nostospt/ui';
	import { LOCALE } from '$lib/admin/shared/format';
	import { services } from './store.svelte';
	import type { Service } from './types';

	let { open = $bindable(false), service }: { open?: boolean; service?: Service } = $props();

	const icons = ['car', 'user', 'users', 'calendar', 'heart', 'diamond', 'sparkles', 'image', 'globe'];

	let form = $state({ name: '', description: '', from: null as number | null, to: null as number | null, active: true, icon: 'sparkles' });
	let submitted = $state(false);
	let errors = $derived({
		name: submitted && !form.name.trim() ? 'Name is required.' : undefined,
		range: form.from != null && form.to != null && form.to < form.from ? '“To” must be at least “From”.' : undefined
	});

	$effect(() => {
		if (!open) return;
		submitted = false;
		form = service
			? {
					name: service.name,
					description: service.description ?? '',
					from: service.priceFromCents != null ? service.priceFromCents / 100 : null,
					to: service.priceToCents != null ? service.priceToCents / 100 : null,
					active: service.active,
					icon: service.icon
				}
			: { name: '', description: '', from: null, to: null, active: true, icon: 'sparkles' };
	});

	async function save(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (errors.name || errors.range) return;
		const fields = {
			name: form.name.trim(),
			description: form.description.trim() || null,
			priceFromCents: form.from != null ? Math.round(form.from * 100) : null,
			priceToCents: form.to != null ? Math.round(form.to * 100) : null,
			currency: 'EUR',
			active: form.active,
			icon: form.icon
		};
		try {
			if (service) await services.updateRemote(service.id, fields);
			else await services.createRemote(fields);
		} catch {
			// Offline backend: apply locally.
			if (service) services.update(service.id, fields);
			else services.create(fields);
		}
		toast.success(service ? 'Service updated' : 'Service added');
		open = false;
	}
</script>

<Modal bind:open title={service ? `Edit ${service.name}` : 'New service'} size="md">
	<form id="service-form" class="form" onsubmit={save}>
		<div class="row">
			<Field label="Name" error={errors.name}>
				{#snippet control({ id }: { id: string })}
					<Input {id} bind:value={form.name} invalid={Boolean(errors.name)} />
				{/snippet}
			</Field>
			<Field label="Icon">
				{#snippet control({ id }: { id: string })}
					<Select {id} bind:value={form.icon} options={icons.map((i) => ({ value: i, label: i }))} />
				{/snippet}
			</Field>
		</div>
		<Field label="Description" hint="Shown when a client picks a service.">
			{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
				<Textarea {id} bind:value={form.description} rows={3} aria-describedby={describedBy} />
			{/snippet}
		</Field>
		<div class="two">
			<Field label="Estimate from" optional error={errors.range}>
				{#snippet control({ id }: { id: string })}
					<CurrencyInput {id} bind:value={form.from} currency="EUR" currencies={['EUR']} locale={LOCALE} />
				{/snippet}
			</Field>
			<Field label="Estimate to" optional>
				{#snippet control({ id }: { id: string })}
					<CurrencyInput {id} bind:value={form.to} currency="EUR" currencies={['EUR']} locale={LOCALE} />
				{/snippet}
			</Field>
		</div>
		<Switch bind:checked={form.active} label="Offered on the website" description="Inactive services stay available for existing requests." />
	</form>
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button type="submit" form="service-form">{service ? 'Save' : 'Add service'}</Button>
	{/snippet}
</Modal>

<style>
	.form {
		display: grid;
		gap: var(--ui-space-10);
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		gap: var(--ui-space-8);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ui-space-8);
	}
</style>
