/**
 * Archive sales (ADMIN.md › Orders; ROADMAP › Phase 4 — Commerce): prints and
 * licences of archive photographs. Not in the API yet.
 */
export type Product = 'PRINT' | 'FRAMED_PRINT' | 'PERSONAL_LICENCE' | 'COMMERCIAL_LICENCE';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type Fulfilment = 'UNFULFILLED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'DOWNLOADED';

export interface OrderItem {
	photoId: string;
	product: Product;
	/** Print size, e.g. "A3". */
	size: string | null;
	quantity: number;
	unitPriceCents: number;
}

export interface Order {
	id: string;
	/** "ORD-1042" */
	reference: string;
	customer: { name: string; email: string; clientId: string | null };
	items: OrderItem[];
	shippingCents: number;
	currency: string;
	payment: PaymentStatus;
	fulfilment: Fulfilment;
	shippingAddress: string | null;
	trackingNumber: string | null;
	invoiceId: string | null;
	note: string | null;
	createdAt: string;
}
