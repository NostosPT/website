import { mockId } from '$lib/admin/shared/mock-dates';
import type { StatusMap } from '$lib/admin/shared/status';
import { seedActivity, seedClients } from './mock';
import type { Client, ClientActivity, ClientStatus } from './types';

export const clientStatus: StatusMap<ClientStatus> = {
	LEAD: { label: 'Lead', tone: 'info' },
	ACTIVE: { label: 'Active', tone: 'success' },
	PAST: { label: 'Past', tone: 'neutral' }
};

export type NewClient = Pick<Client, 'name' | 'email' | 'phone' | 'company' | 'notes'> &
	Partial<Pick<Client, 'status' | 'tags' | 'taxId' | 'address' | 'source'>>;

/** CRM clients. API today: GET/POST /clients, GET/PATCH/DELETE /clients/:id. */
class ClientStore {
	items = $state<Client[]>(seedClients);
	activity = $state<ClientActivity[]>(seedActivity);

	get(id: string | null | undefined): Client | undefined {
		return id ? this.items.find((c) => c.id === id) : undefined;
	}

	options = $derived(
		this.items.map((c) => ({ value: c.id, label: c.company ? `${c.name} · ${c.company}` : c.name }))
	);

	timeline(clientId: string): ClientActivity[] {
		return this.activity
			.filter((a) => a.clientId === clientId)
			.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}

	create(input: NewClient): Client {
		const now = new Date().toISOString();
		const client: Client = {
			id: mockId('cli'),
			status: 'LEAD',
			tags: [],
			taxId: null,
			address: null,
			source: 'email',
			lastContactAt: null,
			createdAt: now,
			updatedAt: now,
			...input
		};
		this.items.unshift(client);
		return client;
	}

	update(id: string, patch: Partial<Omit<Client, 'id'>>) {
		const client = this.items.find((c) => c.id === id);
		if (client) Object.assign(client, patch, { updatedAt: new Date().toISOString() });
	}

	addNote(clientId: string, body: string, authorId: string | null) {
		this.activity.push({
			id: mockId('act'),
			clientId,
			kind: 'note',
			title: 'Note',
			body,
			href: null,
			authorId,
			createdAt: new Date().toISOString()
		});
	}

	remove(id: string) {
		this.items = this.items.filter((c) => c.id !== id);
	}
}

export const clients = new ClientStore();
