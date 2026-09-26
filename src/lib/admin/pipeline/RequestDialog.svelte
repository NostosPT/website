<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		Badge,
		Button,
		CurrencyInput,
		DataList,
		DataListRow,
		DatePicker,
		Field,
		Input,
		Modal,
		NumberInput,
		Select,
		Textarea,
		toast
	} from '@nostospt/ui';
	import { session } from '$lib/admin/auth/session.svelte';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { mail } from '$lib/admin/mail/store.svelte';
	import { services } from '$lib/admin/services/store.svelte';
	import { formatPriceRange, formatRelative, LOCALE } from '$lib/admin/shared/format';
	import { team } from '$lib/admin/team/store.svelte';
	import { pipeline, stages, stageStatus } from './store.svelte';
	import type { ServiceRequest } from './types';

	let { request, open = $bindable(false) }: { request: ServiceRequest; open?: boolean } = $props();

	// The page keys this dialog by request id.
	let form = $state(
		untrack(() => ({
			stage: request.stage,
			assigneeId: request.assigneeId ?? '',
			date: request.project.date ? new Date(request.project.date) : undefined,
			location: request.project.location ?? '',
			duration: request.project.duration ?? '',
			headcount: request.project.headcount ?? 0,
			intendedUse: request.project.intendedUse ?? '',
			details: request.project.details ?? '',
			quote: request.quoteCents != null ? request.quoteCents / 100 : null,
			lostReason: request.lostReason ?? ''
		}))
	);
	let note = $state('');

	let client = $derived(clients.get(request.clientId));
	let service = $derived(services.get(request.serviceId));
	let status = $derived(stageStatus[request.stage]);

	function save() {
		pipeline.update(request.id, {
			stage: form.stage,
			assigneeId: form.assigneeId || null,
			quoteCents: form.quote != null ? Math.round(form.quote * 100) : null,
			lostReason: form.stage === 'LOST' ? form.lostReason || null : null,
			project: {
				date: form.date?.toISOString() ?? null,
				location: form.location || null,
				duration: form.duration || null,
				headcount: form.headcount || null,
				intendedUse: form.intendedUse || null,
				details: form.details || null
			}
		});
		open = false;
		toast.success(`${request.reference} saved`);
	}

	function addNote() {
		if (!note.trim() || !session.user) return;
		pipeline.addNote(request.id, note.trim(), session.user.id);
		note = '';
	}
</script>

<Modal bind:open title={request.title} description={`${request.reference} · submitted ${formatRelative(request.createdAt)}`} size="xl">
	<div class="layout">
		<div class="main">
			<div class="two">
				<Field label="Stage">
					{#snippet control({ id }: { id: string })}
						<Select {id} bind:value={form.stage} options={stages.map((s) => ({ value: s.key, label: s.label }))} />
					{/snippet}
				</Field>
				<Field label="Assigned to">
					{#snippet control({ id }: { id: string })}
						<Select
							{id}
							bind:value={form.assigneeId}
							options={[{ value: '', label: 'Unassigned' }, ...team.members.filter((m) => m.status === 'ACTIVE').map((m) => ({ value: m.id, label: m.name }))]}
						/>
					{/snippet}
				</Field>
			</div>
			{#if form.stage === 'LOST'}
				<Field label="Why was it lost?">
					{#snippet control({ id }: { id: string })}
						<Input {id} bind:value={form.lostReason} placeholder="Budget, dates, went elsewhere…" />
					{/snippet}
				</Field>
			{/if}

			<fieldset>
				<legend>Project</legend>
				<div class="two">
					<Field label="Date">
						{#snippet control({ id }: { id: string })}
							<DatePicker {id} bind:value={form.date} locale={LOCALE} />
						{/snippet}
					</Field>
					<Field label="Location">
						{#snippet control({ id }: { id: string })}
							<Input {id} bind:value={form.location} icon="globe" />
						{/snippet}
					</Field>
					<Field label="Duration">
						{#snippet control({ id }: { id: string })}
							<Input {id} bind:value={form.duration} placeholder="Half day" />
						{/snippet}
					</Field>
					<Field label={service?.slug === 'automotive' ? 'Vehicles' : 'People'}>
						{#snippet control({ id }: { id: string })}
							<NumberInput {id} bind:value={form.headcount} min={0} max={1000} />
						{/snippet}
					</Field>
				</div>
				<Field label="Intended use">
					{#snippet control({ id }: { id: string })}
						<Input {id} bind:value={form.intendedUse} />
					{/snippet}
				</Field>
				<Field label="Details">
					{#snippet control({ id }: { id: string })}
						<Textarea {id} bind:value={form.details} rows={3} autogrow />
					{/snippet}
				</Field>
			</fieldset>

			<fieldset>
				<legend>Internal notes</legend>
				{#each request.notes as n (n.id)}
					<p class="note"><strong>{team.get(n.authorId)?.name}</strong> · {formatRelative(n.createdAt)}<br />{n.body}</p>
				{/each}
				<div class="add-note">
					<Input bind:value={note} placeholder="Add a note" aria-label="New note" onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addNote())} />
					<Button variant="outline" disabled={!note.trim()} onclick={addNote}>Add</Button>
				</div>
			</fieldset>
		</div>

		<aside>
			<DataList size="sm" dividers>
				<DataListRow label="Client">
					{#snippet valueSlot()}<a href={`/admin/clients/${client?.id}`}>{client?.name}</a>{/snippet}
				</DataListRow>
				<DataListRow label="Service" value={service?.name ?? '—'} />
				<DataListRow label="Source" value={request.source} />
				<DataListRow label="Stage">
					{#snippet valueSlot()}<Badge tone={status.tone} size="sm">{status.label}</Badge>{/snippet}
				</DataListRow>
				<DataListRow
					label="Estimate shown"
					value={request.estimate ? formatPriceRange(request.estimate.fromCents, request.estimate.toCents) : '—'}
				/>
			</DataList>
			<Field label="Quoted (net)" hint="The estimate is never a promise; the quote is.">
				{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
					<CurrencyInput {id} bind:value={form.quote} currency="EUR" currencies={['EUR']} locale={LOCALE} aria-describedby={describedBy} />
				{/snippet}
			</Field>
			<div class="actions">
				{#if request.quoteId}
					<Button variant="outline" icon="receipt" href={`/admin/invoices/${request.quoteId}`}>Open quote</Button>
				{:else}
					<Button
						variant="outline"
						icon="receipt"
						onclick={() => goto(`/admin/invoices/new?type=QUOTE&client=${request.clientId}&request=${request.id}`)}
					>
						Create quote
					</Button>
				{/if}
				<Button
					variant="outline"
					icon="mail"
					onclick={() => client && mail.compose({ to: [client.email], subject: `Re: ${request.title}` })}
				>
					Email client
				</Button>
			</div>
		</aside>
	</div>

	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button onclick={save}>Save</Button>
	{/snippet}
</Modal>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 280px;
		gap: var(--ui-space-16);
	}
	.main,
	aside,
	fieldset {
		display: grid;
		gap: var(--ui-space-10);
		align-content: start;
	}
	fieldset {
		margin: 0;
		padding: var(--ui-space-10) 0 0;
		border: 0;
		border-top: 1px solid var(--ui-border-subtle);
	}
	legend {
		padding: 0;
		font: 400 var(--ui-text-lg) / 1.2 var(--ui-font-serif);
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ui-space-8);
	}
	.note {
		margin: 0;
		font-size: var(--ui-text-sm);
		line-height: var(--ui-leading-relaxed);
		color: var(--ui-fg-muted);
	}
	.note strong {
		color: var(--ui-fg-default);
		font-weight: var(--ui-weight-medium);
	}
	.add-note {
		display: flex;
		gap: var(--ui-space-4);
	}
	.add-note > :global(:first-child) {
		flex: 1;
	}
	.actions {
		display: grid;
		gap: var(--ui-space-4);
	}
	a {
		color: var(--ui-accent-text);
	}
	@media (max-width: 860px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
