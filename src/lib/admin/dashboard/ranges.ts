import { LOCALE } from '$lib/admin/shared/format';
import type { RangeKey } from './config';

/**
 * Time windows for the overview. Short ranges are bucketed by day, a quarter
 * by week and a year by month, so every chart stays between 7 and 30 marks.
 * The last bucket always contains today and may be partial.
 */

type Unit = 'day' | 'week' | 'month';

export const ranges: Record<RangeKey, { label: string; short: string; unit: Unit; count: number }> = {
	'7d': { label: 'Last 7 days', short: '7D', unit: 'day', count: 7 },
	'30d': { label: 'Last 30 days', short: '30D', unit: 'day', count: 30 },
	'90d': { label: 'Last 13 weeks', short: '90D', unit: 'week', count: 13 },
	'12m': { label: 'Last 12 months', short: '12M', unit: 'month', count: 12 }
};

export interface Bucket {
	start: Date;
	/** Exclusive. */
	end: Date;
	/** Axis label, e.g. "3 Oct" or "Oct". */
	label: string;
	/** Tooltip label, e.g. "Fri, 3 Oct" or "Week of 29 Sep". */
	title: string;
}

const DAY = 86_400_000;

/** Local calendar day as an integer, stable across DST changes. */
export function dayIndex(date: Date): number {
	return Math.floor((date.getTime() - date.getTimezoneOffset() * 60_000) / DAY);
}

export const todayIndex = () => dayIndex(new Date());

function startOf(date: Date, unit: Unit): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	if (unit === 'week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
	if (unit === 'month') d.setDate(1);
	return d;
}

function add(date: Date, unit: Unit, n: number): Date {
	const d = new Date(date);
	if (unit === 'day') d.setDate(d.getDate() + n);
	if (unit === 'week') d.setDate(d.getDate() + 7 * n);
	if (unit === 'month') d.setMonth(d.getMonth() + n);
	return d;
}

const dayLabel = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const dayTitle = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
const monthLabel = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
const monthTitle = new Intl.DateTimeFormat(LOCALE, { month: 'long', year: 'numeric' });

function labels(start: Date, unit: Unit): Pick<Bucket, 'label' | 'title'> {
	if (unit === 'day') return { label: dayLabel.format(start), title: dayTitle.format(start) };
	if (unit === 'week') return { label: dayLabel.format(start), title: `Week of ${dayLabel.format(start)}` };
	return { label: monthLabel.format(start), title: monthTitle.format(start) };
}

/** Buckets for a range ending now; `periodsBack = 1` is the comparison period. */
export function bucketsFor(range: RangeKey, periodsBack = 0, now = new Date()): Bucket[] {
	const { unit, count } = ranges[range];
	const first = add(startOf(now, unit), unit, -(count - 1) - periodsBack * count);
	return Array.from({ length: count }, (_, i) => {
		const start = add(first, unit, i);
		return { start, end: add(start, unit, 1), ...labels(start, unit) };
	});
}

/** Sum a per-day function over each bucket, ignoring days after today. */
export function aggregate(buckets: Bucket[], valueOn: (day: number) => number): number[] {
	const today = todayIndex();
	return buckets.map((bucket) => {
		let total = 0;
		const last = Math.min(dayIndex(bucket.end) - 1, today);
		for (let day = dayIndex(bucket.start); day <= last; day += 1) total += valueOn(day);
		return total;
	});
}
