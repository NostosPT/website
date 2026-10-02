import { env } from '$env/dynamic/public';

/**
 * Overview dashboard configuration, read from `PUBLIC_DASHBOARD_*` at runtime
 * (`$env/dynamic/public`), so a deploy can reshape the board without a rebuild.
 * Display-only settings: nothing here is a secret or a permission — role access
 * still filters every widget, and the API stays the security boundary.
 *
 * Every variable is optional. Invalid values fall back to the default with a
 * console warning rather than breaking the page. See `.env.example`.
 */

export type RangeKey = '7d' | '30d' | '90d' | '12m';

/** `mock`: generated history (seeded). `live`: history bucketed from loaded records. */
export type DataSource = 'mock' | 'live';

export type Density = 'comfortable' | 'compact';

export type WidgetId =
	| 'kpis'
	| 'trend'
	| 'attention'
	| 'pipeline'
	| 'upcoming'
	| 'activity'
	| 'galleries'
	| 'archive';

export type MetricId = 'revenue' | 'requests' | 'bookings' | 'orders' | 'views' | 'uploads';

/** Time-series metrics plus two snapshot figures. */
export type KpiId = MetricId | 'outstanding' | 'conversion';

export interface DashboardConfig {
	source: DataSource;
	/** Widgets in display order. */
	widgets: WidgetId[];
	/** KPI tiles in display order. */
	kpis: KpiId[];
	/** Metric the trend chart opens on. */
	metric: MetricId;
	range: RangeKey;
	/** Mock only: same seed, same history. */
	seed: string;
	/** Mock only: volume multiplier. */
	scale: number;
	/** Mock only: growth per 30 days, e.g. 0.1 = +10%, -0.2 = −20%. */
	trend: number;
	/** Mock only: seconds between simulated live events; 0 turns it off. */
	tickSeconds: number;
	density: Density;
	/** Monthly revenue goal in cents, or null for none. */
	revenueGoalCents: number | null;
}

export const WIDGET_IDS: WidgetId[] = [
	'kpis',
	'trend',
	'attention',
	'pipeline',
	'upcoming',
	'activity',
	'galleries',
	'archive'
];

export const METRIC_IDS: MetricId[] = ['revenue', 'requests', 'bookings', 'orders', 'views', 'uploads'];

export const KPI_IDS: KpiId[] = [...METRIC_IDS, 'outstanding', 'conversion'];

export const RANGE_KEYS: RangeKey[] = ['7d', '30d', '90d', '12m'];

export const defaults: DashboardConfig = {
	source: 'mock',
	widgets: WIDGET_IDS,
	kpis: ['revenue', 'requests', 'conversion', 'outstanding'],
	metric: 'revenue',
	range: '30d',
	seed: 'nostos',
	scale: 1,
	trend: 0.06,
	tickSeconds: 25,
	density: 'comfortable',
	revenueGoalCents: null
};

type Env = Record<string, string | undefined>;

function warn(name: string, value: string, fallback: unknown) {
	console.warn(`[dashboard] Ignoring ${name}="${value}"; using ${JSON.stringify(fallback)}.`);
}

function oneOf<T extends string>(e: Env, name: string, allowed: readonly T[], fallback: T): T {
	const raw = e[name]?.trim();
	if (!raw) return fallback;
	if ((allowed as readonly string[]).includes(raw)) return raw as T;
	warn(name, raw, fallback);
	return fallback;
}

/** Comma list, deduplicated, unknown ids dropped. An empty result keeps the fallback. */
function listOf<T extends string>(e: Env, name: string, allowed: readonly T[], fallback: T[]): T[] {
	const raw = e[name]?.trim();
	if (!raw) return fallback;
	const ids = [...new Set(raw.split(',').map((id) => id.trim()).filter(Boolean))];
	const valid = ids.filter((id): id is T => (allowed as readonly string[]).includes(id));
	if (valid.length !== ids.length) {
		const unknown = ids.filter((id) => !valid.includes(id as T));
		console.warn(`[dashboard] ${name}: unknown ids ${unknown.join(', ')} (allowed: ${allowed.join(', ')}).`);
	}
	return valid.length ? valid : fallback;
}

function numberIn(e: Env, name: string, min: number, max: number, fallback: number): number {
	const raw = e[name]?.trim();
	if (!raw) return fallback;
	const value = Number(raw);
	if (Number.isFinite(value) && value >= min && value <= max) return value;
	warn(name, raw, fallback);
	return fallback;
}

export function readConfig(e: Env): DashboardConfig {
	const goal = numberIn(e, 'PUBLIC_DASHBOARD_REVENUE_GOAL', 0, 10_000_000, 0);
	const tick = numberIn(e, 'PUBLIC_DASHBOARD_TICK_SECONDS', 0, 3600, defaults.tickSeconds);
	return {
		source: oneOf(e, 'PUBLIC_DASHBOARD_SOURCE', ['mock', 'live'], defaults.source),
		widgets: listOf(e, 'PUBLIC_DASHBOARD_WIDGETS', WIDGET_IDS, defaults.widgets),
		kpis: listOf(e, 'PUBLIC_DASHBOARD_KPIS', KPI_IDS, defaults.kpis),
		metric: oneOf(e, 'PUBLIC_DASHBOARD_METRIC', METRIC_IDS, defaults.metric),
		range: oneOf(e, 'PUBLIC_DASHBOARD_RANGE', RANGE_KEYS, defaults.range),
		seed: e.PUBLIC_DASHBOARD_SEED?.trim() || defaults.seed,
		scale: numberIn(e, 'PUBLIC_DASHBOARD_SCALE', 0.1, 50, defaults.scale),
		trend: numberIn(e, 'PUBLIC_DASHBOARD_TREND', -0.9, 3, defaults.trend),
		// Sub-3s ticks would make the feed unreadable; clamp them to 3s.
		tickSeconds: tick > 0 && tick < 3 ? 3 : tick,
		density: oneOf(e, 'PUBLIC_DASHBOARD_DENSITY', ['comfortable', 'compact'], defaults.density),
		revenueGoalCents: goal > 0 ? Math.round(goal * 100) : null
	};
}

export const dashboardConfig: DashboardConfig = readConfig(env);
