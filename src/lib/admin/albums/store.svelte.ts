import { api, type PaginatedList, API_URL } from '$lib/admin/api/client';
import { daysAgo, mockId } from '$lib/admin/shared/mock-dates';
import { slugify } from '$lib/admin/shared/format';
import type { Album, AlbumDetail, AlbumList, AlbumFilters, AlbumStatus, AlbumType } from './types';
import { photos } from '$lib/admin/photos/store.svelte';

const seed: Album[] = [
	{ id: 'alb_city', clientId: 'cli_demo', slug: 'the-city-slowly', title: 'The city, slowly', description: 'Streets, arcades and the lines trams leave behind.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_414', expiresAt: null, publishedAt: daysAgo(40), views: 0, lastViewedAt: null, photoIds: ['ph_414', 'ph_403', 'ph_408', 'ph_410', 'ph_401', 'ph_409'], createdAt: daysAgo(90), updatedAt: daysAgo(12) },
	{ id: 'alb_night', clientId: 'cli_demo', slug: 'after-hours', title: 'After hours', description: 'The last trams and the people on them.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_416', expiresAt: null, publishedAt: daysAgo(18), views: 0, lastViewedAt: null, photoIds: ['ph_416', 'ph_404', 'ph_406', 'ph_411'], createdAt: daysAgo(30), updatedAt: daysAgo(18) },
	{ id: 'alb_machines', clientId: 'cli_demo', slug: 'machines', title: 'Machines', description: 'Automotive work from commissions and the street.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_412', expiresAt: null, publishedAt: daysAgo(70), views: 0, lastViewedAt: null, photoIds: ['ph_412', 'ph_402'], createdAt: daysAgo(100), updatedAt: daysAgo(70) },
	{ id: 'alb_quiet', clientId: 'cli_demo', slug: 'quiet-things', title: 'Quiet things', description: null, type: 'FREE', status: 'DRAFT', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: null, expiresAt: null, publishedAt: null, views: 0, lastViewedAt: null, photoIds: ['ph_415', 'ph_413', 'ph_407'], createdAt: daysAgo(8), updatedAt: daysAgo(2) }
];

/** Albums. API: GET/POST /v1/albums, GET/PATCH/DELETE /v1/albums/:id, PUT /v1/albums/:id/photos (ordered ids). */
class AlbumStore {
	items = $state<Album[]>([]);
	#loaded = false;
	#loading = false;

	get loaded() {
		return this.#loaded;
	}

	get loading() {
		return this.#loading;
	}

	options = $derived(this.items.map((a) => ({ value: a.id, label: a.title })));

	get(id: string | null | undefined): Album | undefined {
		return id ? this.items.find((a) => a.id === id) : undefined;
	}

	containing(photoId: string): Album[] {
		return this.items.filter((a) => a.photoIds.includes(photoId));
	}

	/** The explicit cover, else the first photo. */
	coverOf(album: Album): string | null {
		return album.coverPhotoId ?? album.photoIds[0] ?? null;
	}

	async load(): Promise<void> {
		if (this.#loaded || this.#loading) return;

		this.#loading = true;
		try {
			// Real backend first (Website API → Real API).
			const response = await api<{ items: Album[]; page: number; pageSize: number; total: number }>(
				'/v1/albums?page=1&pageSize=100'
			);
			this.items = response.items;
			this.#loaded = true;
			return;
		} catch {
			// Offline backend: fall through to the mock catalogue below.
		} finally {
			this.#loading = false;
		}

		{
			// Mock fallback (offline backend).
			this.items = [
				{ id: 'alb_city', clientId: 'cli_demo', slug: 'the-city-slowly', title: 'The city, slowly', description: 'Streets, arcades and the lines trams leave behind.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_414', expiresAt: null, publishedAt: daysAgo(40), views: 0, lastViewedAt: null, photoIds: ['ph_414', 'ph_403', 'ph_408', 'ph_410', 'ph_401', 'ph_409'], createdAt: daysAgo(90), updatedAt: daysAgo(12) },
				{ id: 'alb_night', clientId: 'cli_demo', slug: 'after-hours', title: 'After hours', description: 'The last trams and the people on them.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_416', expiresAt: null, publishedAt: daysAgo(18), views: 0, lastViewedAt: null, photoIds: ['ph_416', 'ph_404', 'ph_406', 'ph_411'], createdAt: daysAgo(30), updatedAt: daysAgo(18) },
				{ id: 'alb_machines', clientId: 'cli_demo', slug: 'machines', title: 'Machines', description: 'Automotive work from commissions and the street.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_412', expiresAt: null, publishedAt: daysAgo(70), views: 0, lastViewedAt: null, photoIds: ['ph_412', 'ph_402'], createdAt: daysAgo(100), updatedAt: daysAgo(70) },
				{ id: 'alb_quiet', clientId: 'cli_demo', slug: 'quiet-things', title: 'Quiet things', description: null, type: 'FREE', status: 'DRAFT', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: null, expiresAt: null, publishedAt: null, views: 0, lastViewedAt: null, photoIds: ['ph_415', 'ph_413', 'ph_407'], createdAt: daysAgo(8), updatedAt: daysAgo(2) }
			];
			this.#loaded = true;
		}
	}

	async loadDetail(id: string): Promise<AlbumDetail> {
		if (!API_URL) {
			const album = this.get(id);
			if (!album) throw new Error('Album not found');
			return { ...album, photos: [] };
		}
		return api(`/v1/albums/${id}`);
	}

	create(input: Pick<Album, 'title' | 'description' | 'status' | 'type'> & { photoIds?: string[] }): Album {
		const now = new Date().toISOString();
		const album: Album = {
			id: mockId('alb'),
			clientId: 'cli_demo',
			slug: slugify(input.title),
			title: input.title,
			description: input.description ?? null,
			type: input.type ?? 'FREE',
			status: input.status ?? 'DRAFT',
			accessCodeHash: null,
			secretVersion: 1,
			priceCents: null,
			packPriceCents: null,
			packSize: null,
			currency: 'EUR',
			coverPhotoId: null,
			expiresAt: null,
			publishedAt: input.status === 'PUBLISHED' ? new Date().toISOString() : null,
			views: 0,
			lastViewedAt: null,
			photoIds: input.photoIds ?? [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		this.items.unshift(album);
		return album;
	}

	async createRemote(input: Pick<Album, 'title' | 'description' | 'status' | 'type'> & { photoIds?: string[] }): Promise<Album> {
		if (!API_URL) {
			return this.create(input);
		}
		const album = await api<Album>('/v1/albums', {
			method: 'POST',
			body: JSON.stringify(input)
		});
		this.items.unshift(album);
		return album;
	}

	update(id: string, patch: Partial<Omit<Album, 'id'>>) {
		const album = this.get(id);
		if (!album) return;
		if (patch.status === 'PUBLISHED' && !album.publishedAt) patch.publishedAt = new Date().toISOString();
		Object.assign(album, patch, { updatedAt: new Date().toISOString() });
	}

	async updateRemote(id: string, patch: Partial<Omit<Album, 'id'>>): Promise<Album> {
		if (!API_URL) {
			this.update(id, patch);
			return this.get(id)!;
		}
		const album = await api<Album>(`/v1/albums/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(patch)
		});
		const idx = this.items.findIndex((a) => a.id === id);
		if (idx >= 0) this.items[idx] = album;
		return album;
	}

	addPhotos(id: string, photoIds: string[]) {
		const album = this.get(id);
		if (!album) return;
		this.update(id, { photoIds: [...album.photoIds, ...photoIds.filter((p) => !album.photoIds.includes(p))] });
	}

	async addPhotosRemote(id: string, photoIds: string[]): Promise<void> {
		if (!API_URL) {
			this.addPhotos(id, photoIds);
			return;
		}
		await api(`/v1/albums/${id}/photos`, {
			method: 'PUT',
			body: JSON.stringify({ photoIds })
		});
		this.addPhotos(id, photoIds);
	}

	removePhoto(id: string, photoId: string) {
		const album = this.get(id);
		if (!album) return;
		this.update(id, {
			photoIds: album.photoIds.filter((p) => p !== photoId),
			coverPhotoId: album.coverPhotoId === photoId ? null : album.coverPhotoId
		});
	}

	async removePhotoRemote(id: string, photoId: string): Promise<void> {
		if (!API_URL) {
			this.removePhoto(id, photoId);
			return;
		}
		await api(`/v1/albums/${id}/photos/${photoId}`, { method: 'DELETE' });
		this.removePhoto(id, photoId);
	}

	/** Moves a photo to a new index (drag and drop ordering). */
	reorder(id: string, from: number, to: number) {
		const album = this.get(id);
		if (!album || from === to) return;
		const next = [...album.photoIds];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		this.update(id, { photoIds: next });
	}

	async reorderRemote(id: string, from: number, to: number): Promise<void> {
		if (!API_URL) {
			this.reorder(id, from, to);
			return;
		}
		await api(`/v1/albums/${id}/photos`, {
			method: 'PATCH',
			body: JSON.stringify({ photoId: this.get(id)!.photoIds[from], position: to })
		});
		this.reorder(id, from, to);
	}

	remove(id: string) {
		this.items = this.items.filter((a) => a.id !== id);
	}

	async removeRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.remove(id);
			return;
		}
		await api(`/v1/albums/${id}`, { method: 'DELETE' });
		this.remove(id);
	}
}

export const albums = new AlbumStore();