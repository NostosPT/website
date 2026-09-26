<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import {
		Alert,
		Badge,
		Button,
		Card,
		CardBody,
		CardHeader,
		DataList,
		DataListRow,
		DatePicker,
		Field,
		Menu,
		MenuItem,
		MenuSeparator,
		Select,
		Textarea,
		Tooltip,
		toast
	} from '@nostospt/ui';
	import { clients } from '$lib/admin/clients/store.svelte';
	import { mail } from '$lib/admin/mail/store.svelte';
	import { fillTemplate, templates } from '$lib/admin/mail/templates';
	import { settings } from '$lib/admin/settings/store.svelte';
	import { formatDate, formatDateTime, formatMoney, LOCALE } from '$lib/admin/shared/format';
	import LineItemsEditor from './LineItemsEditor.svelte';
	import { documentStatus, documentTypes, invoices } from './store.svelte';
	import { computeTotals } from './totals';
	import type { FinanceDocument } from './types';

	let { doc }: { doc: FinanceDocument } = $props();

	// AT exemption reasons most relevant to a studio; confirm with the accountant.
	const exemptions = [
		{ value: 'M07', label: 'M07 — Isento artigo 9.º do CIVA' },
		{ value: 'M10', label: 'M10 — IVA, regime de isenção' },
		{ value: 'M99', label: 'M99 — Não sujeito ou não tributado' }
	];

	// Keyed by document id in the page; the draft is edited as a copy.
	let draft = $state(untrack(() => structuredClone($state.snapshot(doc))));
	let issueDate = $state(untrack(() => new Date(doc.issueDate)));
	let dueDate = $state(untrack(() => (doc.dueDate ? new Date(doc.dueDate) : undefined)));
	let issuing = $state(false);

	let editable = $derived(doc.status === 'DRAFT');
	let type = $derived(documentTypes[doc.type]);
	let status = $derived(documentStatus[doc.status]);
	let client = $derived(clients.get(draft.clientId));
	let totals = $derived(computeTotals(draft.lines));
	let needsExemption = $derived(draft.lines.some((l) => l.vatRate === 0));
	let problems = $derived(
		[
			!draft.clientId && 'Choose a client.',
			draft.lines.some((l) => !l.description.trim()) && 'Every line needs a description.',
			totals.total <= 0 && 'The total must be above zero.',
			needsExemption && !draft.vatExemption && 'Lines at 0% need an exemption reason.'
		].filter(Boolean) as string[]
	);

	function snapshot(): FinanceDocument {
		return {
			...$state.snapshot(draft),
			issueDate: issueDate.toISOString(),
			dueDate: dueDate?.toISOString() ?? null
		};
	}

	function save() {
		invoices.save(snapshot());
		toast.success('Draft saved');
	}

	async function issue() {
		if (!settings.invoicing.provider) return;
		invoices.save(snapshot());
		issuing = true;
		const issued = await invoices.issue(doc.id, settings.invoicing.provider);
		issuing = false;
		if (issued) toast.success(`${issued.number} issued`, { description: `ATCUD ${issued.issued?.atcud} · via ${settings.providerName}` });
	}

	function send() {
		if (!client) return;
		const template = templates.find((t) => t.id === (doc.type === 'QUOTE' ? 'quote' : 'invoice'))!;
		const values = {
			firstName: client.name.split(' ')[0],
			number: doc.number ?? '',
			reference: doc.number ?? '',
			project: doc.lines[0]?.description ?? 'your project',
			due: formatDate(doc.dueDate)
		};
		mail.compose({ to: [client.email], subject: fillTemplate(template.subject, values), text: fillTemplate(template.text, values) });
		if (doc.status === 'ISSUED') invoices.setStatus(doc.id, 'SENT');
	}

	function convert(to: 'INVOICE' | 'PROFORMA') {
		const created = invoices.create({
			type: to,
			clientId: doc.clientId,
			requestId: doc.requestId,
			lines: structuredClone($state.snapshot(doc.lines))
		});
		if (doc.type === 'QUOTE') invoices.setStatus(doc.id, 'ACCEPTED');
		goto(`/admin/invoices/${created.id}`);
	}
</script>

<div class="layout">
	<div class="document">
		<Card>
			<CardBody>
				<div class="head">
					<Field label="Client">
						{#snippet control({ id }: { id: string })}
							<Select {id} bind:value={draft.clientId} options={clients.options} placeholder="Choose a client" disabled={!editable} />
						{/snippet}
					</Field>
					<Field label="Date">
						{#snippet control({ id }: { id: string })}
							<DatePicker {id} bind:value={issueDate} locale={LOCALE} disabled={!editable} />
						{/snippet}
					</Field>
					<Field label={doc.type === 'QUOTE' ? 'Valid until' : 'Due'}>
						{#snippet control({ id }: { id: string })}
							<DatePicker {id} bind:value={dueDate} locale={LOCALE} disabled={!editable} />
						{/snippet}
					</Field>
				</div>
			</CardBody>
			<LineItemsEditor bind:lines={draft.lines} readonly={!editable} />
			<CardBody>
				<div class="foot">
					<div class="notes">
						{#if needsExemption}
							<Field label="VAT exemption reason">
								{#snippet control({ id }: { id: string })}
									<Select {id} bind:value={draft.vatExemption} options={exemptions} placeholder="Required for 0% lines" disabled={!editable} />
								{/snippet}
							</Field>
						{/if}
						<Field label="Notes" optional hint="Printed on the document.">
							{#snippet control({ id, describedBy }: { id: string; describedBy?: string })}
								<Textarea {id} bind:value={draft.notes} rows={3} readonly={!editable} aria-describedby={describedBy} />
							{/snippet}
						</Field>
					</div>
					<dl class="totals">
						<div><dt>Net</dt><dd>{formatMoney(totals.net)}</dd></div>
						{#each totals.byRate as rate (rate.rate)}
							<div><dt>VAT {rate.rate}% on {formatMoney(rate.base)}</dt><dd>{formatMoney(rate.vat)}</dd></div>
						{/each}
						<div class="total"><dt>Total</dt><dd>{formatMoney(totals.total)}</dd></div>
					</dl>
				</div>
			</CardBody>
		</Card>
	</div>

	<aside>
		<Card>
			<CardHeader title={doc.number ?? `${type.label} draft`} divided>
				{#snippet actions()}<Badge tone={status.tone}>{status.label}</Badge>{/snippet}
			</CardHeader>
			<CardBody>
				<div class="stack">
					{#if editable}
						{#if problems.length}
							<Alert tone="warning" title="Before issuing">
								<ul class="problems">{#each problems as p (p)}<li>{p}</li>{/each}</ul>
							</Alert>
						{/if}
						<Button variant="outline" block onclick={save}>Save draft</Button>
						<Tooltip content={settings.invoicing.provider ? `Numbered, signed and archived by ${settings.providerName}` : 'Connect a certified provider in Settings'}>
							<Button block icon="verified" loading={issuing} disabled={problems.length > 0 || !settings.invoicing.provider} onclick={issue}>
								Issue via {settings.providerName ?? 'provider'}
							</Button>
						</Tooltip>
						<p class="fine">Issued documents can't be edited. Corrections are made with a credit note.</p>
					{:else}
						<Button block icon="send" onclick={send}>Send to client</Button>
						{#if doc.type === 'INVOICE' && doc.status !== 'PAID'}
							<Button block variant="outline" icon="check" onclick={() => (invoices.setStatus(doc.id, 'PAID'), toast.success('Marked as paid'))}>Mark as paid</Button>
						{/if}
						<Menu ariaLabel="More" matchWidth>
							{#snippet trigger({ toggle }: { toggle: () => void })}
								<Button block variant="ghost" tone="neutral" trailingIcon="chevron-down" onclick={toggle}>More</Button>
							{/snippet}
							<MenuItem icon="download" disabled={!doc.issued?.pdfUrl}>Download PDF</MenuItem>
							{#if doc.type === 'QUOTE'}
								<MenuItem icon="receipt" onselect={() => convert('PROFORMA')}>Convert to proforma</MenuItem>
								<MenuItem icon="receipt" onselect={() => convert('INVOICE')}>Convert to invoice</MenuItem>
								<MenuItem icon="x-circle" onselect={() => invoices.setStatus(doc.id, 'DECLINED')}>Mark declined</MenuItem>
							{/if}
							{#if doc.type === 'PROFORMA'}
								<MenuItem icon="receipt" onselect={() => convert('INVOICE')}>Convert to invoice</MenuItem>
							{/if}
							{#if doc.type === 'INVOICE'}
								<MenuSeparator />
								<MenuItem icon="rotate-ccw" tone="danger" onselect={() => goto(`/admin/invoices/new?type=CREDIT_NOTE&client=${doc.clientId}`)}>Issue credit note</MenuItem>
							{/if}
						</Menu>
					{/if}

					<DataList size="sm" dividers>
						<DataListRow label="Type" value={type.label} />
						{#if doc.issued}
							<DataListRow label="ATCUD" value={doc.issued.atcud} />
							<DataListRow label="Issued" value={formatDateTime(doc.issued.issuedAt)} />
						{/if}
						{#if doc.paidAt}<DataListRow label="Paid" value={formatDateTime(doc.paidAt)} />{/if}
						<DataListRow label="Client NIF" value={client?.taxId ?? 'Consumidor final'} />
						<DataListRow label="Billing address" value={client?.address ?? '—'} />
						{#if doc.requestId}
							<DataListRow label="Request">
								{#snippet valueSlot()}<a href={`/admin/pipeline?request=${doc.requestId}`}>Open</a>{/snippet}
							</DataListRow>
						{/if}
					</DataList>
				</div>
			</CardBody>
		</Card>
	</aside>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: clamp(1.25rem, 2.5vw, 2rem);
		align-items: start;
	}
	aside {
		position: sticky;
		top: 80px;
	}
	.head {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--ui-space-8);
	}
	.foot {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(240px, 300px);
		gap: var(--ui-space-12);
		align-items: start;
	}
	.notes,
	.stack {
		display: grid;
		gap: var(--ui-space-8);
	}
	.totals {
		display: grid;
		gap: var(--ui-space-4);
		margin: 0;
	}
	.totals div {
		display: flex;
		justify-content: space-between;
		gap: var(--ui-space-6);
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
	}
	.totals dd {
		margin: 0;
		color: var(--ui-fg-default);
	}
	.totals .total {
		margin-top: var(--ui-space-4);
		padding-top: var(--ui-space-6);
		border-top: 1px solid var(--ui-border-default);
		font: 400 var(--ui-text-xl) / 1.2 var(--ui-font-serif);
		color: var(--ui-fg-default);
	}
	.problems {
		margin: 0;
		padding-left: 1.1em;
	}
	.fine {
		margin: 0;
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	a {
		color: var(--ui-accent-text);
	}
	@media (max-width: 1200px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		aside {
			position: static;
		}
	}
	@media (max-width: 760px) {
		.head,
		.foot {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
