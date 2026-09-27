import { api, type PaginatedList, API_URL } from '$lib/admin/api/client';
import type { Availability, Photo, PhotoPatch, PhotoStatus, Visibility } from './types';
import { seedPhotos } from './mock';

// Starting categories (CONTENT.md); any category a photo uses is added to the list.
const baseCategories = ['Street', 'Urban', 'Automotive', 'Portrait', 'Landscape', 'Events'];

export const availabilityStatus = {
	AVAILABLE: { label: 'For sale', tone: 'success' },
	NOT_FOR_SALE: { label: 'Not for sale', tone: 'neutral' },
	SOLD_OUT: { label: 'Sold out', tone: 'warning' }
} as const;

export const availabilityOptions = [
	{ value: 'AVAILABLE', label: 'For sale' },
	{ value: 'NOT_FOR_SALE', label: 'Not for sale' },
	{ value: 'SOLD_OUT', label: 'Sold out' }
] as const;

export type PhotoFilter = {
	query: string;
	category: string;
	visibility: Visibility | 'ALL';
	availability: Availability | 'ALL';
};

/** Street photos with people need a consent check before sale (CONTENT.md › Street Photography). */
export function needsConsentCheck(photo: Pick<Photo, 'tags' | 'availability'>): boolean {
	return (photo.tags?.includes('people') ?? false) && photo.availability === 'AVAILABLE';
}

interface PhotoListResponse {
	items: Photo[];
	page: number;
	pageSize: number;
	total: number;
}

/**
 * Archive photographs. API: GET/POST /v1/photos (page/pagination),
 * GET/PATCH/DELETE /v1/photos/:id, POST /v1/photos/uploads for presigned upload URLs.
 */
class PhotoStore {
	items = $state<Photo[]>([]);
	#loaded = false;
	#loading = false;

	get loaded() {
		return this.#loaded;
	}

	get loading() {
		return this.#loading;
	}

	categories = $derived(
		[...new Set([...baseCategories, ...this.items.map((p) => p.category).filter(Boolean)])].sort() as string[]
	);

	tags = $derived([...new Set(this.items.flatMap((p) => p.tags))].sort());

	nextNumber = $derived(Math.max(0, ...this.items.map((p) => p.number)) + 1);

	get(id: string | null | undefined): Photo | undefined {
		return id ? this.items.find((p) => p.id === id) : undefined;
	}

	many(ids: string[]): Photo[] {
		return ids.map((id) => this.get(id)).filter((p): p is Photo => Boolean(p));
	}

	filter({ query, category, visibility, availability }: PhotoFilter): Photo[] {
		const q = query.trim().toLowerCase().replace(/^nº\s*/, '');
		return this.items
			.filter((p) => !category || p.category === category)
			.filter((p) => visibility === 'ALL' || p.visibility === visibility)
			.filter((p) => availability === 'ALL' || p.availability === availability)
			.filter(
				(p) =>
					!q ||
					String(p.number) === q ||
					(p.title ?? '').toLowerCase().includes(q) ||
					(p.location ?? '').toLowerCase().includes(q) ||
					p.tags?.some((t) => t.includes(q))
			)
			.sort((a, b) => b.number - a.number);
	}

	async load(): Promise<void> {
		if (this.#loaded || this.#loading) return;
		if (!API_URL) {
			// Mock mode: use mock data
			const { seedPhotos } = await import('./mock');
			this.items = seedPhotos;
			this.#loaded = true;
			return;
		}

		this.#loading = true;
		try {
			const response = await api<{ items: Photo[]; page: number; pageSize: number; total: number }>(
				'/v1/photos?page=1&pageSize=500'
			);
			this.items = response.items;
			this.#loaded = true;
		} finally {
			this.#loading = false;
		}
	}

	update(id: string, patch: PhotoPatch) {
		const photo = this.get(id);
		if (photo) Object.assign(photo, patch, { updatedAt: new Date().toISOString() });
	}

	updateMany(ids: string[], patch: PhotoPatch) {
		for (const id of ids) this.update(id, patch);
	}

	/** Registers an uploaded original (POST /v1/photos { originalKey, ... }). */
	async add(input: Pick<Photo, 'originalKey' | 'width' | 'height'> & PhotoPatch): Promise<Photo> {
		if (!API_URL) {
			// Mock mode
			const now = new Date().toISOString();
			const photo: Photo = {
				id: `ph_${this.nextNumber}`,
				number: this.nextNumber,
				title: null,
				description: null,
				displayKey: null,
				thumbnailKey: null,
				takenAt: null,
				location: null,
				status: 'DRAFT',
				visibility: 'PRIVATE',
				availability: 'NOT_FOR_SALE',
				priceCents: null,
				currency: 'EUR',
				photographerId: null,
				uploadStatus: 'PENDING',
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				...input
			};
			this.items.push(photo);
			return photo;
		}

		const photo = await api<Photo>('/v1/photos', {
			method: 'POST',
			body: JSON.stringify({ ...input, originalKey: input.originalKey })
		});
		this.items.unshift(photo);
		return photo;
	}

	remove(ids: string[]) {
		this.items = this.items.filter((p) => !ids.includes(p.id));
	}

	async removeMany(ids: string[]): Promise<void> {
		if (!API_URL) {
			this.items = this.items.filter((p) => !ids.includes(p.id));
			return;
		}
		await Promise.all(ids.map((id) => api(`/v1/photos/${id}`, { method: 'DELETE' })));
		this.items = this.items.filter((p) => !ids.includes(p.id));
	}

	async updateRemote(id: string, patch: PhotoPatch): Promise<void> {
		if (!API_URL) {
			this.update(id, patch);
			return;
		}
		const photo = await api<Photo>(`/v1/photos/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(patch)
		});
		const idx = this.items.findIndex((p) => p.id === id);
		if (idx >= 0) this.items[idx] = photo;
	}
}

export const photos = new PhotoStore();