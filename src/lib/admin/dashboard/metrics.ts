import { invoices, totalOf } from '$lib/admin/invoices/store.svelte';
import { orders } from '$lib/admin/orders/store.svelte';
import { photos } from '$lib/admin/photos/store.svelte';
import { pipeline } from '$lib/admin/pipeline/store.svelte';
import type { Area } from '$lib/admin/team/types';
import type { KpiId, MetricId } from './config';
import { dayIndex } from './ranges';

export type MetricFormat = 'money' | 'count' | 'percent';

export interface MetricDefinition {
	label: string;
	/** Noun for tooltips and summaries, e.g. "requests". */
	unit: string;
	icon: string;
	area: Area;
	format: MetricFormat;
	description: string;
}

export const metrics: Record<MetricId, MetricDefinition> = {
	revenue: { label: 'Revenue', unit: 'revenue', icon: 'dollar', area: 'finance', format: 'money', description: 'Paid invoices and archive orders.' },
	requests: { label: 'Requests', unit: 'requests', icon: 'board', area: 'crm', format: 'count', description: 'New Studio service requests.' },
	bookings: { label: 'Bookings', unit: 'bookings', icon: 'calendar', area: 'crm', format: 'count', description: 'Requests moved to booked.' },
	orders: { label: 'Orders', unit: 'orders', icon: 'credit-card', area: 'finance', format: 'count', description: 'Prints and licences sold.' },
	views: { label: 'Gallery views', unit: 'views', icon: 'eye', area: 'studio', format: 'count', description: 'Client gallery visits.' },
	uploads: { label: 'Uploads', unit: 'photographs', icon: 'upload', area: 'archive', format: 'count', description: 'Photographs added to the archive.' }
};

export const kpis: Record<KpiId, Omit<MetricDefinition, 'unit'>> = {
	...metrics,
	outstanding: { label: 'Outstanding', icon: 'receipt', area: 'finance', format: 'money', description: 'Issued invoices not yet paid.' },
	conversion: { label: 'Conversion', icon: 'check-circle', area: 'crm', format: 'percent', description: 'Bookings per new request in the period.' }
};

type Daily = Map<number, number>;

function bump(map: Daily, iso: string | null | undefined, amount: number) {
	if (!iso) return;
	const day = dayIndex(new Date(iso));
	map.set(day, (map.get(day) ?? 0) + amount);
}

/**
 * Per-day history built from the records the stores already hold. Returns
 * null for metrics the API keeps no history for yet (gallery views are a
 * running total). Bookings use the request's last update as an approximation
 * until the API records stage changes.
 */
export function liveDaily(metric: MetricId): Daily | null {
	const map: Daily = new Map();
	switch (metric) {
		case 'revenue':
			for (const doc of invoices.items) if (doc.status === 'PAID') bump(map, doc.paidAt, totalOf(doc));
			for (const order of orders.items) if (order.payment === 'PAID') bump(map, order.createdAt, orders.totalOf(order));
			return map;
		case 'requests':
			for (const request of pipeline.items) bump(map, request.createdAt, 1);
			return map;
		case 'bookings':
			for (const request of pipeline.items) {
				if (request.stage === 'BOOKED' || request.stage === 'COMPLETED') bump(map, request.updatedAt, 1);
			}
			return map;
		case 'orders':
			for (const order of orders.items) bump(map, order.createdAt, 1);
			return map;
		case 'uploads':
			for (const photo of photos.items) bump(map, photo.createdAt, 1);
			return map;
		case 'views':
			return null;
	}
}
