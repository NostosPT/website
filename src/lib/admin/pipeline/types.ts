import type { LeadSource } from '$lib/admin/clients/types';

/**
 * A Studio service request moving through the pipeline (docs/STUDIO.md):
 * request → qualified → quote → booked → completed, or lost.
 * Not in the API yet; ADMIN.md › Service requests lists the fields to track.
 */
export type Stage = 'NEW' | 'QUALIFIED' | 'QUOTED' | 'BOOKED' | 'COMPLETED' | 'LOST';

export interface ServiceRequest {
	id: string;
	/** Human reference, e.g. "REQ-2026-031". */
	reference: string;
	title: string;
	clientId: string;
	serviceId: string;
	stage: Stage;
	/** STUDIO.md › 02 — Project: only what is needed to understand the job. */
	project: {
		date: string | null;
		location: string | null;
		duration: string | null;
		/** People or vehicles, depending on the service. */
		headcount: number | null;
		intendedUse: string | null;
		details: string | null;
	};
	/** Shown to the client when enough information exists. */
	estimate: { fromCents: number | null; toCents: number | null } | null;
	/** Final quoted amount, once a quote document exists. */
	quoteCents: number | null;
	quoteId: string | null;
	assigneeId: string | null;
	source: LeadSource;
	lostReason: string | null;
	notes: { id: string; authorId: string; body: string; createdAt: string }[];
	createdAt: string;
	updatedAt: string;
}
