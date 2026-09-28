import { mockId } from '$lib/admin/shared/mock-dates';
import { slugify } from '$lib/admin/shared/format';
import type { Service } from './types';
import { api, API_URL } from '$lib/admin/api/client';

// The initial services from docs/STUDIO.md.
const seed: Service[] = [
	{ id: 'svc_automotive', slug: 'automotive', name: 'Automotive', description: 'Vehicles in motion and at rest, for owners, garages and brands.', priceFromCents: 18000, priceToCents: 60000, currency: 'EUR', active: true, position: 0, icon: 'car' },
	{ id: 'svc_portrait', slug: 'portrait', name: 'Portrait', description: 'Individual and small-group portraits, on location in and around Lisbon.', priceFromCents: 12000, priceToCents: 30000, currency: 'EUR', active: true, position: 1, icon: 'user' },
	{ id: 'svc_events', slug: 'event-coverage', name: 'Event coverage', description: 'Corporate dinners, launches and private events, documented quietly.', priceFromCents: 25000, priceToCents: 90000, currency: 'EUR', active: true, position: 2, icon: 'calendar' },
	{ id: 'svc_weddings', slug: 'weddings', name: 'Weddings', description: 'Full-day coverage with a private gallery for selection and delivery.', priceFromCents: 120000, priceToCents: 350000, currency: 'EUR', active: true, position: 3, icon: 'heart' },
	{ id: 'svc_commercial', slug: 'commercial', name: 'Commercial', description: 'Spaces, products and teams for hospitality, retail and architecture.', priceFromCents: 40000, priceToCents: 150000, currency: 'EUR', active: true, position: 4, icon: 'diamond' },
	{ id: 'svc_custom', slug: 'custom', name: 'Other / custom', description: 'Anything else. Priced after a short conversation.', priceFromCents: null, priceToCents: null, currency: 'EUR', active: false, position: 5, icon: 'sparkles' }
];

/** Dashboard-only icon per service slug (the Real API has no icon field). */
const ICONS: Record<string, string> = {
	automotive: 'car',
	portrait: 'user',
	'event-coverage': 'calendar',
	weddings: 'heart',
	commercial: 'diamond',
	custom: 'sparkles'
};

function iconFor(slug: string): string {
	return ICONS[slug] ?? 'sparkles';
}

/** Studio services. API: GET /services/all, POST /services, PATCH/DELETE /services/:id (admin). */
class ServiceStore {
	items = $state<Service[]>([]);
	#loaded = false;
	#loading = false;

	get loaded() {
		return this.#loaded;
	}

	get loading() {
		return this.#loading;
	}

	sorted = $derived([...this.items].sort((a, b) => a.position - b.position));
	options = $derived(this.sorted.map((s) => ({ value: s.id, label: s.name })));

	get(id: string | null | undefined): Service | undefined {
		return id ? this.items.find((s) => s.id === id) : undefined;
	}

	async load(): Promise<void> {
		if (this.#loaded || this.#loading) return;

		this.#loading = true;
		try {
			// Real backend first (Website API → Real API).
			const response = await api<{ items: Service[]; page: number; pageSize: number; total: number }>(
				'/v1/services?page=1&pageSize=100'
			);
			this.items = response.items.map((item) => ({ ...item, icon: iconFor(item.slug) }));
			this.#loaded = true;
		} catch {
			// Offline backend: fall back to the mock catalogue.
			this.items = seed.map((item) => ({ ...item }));
			this.#loaded = true;
		} finally {
			this.#loading = false;
		}
	}

	create(input: Omit<Service, 'id' | 'slug' | 'position'>): Service {
		const service: Service = {
			...input,
			id: mockId('svc'),
			slug: slugify(input.name),
			position: this.items.length
		};
		this.items.push(service);
		return service;
	}

	async createRemote(input: Omit<Service, 'id' | 'slug' | 'position'>): Promise<Service> {
		if (!API_URL) {
			return this.create(input);
		}
		// The Real API has no `icon` field (dashboard-only): strip it.
		const { icon: _icon, ...payload } = input;
		void _icon;
		const service = await api<Service>('/v1/services', {
			method: 'POST',
			body: JSON.stringify(payload)
		});
		const created: Service = { ...service, icon: input.icon ?? iconFor(service.slug) };
		this.items.push(created);
		return created;
	}

	update(id: string, patch: Partial<Omit<Service, 'id'>>) {
		const service = this.items.find((s) => s.id === id);
		if (service) Object.assign(service, patch);
	}

	async updateRemote(id: string, patch: Partial<Omit<Service, 'id'>>): Promise<Service> {
		if (!API_URL) {
			this.update(id, patch);
			return this.get(id)!;
		}
		const { icon: _icon, ...payload } = patch;
		void _icon;
		const service = await api<Service>(`/v1/services/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(payload)
		});
		const idx = this.items.findIndex((s) => s.id === id);
		const icon = idx >= 0 ? (this.items[idx]?.icon ?? iconFor(service.slug)) : iconFor(service.slug);
		if (idx >= 0) this.items[idx] = { ...service, icon };
		return { ...service, icon };
	}

	/** Swap positions with the neighbour in `direction`. */
	move(id: string, direction: -1 | 1) {
		const list = this.sorted;
		const index = list.findIndex((s) => s.id === id);
		const other = list[index + direction];
		if (!other) return;
		const position = list[index].position;
		this.update(id, { position: other.position });
		this.update(other.id, { position });
	}

	async moveRemote(id: string, direction: -1 | 1): Promise<void> {
		if (!API_URL) {
			this.move(id, direction);
			return;
		}
		await api(`/v1/services/${id}/move`, {
			method: 'POST',
			body: JSON.stringify({ direction })
		});
		this.move(id, direction);
	}

	remove(id: string) {
		this.items = this.items.filter((s) => s.id !== id);
	}

async removeRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.remove(id);
			return;
		}
		await api(`/v1/services/${id}`, { method: 'DELETE' });
		this.remove(id);
	}
}
export const services = new ServiceStore();