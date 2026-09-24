import { daysAgo, daysFromNow } from '$lib/admin/shared/mock-dates';
import type { FinanceDocument, LineItem } from './types';

let lineSeq = 0;
const line = (description: string, unitPriceCents: number, quantity = 1, vatRate: LineItem['vatRate'] = 23): LineItem => ({
	id: `ln_${++lineSeq}`,
	description,
	quantity,
	unitPriceCents,
	vatRate,
	discount: 0
});

const issued = (provider: 'invoicexpress', seq: number, daysBack: number) => ({
	provider,
	externalId: `ix_${seq}`,
	atcud: `JFM3K8TP-${seq}`,
	pdfUrl: null,
	issuedAt: daysAgo(daysBack, 10)
});

type Seed = Omit<FinanceDocument, 'currency' | 'createdAt' | 'updatedAt' | 'notes' | 'vatExemption' | 'requestId' | 'paidAt' | 'issued'> &
	Partial<Pick<FinanceDocument, 'notes' | 'vatExemption' | 'requestId' | 'paidAt' | 'issued'>>;

const seeds: Seed[] = [
	{ id: 'inv_41', type: 'INVOICE', number: 'FT 2026/41', status: 'PAID', clientId: 'cli_sal', requestId: null, issueDate: daysAgo(8), dueDate: daysAgo(-7), lines: [line('Spring menu — commercial photography, half day', 120000), line('Web and print licence, 12 months', 30000)], issued: issued('invoicexpress', 41, 8), paidAt: daysAgo(1, 16) },
	{ id: 'inv_38', type: 'INVOICE', number: 'FT 2026/38', status: 'PAID', clientId: 'cli_beatriz', requestId: 'req_024', issueDate: daysAgo(22), dueDate: daysAgo(8), lines: [line('Wedding coverage — full day, two photographers', 200000), line('Album 30×30, 40 pages', 40000)], issued: issued('invoicexpress', 38, 22), paidAt: daysAgo(20, 9) },
	{ id: 'inv_42', type: 'INVOICE', number: 'FT 2026/42', status: 'OVERDUE', clientId: 'cli_lucas', requestId: 'req_023', issueDate: daysAgo(35), dueDate: daysAgo(5), lines: [line('Classic collection — 7 vehicles, full day', 54000)], issued: issued('invoicexpress', 42, 35), notes: 'Second reminder sent.' },
	{ id: 'inv_43', type: 'INVOICE', number: 'FT 2026/43', status: 'SENT', clientId: 'cli_filipa', requestId: 'req_027', issueDate: daysAgo(2), dueDate: daysFromNow(12), lines: [line('Corporate dinner — 50% deposit', 34000)], issued: issued('invoicexpress', 43, 2) },
	{ id: 'qt_12', type: 'QUOTE', number: 'OR 2026/12', status: 'SENT', clientId: 'cli_lumen', requestId: 'req_028', issueDate: daysAgo(2), dueDate: daysFromNow(28), lines: [line('Rooms, rooftop and restaurant — full day', 115000), line('Retouching, 40 images', 30000)], issued: issued('invoicexpress', 12, 2) },
	{ id: 'qt_11', type: 'QUOTE', number: 'OR 2026/11', status: 'SENT', clientId: 'cli_filipa', requestId: 'req_027', issueDate: daysAgo(10), dueDate: daysFromNow(20), lines: [line('Event coverage — 4 hours', 58000), line('Same-night selection for press', 10000)], issued: issued('invoicexpress', 11, 10) },
	{ id: 'qt_10', type: 'QUOTE', number: 'OR 2026/10', status: 'ACCEPTED', clientId: 'cli_sal', requestId: 'req_026', issueDate: daysAgo(18), dueDate: daysFromNow(12), lines: [line('Autumn menu — commercial photography, half day', 90000)], issued: issued('invoicexpress', 10, 18) },
	{ id: 'pf_05', type: 'PROFORMA', number: 'PF 2026/5', status: 'SENT', clientId: 'cli_sal', requestId: 'req_026', issueDate: daysAgo(5), dueDate: daysFromNow(2), lines: [line('Autumn menu — 50% deposit', 45000)], issued: issued('invoicexpress', 5, 5) },
	{ id: 'dr_01', type: 'INVOICE', number: null, status: 'DRAFT', clientId: 'cli_ana', requestId: null, issueDate: daysAgo(0), dueDate: daysFromNow(14), lines: [line('Print A3 — Nº 412 “Yellow”, archival pigment on cotton rag', 12000, 1, 23), line('Oak frame, A3', 6500)], notes: 'Gift: ship without prices in the parcel.' }
];

export const seedDocuments: FinanceDocument[] = seeds.map((seed) => ({
	currency: 'EUR',
	notes: null,
	vatExemption: null,
	requestId: null,
	paidAt: null,
	issued: null,
	...seed,
	createdAt: seed.issueDate,
	updatedAt: seed.paidAt ?? seed.issueDate
}));
