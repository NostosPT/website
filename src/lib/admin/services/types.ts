/** A Studio offering. Mirrors `Service` in the API schema. */
export interface Service {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	/** Estimated range, never a guaranteed price (STUDIO.md › Estimate). */
	priceFromCents: number | null;
	priceToCents: number | null;
	currency: string;
	active: boolean;
	position: number;
	/** Dashboard-only: kit icon name. */
	icon: string;
}
