import type { StatusMap } from '$lib/admin/shared/status';
import { seedPhotos } from './mock';
import type { Availability, Photo, PhotoPatch, Visibility } from './types';

// Starting categories (CONTENT.md); any category a photo uses is added to the list.
const baseCategories = ['Street', 'Urban', 'Automotive', 'Portrait', 'Landscape', 'Events'];

export const availabilityStatus: StatusMap<Availability> = {
	AVAILABLE: { label: 'For sale', tone: 'success' },
	NOT_FOR_SALE: { label: 'Not for sale', tone: 'neutral' },
	SOLD_OUT: { label: 'Sold out', tone: 'warning' }
};

export const availabilityOptions = [
	{ value: 'AVAILABLE', label: 'For sale' },
	{ value: 'NOT_FOR_SALE', label: 'Not for sale' },
	{ value: 'SOLD_OUT', label: 'Sold out' }
];

export type PhotoFilter = {
	query: string;
	category: string;
	visibility: Visibility | 'ALL';
	availability: Availability | 'ALL';
};

/** Street photos with people need a consent check before sale (CONTENT.md › Street Photography). */
export function needsConsentCheck(photo: Pick<Photo, 'tags' | 'availability'>): boolean {
	return photo.tags.includes('people') && photo.availability === 'AVAILABLE';
}

/**
 * Archive photographs. API: GET/POST /photos (cursor-paginated `{ items, nextCursor }`),
 * GET/PATCH/DELETE /photos/:id, POST /photos/uploads for presigned upload URLs.
 */
class PhotoStore {
	items = $state<Photo[]>(seedPhotos);

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
					p.tags.some((t) => t.includes(q))
			)
			.sort((a, b) => b.number - a.number);
	}

	update(id: string, patch: PhotoPatch) {
		const photo = this.get(id);
		if (photo) Object.assign(photo, patch, { updatedAt: new Date().toISOString() });
	}

	updateMany(ids: string[], patch: PhotoPatch) {
		for (const id of ids) this.update(id, patch);
	}

	/** Registers an uploaded original (POST /photos { originalKey, ... }). */
	add(input: Pick<Photo, 'originalKey' | 'width' | 'height' | 'urls'> & PhotoPatch): Photo {
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
			category: null,
			tags: [],
			visibility: 'PRIVATE',
			availability: 'NOT_FOR_SALE',
			priceCents: null,
			currency: 'EUR',
			watermarked: false,
			photographerId: null,
			createdAt: now,
			updatedAt: now,
			...input
		};
		this.items.push(photo);
		return photo;
	}

	remove(ids: string[]) {
		this.items = this.items.filter((p) => !ids.includes(p.id));
	}
}

export const photos = new PhotoStore();
