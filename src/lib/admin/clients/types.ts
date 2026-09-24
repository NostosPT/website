/**
 * A Studio client. The first block mirrors `Client` in the API schema; the
 * CRM fields below it are proposed additions (status, tags, tax data, source).
 */
export interface Client {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	company: string | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;

	// --- CRM additions (not in the API yet) --------------------------------
	status: ClientStatus;
	tags: string[];
	/** Portuguese NIF, needed on fiscal invoices. */
	taxId: string | null;
	address: string | null;
	source: LeadSource;
	lastContactAt: string | null;
}

export type ClientStatus = 'LEAD' | 'ACTIVE' | 'PAST';

export type LeadSource = 'website' | 'email' | 'referral' | 'instagram' | 'archive';

export type ActivityKind = 'note' | 'email' | 'request' | 'invoice' | 'gallery' | 'order' | 'call';

/** One entry on a client's timeline. */
export interface ClientActivity {
	id: string;
	clientId: string;
	kind: ActivityKind;
	title: string;
	body: string | null;
	href: string | null;
	authorId: string | null;
	createdAt: string;
}
