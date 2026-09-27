import { mockId } from '$lib/admin/shared/mock-dates';
import type { StatusMap } from '$lib/admin/shared/status';
import { seedActivity, seedClients } from './mock';
import type { Client, ClientActivity, ClientStatus } from './types';
import { api, API_URL } from '$lib/admin/api/client';

export const clientStatus: StatusMap<ClientStatus> = {
	LEAD: { label: 'Lead', tone: 'info' },
	ACTIVE: { label: 'Active', tone: 'success' },
	PAST: { label: 'Past', tone: 'neutral' }
};

export type NewClient = Pick<Client, 'name' | 'email' | 'phone' | 'company' | 'notes'> &
	Partial<Pick<Client, 'status' | 'tags' | 'taxId' | 'address' | 'source'>>;

/** CRM clients. API today: GET/POST /clients, GET/PATCH/DELETE /clients/:id. */
class ClientStore {
	items = $state<Client[]>([]);
	activity = $state<ClientActivity[]>([]);
	#loaded = false;
	#loading = false;

	get loaded() {
		return this.#loaded;
	}

	get loading() {
		return this.#loading;
	}

	async load(): Promise<void> {
		if (this.#loaded || this.#loading) return;
		if (!API_URL) {
			// Mock mode
			const { seedClients } = await import('./mock');
			this.items = seedClients;
			this.#loaded = true;
			return;
		}

		this.#loading = true;
		try {
			const response = await api<{ items: Client[]; page: number; pageSize: number; total: number }>(
				'/v1/clients?page=1&pageSize=100'
			);
			this.items = response.items;
			this.#loaded = true;
		} finally {
			this.#loading = false;
		}
	}

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

	async createRemote(input: NewClient): Promise<Client> {
		if (!API_URL) {
			return this.create(input);
		}
		const client = await api<Client>('/v1/clients', {
			method: 'POST',
			body: JSON.stringify(input)
		});
		this.items.unshift(client);
		return client;
	}

	update(id: string, patch: Partial<Omit<Client, 'id'>>) {
		const client = this.items.find((c) => c.id === id);
		if (client) Object.assign(client, patch, { updatedAt: new Date().toISOString() });
	}

	async updateRemote(id: string, patch: Partial<Omit<Client, 'id'>>): Promise<Client> {
		if (!API_URL) {
			this.update(id, patch);
			return this.get(id)!;
		}
		const client = await api<Client>(`/v1/clients/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(patch)
		});
		const idx = this.items.findIndex((c) => c.id === id);
		if (idx >= 0) this.items[idx] = client;
		return client;
	}

	addNote(clientId: string, body: string, authorId: string | null) {
		const now = new Date().toISOString();
		this.activity.push({
			id: `act_${Date.now()}`,
			clientId,
			kind: 'note',
			title: 'Note',
			body,
			href: null,
			authorId,
			createdAt: now
		});
	}

	remove(id: string) {
		this.items = this.items.filter((c) => c.id !== id);
	}

async removeRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.remove(id);
			return;
		}
		await api(`/v1/clients/${id}`, { method: 'DELETE' });
		this.remove(id);
	}
}
export const clients = new ClientStore();