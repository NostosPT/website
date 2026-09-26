import { daysAgo, minutesAgo } from '$lib/admin/shared/mock-dates';
import type { StatusMap } from '$lib/admin/shared/status';
import type { Fulfilment, Order, PaymentStatus, Product } from './types';

export const products: Record<Product, { label: string; digital: boolean }> = {
	PRINT: { label: 'Print', digital: false },
	FRAMED_PRINT: { label: 'Framed print', digital: false },
	PERSONAL_LICENCE: { label: 'Personal licence', digital: true },
	COMMERCIAL_LICENCE: { label: 'Commercial licence', digital: true }
};

export const paymentStatus: StatusMap<PaymentStatus> = {
	PENDING: { label: 'Pending', tone: 'warning' },
	PAID: { label: 'Paid', tone: 'success' },
	REFUNDED: { label: 'Refunded', tone: 'neutral' },
	FAILED: { label: 'Failed', tone: 'danger' }
};

export const fulfilmentStatus: StatusMap<Fulfilment> = {
	UNFULFILLED: { label: 'To do', tone: 'warning' },
	IN_PRODUCTION: { label: 'Printing', tone: 'purple' },
	SHIPPED: { label: 'Shipped', tone: 'info' },
	DELIVERED: { label: 'Delivered', tone: 'success' },
	DOWNLOADED: { label: 'Downloaded', tone: 'success' }
};

const seed: Order[] = [
	{ id: 'ord_1046', reference: 'ORD-1046', customer: { name: 'Ana Martins', email: 'ana.martins@outlook.pt', clientId: 'cli_ana' }, items: [{ photoId: 'ph_412', product: 'FRAMED_PRINT', size: 'A3', quantity: 1, unitPriceCents: 18500 }], shippingCents: 900, currency: 'EUR', payment: 'PAID', fulfilment: 'UNFULFILLED', shippingAddress: 'Rua do Salitre 88, 1250-199 Lisboa', trackingNumber: null, invoiceId: 'dr_01', note: 'Gift: no prices in the parcel.', createdAt: daysAgo(2, 9) },
	{ id: 'ord_1045', reference: 'ORD-1045', customer: { name: 'Studio Maré', email: 'hello@studiomare.pt', clientId: null }, items: [{ photoId: 'ph_410', product: 'COMMERCIAL_LICENCE', size: null, quantity: 1, unitPriceCents: 45000 }], shippingCents: 0, currency: 'EUR', payment: 'PAID', fulfilment: 'DOWNLOADED', shippingAddress: null, trackingNumber: null, invoiceId: null, note: 'Web campaign, 12 months, Portugal.', createdAt: daysAgo(4, 15) },
	{ id: 'ord_1044', reference: 'ORD-1044', customer: { name: 'Henrik Olsen', email: 'henrik.olsen@gmail.com', clientId: null }, items: [{ photoId: 'ph_416', product: 'PRINT', size: '50×70', quantity: 1, unitPriceCents: 22000 }, { photoId: 'ph_403', product: 'PRINT', size: 'A3', quantity: 1, unitPriceCents: 12000 }], shippingCents: 2400, currency: 'EUR', payment: 'PAID', fulfilment: 'SHIPPED', shippingAddress: 'Nørrebrogade 12, 2200 København N, Denmark', trackingNumber: 'RR123456785PT', invoiceId: null, note: null, createdAt: daysAgo(9, 20) },
	{ id: 'ord_1043', reference: 'ORD-1043', customer: { name: 'Clara Nogueira', email: 'clara.nogueira@sapo.pt', clientId: null }, items: [{ photoId: 'ph_415', product: 'PERSONAL_LICENCE', size: null, quantity: 1, unitPriceCents: 3500 }], shippingCents: 0, currency: 'EUR', payment: 'PENDING', fulfilment: 'UNFULFILLED', shippingAddress: null, trackingNumber: null, invoiceId: null, note: null, createdAt: minutesAgo(95) },
	{ id: 'ord_1042', reference: 'ORD-1042', customer: { name: 'Miguel Duarte', email: 'miguel@duarteautomoveis.pt', clientId: 'cli_duarte' }, items: [{ photoId: 'ph_402', product: 'FRAMED_PRINT', size: '50×70', quantity: 2, unitPriceCents: 26000 }], shippingCents: 0, currency: 'EUR', payment: 'REFUNDED', fulfilment: 'UNFULFILLED', shippingAddress: 'Av. da Liberdade 110, Lisboa', trackingNumber: null, invoiceId: null, note: 'Refunded: Nº 402 is not for sale (client-owned licence).', createdAt: daysAgo(15, 11) }
];

/** Archive orders. Needs API endpoints plus a payment provider webhook. */
class OrderStore {
	items = $state<Order[]>(seed);

	toFulfil = $derived(this.items.filter((o) => o.payment === 'PAID' && o.fulfilment === 'UNFULFILLED'));

	get(id: string | null | undefined): Order | undefined {
		return id ? this.items.find((o) => o.id === id) : undefined;
	}

	totalOf(order: Order): number {
		return order.items.reduce((sum, i) => sum + i.quantity * i.unitPriceCents, 0) + order.shippingCents;
	}

	revenueSince(days: number): number {
		const since = Date.now() - days * 86_400_000;
		return this.items
			.filter((o) => o.payment === 'PAID' && new Date(o.createdAt).getTime() >= since)
			.reduce((sum, o) => sum + this.totalOf(o), 0);
	}

	update(id: string, patch: Partial<Omit<Order, 'id'>>) {
		const order = this.get(id);
		if (order) Object.assign(order, patch);
	}
}

export const orders = new OrderStore();
