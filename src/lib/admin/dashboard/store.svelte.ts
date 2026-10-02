import { session } from '$lib/admin/auth/session.svelte';
import { clients } from '$lib/admin/clients/store.svelte';
import { galleries } from '$lib/admin/galleries/store.svelte';
import { invoices } from '$lib/admin/invoices/store.svelte';
import { photos } from '$lib/admin/photos/store.svelte';
import { can } from '$lib/admin/team/roles';
import type { Area } from '$lib/admin/team/types';
import { dashboardConfig, type KpiId, type MetricId, type RangeKey } from './config';
import { liveDaily } from './metrics';
import { liveEvent, mockValue, type LiveEvent } from './mock';
import { aggregate, bucketsFor, todayIndex, type Bucket } from './ranges';

export interface Series {
	/** False when the source has no history for this metric. */
	available: boolean;
	buckets: Bucket[];
	current: number[];
	/** The same buckets one period earlier. */
	previous: number[];
	total: number;
	previousTotal: number;
	/** Percent change against the previous period; null when it can't be computed. */
	change: number | null;
}

export interface KpiValue {
	value: number | null;
	/** Percent change, or percentage points for `conversion`. */
	change: number | null;
	spark: number[];
}

const sum = (values: number[]) => values.reduce((total, v) => total + v, 0);

function percentChange(current: number, previous: number): number | null {
	if (previous === 0) return current === 0 ? 0 : null;
	return ((current - previous) / previous) * 100;
}

const MAX_EVENTS = 25;

/** State and derived figures for the overview. Pure reads over the domain stores. */
class DashboardStore {
	readonly config = dashboardConfig;

	range = $state<RangeKey>(dashboardConfig.range);
	metric = $state<MetricId>(dashboardConfig.metric);
	paused = $state(false);
	/** Simulated events, newest first (mock source only). */
	events = $state<LiveEvent[]>([]);
	/** What live events added on top of the generated history, by `${metric}:${day}`. */
	#extra = $state<Record<string, number>>({});
	#ticks = 0;

	get mock() {
		return this.config.source === 'mock';
	}

	/** Simulated activity runs only on the mock source, and only when a tick is set. */
	get simulating() {
		return this.mock && this.config.tickSeconds > 0;
	}

	/** Display filter for the signed-in role; the API enforces the real boundary. */
	allows(area: Area): boolean {
		const role = session.user?.role;
		return role ? can(role, area) : false;
	}

	#valueOn(metric: MetricId): ((day: number) => number) | null {
		if (this.mock) {
			const today = todayIndex();
			const extra = this.#extra;
			return (day) => mockValue(metric, day, today, this.config) + (extra[`${metric}:${day}`] ?? 0);
		}
		const daily = liveDaily(metric);
		return daily ? (day) => daily.get(day) ?? 0 : null;
	}

	series(metric: MetricId, range: RangeKey = this.range): Series {
		const buckets = bucketsFor(range);
		const valueOn = this.#valueOn(metric);
		if (!valueOn) {
			return { available: false, buckets, current: [], previous: [], total: 0, previousTotal: 0, change: null };
		}
		const current = aggregate(buckets, valueOn);
		const previous = aggregate(bucketsFor(range, 1), valueOn);
		const total = sum(current);
		const previousTotal = sum(previous);
		return { available: true, buckets, current, previous, total, previousTotal, change: percentChange(total, previousTotal) };
	}

	kpi(id: KpiId): KpiValue {
		if (id === 'outstanding') {
			return { value: invoices.outstandingCents, change: null, spark: [] };
		}
		if (id === 'conversion') {
			const requests = this.series('requests');
			const bookings = this.series('bookings');
			if (!requests.available || !bookings.available) return { value: null, change: null, spark: [] };
			const rate = (b: number, r: number) => (r ? (b / r) * 100 : null);
			const now = rate(bookings.total, requests.total);
			const before = rate(bookings.previousTotal, requests.previousTotal);
			return { value: now, change: now != null && before != null ? now - before : null, spark: [] };
		}
		const series = this.series(id);
		return series.available
			? { value: series.total, change: series.change, spark: series.current }
			: { value: null, change: null, spark: [] };
	}

	/** Total since the first of this month, for the revenue goal. */
	monthToDate(metric: MetricId): number {
		const valueOn = this.#valueOn(metric);
		if (!valueOn) return 0;
		const now = new Date();
		const start = new Date(now.getFullYear(), now.getMonth(), 1);
		const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
		return aggregate([{ start, end, label: '', title: '' }], valueOn)[0];
	}

	/** Add one simulated event and fold its effects into today. */
	tick() {
		this.#ticks += 1;
		const event = liveEvent(this.config.seed, this.#ticks, {
			clients: clients.items.map((c) => c.company ?? c.name),
			galleries: galleries.items.map((g) => g.title),
			photoNumbers: photos.items.map((p) => p.number)
		});
		const today = todayIndex();
		for (const [metric, amount] of Object.entries(event.effects)) {
			const key = `${metric}:${today}`;
			this.#extra[key] = (this.#extra[key] ?? 0) + (amount ?? 0);
		}
		this.events = [event, ...this.events].slice(0, MAX_EVENTS);
	}

	/** Run the simulation; skips ticks while paused or the tab is hidden. Returns a stopper. */
	start(): () => void {
		if (!this.simulating) return () => {};
		const timer = setInterval(() => {
			if (!this.paused && document.visibilityState === 'visible') this.tick();
		}, this.config.tickSeconds * 1000);
		return () => clearInterval(timer);
	}
}

export const dashboard = new DashboardStore();
