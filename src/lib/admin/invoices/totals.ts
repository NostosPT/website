import type { LineItem, VatRate } from './types';

export type Totals = {
	net: number;
	vat: number;
	total: number;
	/** One row per rate, as fiscal documents present it. */
	byRate: { rate: VatRate; base: number; vat: number }[];
};

/** Cents; each line is rounded before summing, as invoicing software does. */
export function lineNet(line: LineItem): number {
	return Math.round(line.quantity * line.unitPriceCents * (1 - line.discount / 100));
}

export function computeTotals(lines: LineItem[]): Totals {
	const rates = new Map<VatRate, { base: number; vat: number }>();
	for (const line of lines) {
		const base = lineNet(line);
		const entry = rates.get(line.vatRate) ?? { base: 0, vat: 0 };
		entry.base += base;
		entry.vat += Math.round((base * line.vatRate) / 100);
		rates.set(line.vatRate, entry);
	}
	const byRate = [...rates.entries()]
		.map(([rate, v]) => ({ rate, ...v }))
		.sort((a, b) => b.rate - a.rate);
	const net = byRate.reduce((sum, r) => sum + r.base, 0);
	const vat = byRate.reduce((sum, r) => sum + r.vat, 0);
	return { net, vat, total: net + vat, byRate };
}
