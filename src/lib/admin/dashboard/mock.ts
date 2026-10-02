import type { Area } from '$lib/admin/team/types';
import type { DashboardConfig, MetricId } from './config';

/**
 * Generated history for the overview while the API has no analytics
 * (ROADMAP › Deferred › Analytics). Every day's value is a pure function of
 * (seed, metric, day), so ranges agree with each other, reloads are stable,
 * and `PUBLIC_DASHBOARD_SEED` / `_SCALE` / `_TREND` reshape it predictably.
 */

/** cyrb53-style string hash → 32-bit unsigned seed. */
export function hash(text: string): number {
	let h1 = 0xdeadbeef;
	let h2 = 0x41c6ce57;
	for (let i = 0; i < text.length; i += 1) {
		const ch = text.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	return h1 >>> 0;
}

export type Rng = () => number;

/** mulberry32: small, fast, good enough for fixtures. */
export function rng(seed: number): Rng {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const between = (r: Rng, min: number, max: number) => min + r() * (max - min);

export function pick<T>(r: Rng, items: readonly T[]): T {
	return items[Math.floor(r() * items.length)];
}

/** Poisson sample (Knuth below 30, normal approximation above). */
function poisson(r: Rng, lambda: number): number {
	if (lambda <= 0) return 0;
	if (lambda > 30) {
		const gauss = Math.sqrt(-2 * Math.log(r() || 1e-9)) * Math.cos(2 * Math.PI * r());
		return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * gauss));
	}
	const limit = Math.exp(-lambda);
	let k = 0;
	let p = r();
	while (p > limit) {
		k += 1;
		p *= r();
	}
	return k;
}

/** One day of a metric; `k` folds in scale and growth, `weekend` the weekly rhythm. */
const profiles: Record<MetricId, (r: Rng, k: number, weekend: boolean) => number> = {
	requests: (r, k, weekend) => poisson(r, (weekend ? 0.5 : 1.1) * k),
	bookings: (r, k, weekend) => poisson(r, (weekend ? 0.18 : 0.42) * k),
	orders: (r, k, weekend) => poisson(r, (weekend ? 2.1 : 1.4) * k),
	views: (r, k, weekend) => poisson(r, (weekend ? 34 : 22) * k),
	uploads: (r, k) => (r() < 0.16 ? Math.round(between(r, 40, 220) * k) : poisson(r, 1.5 * k)),
	revenue: (r, k, weekend) => {
		let cents = 0;
		const prints = poisson(r, (weekend ? 2.1 : 1.4) * k);
		for (let i = 0; i < prints; i += 1) cents += Math.round(between(r, 45, 180)) * 100;
		const invoices = poisson(r, (weekend ? 0.05 : 0.24) * k);
		for (let i = 0; i < invoices; i += 1) cents += Math.round(between(r, 400, 2800)) * 100;
		return cents;
	}
};

type MockOptions = Pick<DashboardConfig, 'seed' | 'scale' | 'trend'>;

/** Generated value of `metric` on local day `day` (see `dayIndex`). */
export function mockValue(metric: MetricId, day: number, today: number, options: MockOptions): number {
	if (day > today) return 0;
	const r = rng(hash(`${options.seed}:${metric}:${day}`));
	// 1970-01-01 was a Thursday; 0 = Sunday.
	const weekday = (((day + 4) % 7) + 7) % 7;
	const growth = Math.pow(1 + options.trend, -(today - day) / 30);
	return profiles[metric](r, options.scale * growth, weekday === 0 || weekday === 6);
}

// --- simulated live events --------------------------------------------------

export interface LiveEvent {
	id: string;
	icon: string;
	title: string;
	body: string;
	href: string;
	area: Area;
	createdAt: string;
	/** What the event adds to today's figures. */
	effects: Partial<Record<MetricId, number>>;
}

export interface LiveContext {
	clients: string[];
	galleries: string[];
	photoNumbers: number[];
}

const FALLBACK: LiveContext = {
	clients: ['Atelier Sal', 'Hotel Lumen', 'Duarte Automóveis', 'Mariana Costa', 'Teresa Lobo'],
	galleries: ['Quinta da Regaleira', 'Spring menu', 'Classic collection'],
	photoNumbers: [401, 407, 412, 415, 433]
};

const SERVICES = ['Portrait session', 'Wedding', 'Commercial shoot', 'Automotive', 'Event coverage'];
const PRODUCTS = ['Print A3', 'Print A2', 'Framed print', 'Personal licence', 'Commercial licence'];

type Template = { weight: number; make: (r: Rng, c: LiveContext) => Omit<LiveEvent, 'id' | 'createdAt'> };

const templates: Template[] = [
	{
		weight: 40,
		make: (r, c) => {
			const views = 1 + Math.floor(r() * 4);
			return {
				icon: 'eye', area: 'studio', href: '/admin/galleries', title: 'Gallery opened',
				body: `${pick(r, c.clients)} is viewing “${pick(r, c.galleries)}”.`, effects: { views }
			};
		}
	},
	{
		weight: 18,
		make: (r, c) => {
			const cents = Math.round(between(r, 45, 220)) * 100;
			return {
				icon: 'credit-card', area: 'finance', href: '/admin/orders', title: 'Order paid',
				body: `${pick(r, PRODUCTS)} of Nº ${pick(r, c.photoNumbers)}.`, effects: { orders: 1, revenue: cents }
			};
		}
	},
	{
		weight: 15,
		make: (r, c) => ({
			icon: 'board', area: 'crm', href: '/admin/pipeline', title: 'New request',
			body: `${pick(r, SERVICES)}, from ${pick(r, c.clients)}.`, effects: { requests: 1 }
		})
	},
	{
		weight: 10,
		make: (r) => {
			const count = Math.round(between(r, 12, 140));
			return {
				icon: 'upload', area: 'archive', href: '/admin/photos', title: 'Upload finished',
				body: `${count} photographs added to the archive.`, effects: { uploads: count }
			};
		}
	},
	{
		weight: 9,
		make: (r, c) => {
			const cents = Math.round(between(r, 400, 2400)) * 100;
			return {
				icon: 'receipt', area: 'finance', href: '/admin/invoices', title: 'Invoice paid',
				body: `${pick(r, c.clients)} settled an invoice.`, effects: { revenue: cents }
			};
		}
	},
	{
		weight: 8,
		make: (r, c) => ({
			icon: 'calendar', area: 'crm', href: '/admin/pipeline', title: 'Shoot booked',
			body: `${pick(r, SERVICES)} · ${pick(r, c.clients)}.`, effects: { bookings: 1 }
		})
	}
];

const totalWeight = templates.reduce((sum, t) => sum + t.weight, 0);

/** The n-th simulated event for a seed: reproducible, but different every tick. */
export function liveEvent(seed: string, n: number, context: Partial<LiveContext> = {}): LiveEvent {
	const r = rng(hash(`${seed}:live:${n}`));
	const c: LiveContext = {
		clients: context.clients?.length ? context.clients : FALLBACK.clients,
		galleries: context.galleries?.length ? context.galleries : FALLBACK.galleries,
		photoNumbers: context.photoNumbers?.length ? context.photoNumbers : FALLBACK.photoNumbers
	};
	let roll = r() * totalWeight;
	const template = templates.find((t) => (roll -= t.weight) < 0) ?? templates[0];
	return { ...template.make(r, c), id: `live_${n}`, createdAt: new Date().toISOString() };
}
