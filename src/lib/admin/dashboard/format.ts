import { formatMoney, LOCALE } from '$lib/admin/shared/format';
import type { MetricFormat } from './metrics';

const count = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const compactCount = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 });
const compactMoney = new Map<string, Intl.NumberFormat>();

/** Headline figure: whole euros (cents only matter on documents), grouped counts. */
export function formatFigure(format: MetricFormat, value: number | null, currency = 'EUR'): string {
	if (value == null) return '—';
	if (format === 'money') return formatMoney(Math.round(value / 100) * 100, currency).replace(/\.00$/, '');
	if (format === 'percent') return `${value.toFixed(1)}%`;
	return count.format(value);
}

/** Axis ticks: "€1.2K", "340". */
export function formatTick(format: MetricFormat, value: number, currency = 'EUR'): string {
	if (format === 'money') {
		let formatter = compactMoney.get(currency);
		if (!formatter) {
			formatter = new Intl.NumberFormat(LOCALE, {
				style: 'currency',
				currency,
				notation: 'compact',
				maximumFractionDigits: 1
			});
			compactMoney.set(currency, formatter);
		}
		return formatter.format(value / 100);
	}
	if (format === 'percent') return `${Math.round(value)}%`;
	return compactCount.format(value);
}

/** "1, 2, 5 × 10ⁿ" steps so gridlines land on round numbers. */
export function niceMax(max: number, ticks = 4): { max: number; step: number } {
	if (max <= 0) return { max: ticks, step: 1 };
	const raw = max / ticks;
	const magnitude = 10 ** Math.floor(Math.log10(raw));
	const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= raw) ?? raw;
	return { max: Math.ceil(max / step) * step, step };
}
