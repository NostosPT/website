import { mockId } from '$lib/admin/shared/mock-dates';
import type { StatusMap } from '$lib/admin/shared/status';
import { seedDocuments } from './mock';
import { computeTotals } from './totals';
import type { DocumentStatus, DocumentType, FinanceDocument, LineItem, ProviderId } from './types';

export const documentTypes: Record<DocumentType, { label: string; prefix: string; plural: string }> = {
	QUOTE: { label: 'Quote', prefix: 'OR', plural: 'Quotes' },
	PROFORMA: { label: 'Proforma', prefix: 'PF', plural: 'Proformas' },
	INVOICE: { label: 'Invoice', prefix: 'FT', plural: 'Invoices' },
	CREDIT_NOTE: { label: 'Credit note', prefix: 'NC', plural: 'Credit notes' }
};

export const documentStatus: StatusMap<DocumentStatus> = {
	DRAFT: { label: 'Draft', tone: 'neutral' },
	ISSUED: { label: 'Issued', tone: 'info' },
	SENT: { label: 'Sent', tone: 'info' },
	ACCEPTED: { label: 'Accepted', tone: 'success' },
	DECLINED: { label: 'Declined', tone: 'danger' },
	PAID: { label: 'Paid', tone: 'success' },
	OVERDUE: { label: 'Overdue', tone: 'warning' },
	VOID: { label: 'Void', tone: 'neutral' }
};

export const vatRates = [
	{ value: '23', label: '23% normal' },
	{ value: '13', label: '13% intermediate' },
	{ value: '6', label: '6% reduced' },
	{ value: '0', label: '0% exempt' }
];

export const totalOf = (doc: FinanceDocument) => computeTotals(doc.lines).total;

const newLine = (): LineItem => ({
	id: mockId('ln'),
	description: '',
	quantity: 1,
	unitPriceCents: 0,
	vatRate: 23,
	discount: 0
});

/**
 * Finance documents. Endpoints to build: /documents (CRUD) and
 * POST /documents/:id/issue, which calls the certified provider server-side.
 */
class InvoiceStore {
	items = $state<FinanceDocument[]>(seedDocuments);

	/** Issued invoices not yet paid. */
	outstanding = $derived(this.items.filter((d) => d.type === 'INVOICE' && (d.status === 'SENT' || d.status === 'ISSUED' || d.status === 'OVERDUE')));
	overdue = $derived(this.items.filter((d) => d.status === 'OVERDUE'));
	outstandingCents = $derived(this.outstanding.reduce((sum, d) => sum + totalOf(d), 0));

	paidInLast(days: number): number {
		const since = Date.now() - days * 86_400_000;
		return this.items
			.filter((d) => d.status === 'PAID' && d.paidAt && new Date(d.paidAt).getTime() >= since)
			.reduce((sum, d) => sum + totalOf(d), 0);
	}

	get(id: string | null | undefined): FinanceDocument | undefined {
		return id ? this.items.find((d) => d.id === id) : undefined;
	}

	forClient(clientId: string): FinanceDocument[] {
		return this.items.filter((d) => d.clientId === clientId);
	}

	lifetimeValue(clientId: string): number {
		return this.forClient(clientId)
			.filter((d) => d.status === 'PAID')
			.reduce((sum, d) => sum + totalOf(d), 0);
	}

	create(input: { type: DocumentType; clientId: string; requestId?: string | null; lines?: LineItem[] }): FinanceDocument {
		const now = new Date().toISOString();
		const doc: FinanceDocument = {
			id: mockId('doc'),
			type: input.type,
			number: null,
			status: 'DRAFT',
			clientId: input.clientId,
			requestId: input.requestId ?? null,
			issueDate: now,
			dueDate: new Date(Date.now() + (input.type === 'QUOTE' ? 30 : 14) * 86_400_000).toISOString(),
			currency: 'EUR',
			lines: input.lines ?? [newLine()],
			notes: null,
			vatExemption: null,
			issued: null,
			paidAt: null,
			createdAt: now,
			updatedAt: now
		};
		this.items.unshift(doc);
		return doc;
	}

	save(doc: FinanceDocument) {
		const index = this.items.findIndex((d) => d.id === doc.id);
		const next = { ...doc, updatedAt: new Date().toISOString() };
		if (index >= 0) this.items[index] = next;
		else this.items.unshift(next);
	}

	newLine = newLine;

	/** Mock of POST /documents/:id/issue: the provider returns number, ATCUD and PDF. */
	async issue(id: string, provider: ProviderId): Promise<FinanceDocument | undefined> {
		await new Promise((resolve) => setTimeout(resolve, 700));
		const doc = this.get(id);
		if (!doc) return;
		const { prefix } = documentTypes[doc.type];
		const year = new Date().getFullYear();
		const seq = this.items.filter((d) => d.type === doc.type && d.number?.includes(`${year}/`)).length + 1;
		Object.assign(doc, {
			number: `${prefix} ${year}/${seq}`,
			status: 'ISSUED',
			issueDate: new Date().toISOString(),
			issued: { provider, externalId: mockId('ext'), atcud: `JFM3K8TP-${seq}`, pdfUrl: null, issuedAt: new Date().toISOString() },
			updatedAt: new Date().toISOString()
		});
		return doc;
	}

	setStatus(id: string, status: DocumentStatus) {
		const doc = this.get(id);
		if (!doc) return;
		doc.status = status;
		if (status === 'PAID') doc.paidAt = new Date().toISOString();
		doc.updatedAt = new Date().toISOString();
	}

	remove(id: string) {
		this.items = this.items.filter((d) => d.id !== id);
	}
}

export const invoices = new InvoiceStore();
