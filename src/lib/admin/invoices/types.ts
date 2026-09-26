/**
 * Quotes, proformas, invoices and credit notes.
 *
 * In Portugal, invoices must be issued by AT-certified software. The dashboard
 * therefore drafts and tracks documents, and a certified provider issues them:
 * the provider assigns the series number and ATCUD and renders the PDF. Quotes
 * and proformas go through the same provider so every numbered document sits in
 * one place. Confirm the exact obligations with the studio's accountant.
 */
export type DocumentType = 'QUOTE' | 'PROFORMA' | 'INVOICE' | 'CREDIT_NOTE';

export type DocumentStatus =
	| 'DRAFT'
	| 'ISSUED'
	| 'SENT'
	| 'ACCEPTED'
	| 'DECLINED'
	| 'PAID'
	| 'OVERDUE'
	| 'VOID';

/** Mainland Portugal VAT rates (CIVA): normal, intermediate, reduced, exempt. */
export type VatRate = 23 | 13 | 6 | 0;

export interface LineItem {
	id: string;
	description: string;
	quantity: number;
	unitPriceCents: number;
	vatRate: VatRate;
	/** 0–100 */
	discount: number;
}

export type ProviderId = 'invoicexpress' | 'moloni' | 'vendus' | 'toconline';

/** Set once a certified provider has issued the document. */
export interface IssuedBy {
	provider: ProviderId;
	externalId: string;
	/** Unique document code required by the AT, e.g. "JFM3K8TP-41". */
	atcud: string;
	pdfUrl: string | null;
	issuedAt: string;
}

export interface FinanceDocument {
	id: string;
	type: DocumentType;
	/** "FT 2026/41". Null until issued: numbers come from the provider's series. */
	number: string | null;
	status: DocumentStatus;
	clientId: string;
	requestId: string | null;
	issueDate: string;
	/** Payment due (invoices) or validity (quotes). */
	dueDate: string | null;
	currency: string;
	lines: LineItem[];
	notes: string | null;
	/** Required on 0% lines, e.g. "M07" (art. 9 CIVA). */
	vatExemption: string | null;
	issued: IssuedBy | null;
	paidAt: string | null;
	createdAt: string;
	updatedAt: string;
}
