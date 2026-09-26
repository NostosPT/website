/**
 * Display formatting for the admin. English copy with European conventions:
 * day-month dates and euro amounts. The API stores money as integer cents.
 */

export const LOCALE = 'en-GB';

const moneyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(cents: number | null | undefined, currency = 'EUR'): string {
	if (cents == null) return '—';
	let formatter = moneyFormatters.get(currency);
	if (!formatter) {
		formatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency });
		moneyFormatters.set(currency, formatter);
	}
	return formatter.format(cents / 100);
}

/** "€120–€300": Studio estimates are ranges, never guaranteed prices. */
export function formatPriceRange(
	fromCents: number | null,
	toCents: number | null,
	currency = 'EUR'
): string {
	if (fromCents == null && toCents == null) return 'On request';
	if (toCents == null) return `From ${formatMoney(fromCents, currency)}`;
	if (fromCents == null) return `Up to ${formatMoney(toCents, currency)}`;
	return `${formatMoney(fromCents, currency)}–${formatMoney(toCents, currency)}`;
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
	day: 'numeric',
	month: 'short',
	year: 'numeric'
});
const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const timeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' });
const longDateFormatter = new Intl.DateTimeFormat(LOCALE, {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
});

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value));

export function formatDate(value: string | Date | null | undefined): string {
	return value ? dateFormatter.format(toDate(value)) : '—';
}

export function formatShortDate(value: string | Date): string {
	return shortDateFormatter.format(toDate(value));
}

export function formatTime(value: string | Date): string {
	return timeFormatter.format(toDate(value));
}

export function formatLongDate(value: string | Date): string {
	return longDateFormatter.format(toDate(value));
}

export function formatDateTime(value: string | Date): string {
	return `${formatDate(value)}, ${formatTime(value)}`;
}

const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

/** "5 minutes ago", "yesterday", then a plain date after a week. */
export function formatRelative(value: string | Date, now = new Date()): string {
	const seconds = Math.round((toDate(value).getTime() - now.getTime()) / 1000);
	const abs = Math.abs(seconds);
	if (abs < 45) return 'just now';
	if (abs < 3600) return relativeFormatter.format(Math.round(seconds / 60), 'minute');
	if (abs < 86400) return relativeFormatter.format(Math.round(seconds / 3600), 'hour');
	if (abs < 604800) return relativeFormatter.format(Math.round(seconds / 86400), 'day');
	return formatShortDate(value);
}

/** Inbox-style stamp: time today, short date otherwise. */
export function formatStamp(value: string | Date, now = new Date()): string {
	const date = toDate(value);
	return date.toDateString() === now.toDateString() ? formatTime(date) : formatShortDate(date);
}

export function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	const units = ['KB', 'MB', 'GB', 'TB'];
	let value = bytes / 1024;
	let unit = 0;
	while (value >= 1024 && unit < units.length - 1) {
		value /= 1024;
		unit += 1;
	}
	return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

/** The public Photo ID, e.g. "Nº 482". */
export function photoNumber(number: number): string {
	return `Nº ${number}`;
}

export function slugify(text: string): string {
	return text
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
	return `${count} ${count === 1 ? singular : plural}`;
}
