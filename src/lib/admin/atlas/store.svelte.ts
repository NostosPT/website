import { SvelteURLSearchParams } from 'svelte/reactivity';
import { api, API_URL } from '$lib/admin/api/client';
import { mockId } from '$lib/admin/shared/mock-dates';
import type {
	AtlasGeometryKind,
	AtlasLocation,
	AtlasLocationDetail,
	AtlasLocationFilters,
	AtlasLocationStatus
} from './types';

export const atlasStatus: Record<AtlasLocationStatus, { label: string; tone: string }> = {
	DRAFT: { label: 'Draft', tone: 'neutral' },
	PUBLISHED: { label: 'Published', tone: 'success' },
	ARCHIVED: { label: 'Archived', tone: 'warning' }
};

/** Field Atlas scouting locations. API: staff CRUD at /v1/atlas/locations. */
class AtlasStore {
	items = $state<AtlasLocation[]>([]);
	#loaded = false;
	#loading = false;

	get loaded() {
		return this.#loaded;
	}

	get loading() {
		return this.#loading;
	}

	options = $derived(this.items.map((l) => ({ value: l.id, label: l.name })));

	get(id: string | null | undefined): AtlasLocation | undefined {
		return id ? this.items.find((l) => l.id === id) : undefined;
	}

	async load(filters: AtlasLocationFilters = {}): Promise<void> {
		if (this.#loaded || this.#loading) return;

		this.#loading = true;
		try {
			// Real backend first (Website API → Real API).
			const params = new SvelteURLSearchParams({ page: '1', pageSize: '100' });
			if (filters.status) params.set('status', filters.status);
			if (filters.country) params.set('country', filters.country);
			if (filters.category) params.set('category', filters.category);
			if (filters.q) params.set('q', filters.q);
			const response = await api<{ items: AtlasLocation[] }>(`/v1/atlas/locations?${params}`);
			this.items = response.items;
			this.#loaded = true;
			return;
		} catch {
			// Offline backend: empty list (no mock atlas yet).
			this.items = [];
			this.#loaded = true;
		} finally {
			this.#loading = false;
		}
	}

	async loadDetail(id: string): Promise<AtlasLocationDetail> {
		const local = this.get(id);
		try {
			const detail = await api<AtlasLocationDetail>(`/v1/atlas/locations/${id}`);
			const { categories: _c, photos: _p, ...row } = detail;
			void _c;
			void _p;
			const idx = this.items.findIndex((l) => l.id === id);
			if (idx >= 0) this.items[idx] = row;
			else this.items.unshift(row);
			return detail;
		} catch {
			if (!local) throw new Error('Location not found');
			return { ...local, categories: [], photos: [] };
		}
	}

	create(input: {
		name: string;
		description?: string | null;
		country?: string | null;
		region?: string | null;
		city?: string | null;
		geometryKind?: AtlasGeometryKind;
		latitude?: number | null;
		longitude?: number | null;
	}): AtlasLocation {
		const now = new Date().toISOString();
		const location: AtlasLocation = {
			id: mockId('atl'),
			slug: input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
			name: input.name,
			description: input.description ?? null,
			country: input.country ?? null,
			region: input.region ?? null,
			city: input.city ?? null,
			geometryKind: input.geometryKind ?? 'POINT',
			latitude: input.latitude ?? null,
			longitude: input.longitude ?? null,
			geoJson: null,
			whyInteresting: null,
			subjects: null,
			accessNotes: null,
			safetyNotes: null,
			status: 'DRAFT',
			coverPhotoId: null,
			authorId: null,
			publishedAt: null,
			createdAt: now,
			updatedAt: now
		};
		this.items.unshift(location);
		return location;
	}

	async createRemote(input: {
		name: string;
		description?: string | null;
		country?: string | null;
		region?: string | null;
		city?: string | null;
		geometryKind?: AtlasGeometryKind;
		latitude?: number | null;
		longitude?: number | null;
		geoJson?: unknown;
	}): Promise<AtlasLocation> {
		if (!API_URL) {
			return this.create(input);
		}
		const created = await api<AtlasLocation>('/v1/atlas/locations', {
			method: 'POST',
			body: JSON.stringify({
				name: input.name,
				description: input.description ?? undefined,
				country: input.country ?? undefined,
				region: input.region ?? undefined,
				city: input.city ?? undefined,
				geometryKind: input.geometryKind ?? 'POINT',
				latitude: input.latitude ?? undefined,
				longitude: input.longitude ?? undefined,
				geoJson: input.geoJson ?? undefined
			})
		});
		this.items.unshift(created);
		return created;
	}

	update(id: string, patch: Partial<Omit<AtlasLocation, 'id'>>) {
		const location = this.get(id);
		if (location) Object.assign(location, patch, { updatedAt: new Date().toISOString() });
	}

	async updateRemote(id: string, patch: Partial<Omit<AtlasLocation, 'id'>>): Promise<AtlasLocation> {
		if (!API_URL) {
			this.update(id, patch);
			return this.get(id)!;
		}
		// The Real API PATCH accepts only known keys (slug/status are immutable there).
		const {
			slug: _slug,
			status: _status,
			geoJson,
			...rest
		} = patch as Partial<Omit<AtlasLocation, 'id'>> & { slug?: string; status?: AtlasLocationStatus };
		void _slug;
		void _status;
		const row = await api<AtlasLocation>(`/v1/atlas/locations/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(geoJson === undefined ? rest : { ...rest, geoJson })
		});
		const idx = this.items.findIndex((l) => l.id === id);
		if (idx >= 0) this.items[idx] = row;
		return row;
	}

	async publishRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.update(id, { status: 'PUBLISHED' });
			return;
		}
		const row = await api<AtlasLocation>(`/v1/atlas/locations/${id}/publish`, { method: 'POST' });
		const idx = this.items.findIndex((l) => l.id === id);
		if (idx >= 0) this.items[idx] = row;
	}

	async unpublishRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.update(id, { status: 'DRAFT' });
			return;
		}
		const row = await api<AtlasLocation>(`/v1/atlas/locations/${id}/unpublish`, { method: 'POST' });
		const idx = this.items.findIndex((l) => l.id === id);
		if (idx >= 0) this.items[idx] = row;
	}

	remove(id: string) {
		this.items = this.items.filter((l) => l.id !== id);
	}

	async removeRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.remove(id);
			return;
		}
		await api(`/v1/atlas/locations/${id}`, { method: 'DELETE' });
		this.remove(id);
	}

	async setPhotosRemote(id: string, entries: { photoId: string; caption?: string | null }[]): Promise<AtlasLocationDetail> {
		const captions: Record<string, string> = {};
		for (const entry of entries) {
			if (entry.caption) captions[entry.photoId] = entry.caption;
		}
		const detail = await api<AtlasLocationDetail>(`/v1/atlas/locations/${id}/photos`, {
			method: 'PUT',
			body: JSON.stringify({ photoIds: entries.map((e) => e.photoId), captions })
		});
		return detail;
	}

	async setCategoriesRemote(id: string, categorySlugs: string[]): Promise<AtlasLocationDetail> {
		const detail = await api<AtlasLocationDetail>(`/v1/atlas/locations/${id}/categories`, {
			method: 'PUT',
			body: JSON.stringify({ categorySlugs })
		});
		return detail;
	}
}

export const atlas = new AtlasStore();
