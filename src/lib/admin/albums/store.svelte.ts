import { api, type PaginatedList, API_URL } from '$lib/admin/api/client';
import { daysAgo, mockId } from '$lib/admin/shared/mock-dates';
import { slugify } from '$lib/admin/shared/format';
import type { Album, AlbumDetail, AlbumFavorite, AlbumList, AlbumFilters, AlbumStatus, AlbumType } from './types';
import { photos } from '$lib/admin/photos/store.svelte';

const seed: Album[] = [
	{ id: 'alb_city', clientId: 'cli_demo', slug: 'the-city-slowly', title: 'The city, slowly', description: 'Streets, arcades and the lines trams leave behind.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_414', expiresAt: null, publishedAt: daysAgo(40), views: 0, lastViewedAt: null, photoIds: ['ph_414', 'ph_403', 'ph_408', 'ph_410', 'ph_401', 'ph_409'], createdAt: daysAgo(90), updatedAt: daysAgo(12) },
	{ id: 'alb_night', clientId: 'cli_demo', slug: 'after-hours', title: 'After hours', description: 'The last trams and the people on them.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_416', expiresAt: null, publishedAt: daysAgo(18), views: 0, lastViewedAt: null, photoIds: ['ph_416', 'ph_404', 'ph_406', 'ph_411'], createdAt: daysAgo(30), updatedAt: daysAgo(18) },
	{ id: 'alb_machines', clientId: 'cli_demo', slug: 'machines', title: 'Machines', description: 'Automotive work from commissions and the street.', type: 'FREE', status: 'PUBLISHED', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: 'ph_412', expiresAt: null, publishedAt: daysAgo(70), views: 0, lastViewedAt: null, photoIds: ['ph_412', 'ph_402'], createdAt: daysAgo(100), updatedAt: daysAgo(70) },
	{ id: 'alb_quiet', clientId: 'cli_demo', slug: 'quiet-things', title: 'Quiet things', description: null, type: 'FREE', status: 'DRAFT', accessCodeHash: null, secretVersion: 1, priceCents: null, packPriceCents: null, packSize: null, currency: 'EUR', coverPhotoId: null, expiresAt: null, publishedAt: null, views: 0, lastViewedAt: null, photoIds: ['ph_415', 'ph_413', 'ph_407'], createdAt: daysAgo(8), updatedAt: daysAgo(2) }
];

/** Albums. API: GET/POST /v1/albums, GET/PATCH/DELETE /v1/albums/:id, PUT /v1/albums/:id/photos (ordered ids). */

/** API list/detail rows carry no photoIds/accessCodeHash — fill dashboard defaults. */
interface AlbumRow extends Omit<Album, 'photoIds' | 'accessCodeHash'> {
	photoIds?: string[];
	accessCodeHash?: string | null;
}

function toWebsite(row: AlbumRow): Album {
	return { ...row, photoIds: row.photoIds ?? [], accessCodeHash: null };
}
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

	/** Client favorites per album id (staff read surface for purchase assistance). */
	favorites = $state<Record<string, AlbumFavorite[]>>({});
	#favoritesLoading = $state<Record<string, boolean>>({});

	favoritesLoading(id: string): boolean {
		return this.#favoritesLoading[id] ?? false;
	}

	favoritesOf(id: string): AlbumFavorite[] {
		return this.favorites[id] ?? [];
	}

	/** Real backend first; keeps the previous (possibly empty) state on error. No mock fallback. */
	async loadFavorites(id: string): Promise<void> {
		if (this.#favoritesLoading[id]) return;
		this.#favoritesLoading[id] = true;
		try {
			const response = await api<{ items: AlbumFavorite[] }>(`/v1/albums/${id}/favorites?page=1&pageSize=100`);
			this.favorites[id] = response.items;
		} catch {
			// Unreachable backend or unauthenticated: keep previous state.
		} finally {
			this.#favoritesLoading[id] = false;
		}
	}

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
			const response = await api<{ items: AlbumRow[]; page: number; pageSize: number; total: number }>(
				'/v1/albums?page=1&pageSize=100'
			);
			this.items = response.items.map(toWebsite);
			this.#loaded = true;
			return;
		} catch {
			// Offline backend: fall through to the mock catalogue below.
		} finally {
			this.#loading = false;
		}

		{
			// Mock fallback (offline backend).
			this.items = seed.map((item) => ({ ...item }));
			this.#loaded = true;
		}
	}

	async loadDetail(id: string): Promise<AlbumDetail> {
		const local = this.get(id);
		try {
			// Real backend first (Website API → Real API).
			const row = await api<AlbumRow>(`/v1/albums/${id}`);
			const album = toWebsite(row);
			const idx = this.items.findIndex((a) => a.id === id);
			if (idx >= 0) this.items[idx] = album;
			else this.items.unshift(album);
			return { ...album, photos: [] };
		} catch {
			// Offline backend: fall back to the local item.
			if (!local) throw new Error('Album not found');
			return { ...local, photos: [] };
		}
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

	async createRemote(
		input: Pick<Album, 'title' | 'description' | 'status' | 'type'> & { photoIds?: string[] },
		clientId: string
	): Promise<Album> {
		if (!API_URL) {
			return this.create(input);
		}
		// The Real API requires a real client UUID and accepts only known
		// keys (status/slug/photoIds are managed separately).
		const created = await api<AlbumRow>('/v1/albums', {
			method: 'POST',
			body: JSON.stringify({
				clientId,
				title: input.title,
				description: input.description,
				type: input.type
			})
		});
		const album = toWebsite(created);
		this.items.unshift(album);
		if (input.photoIds && input.photoIds.length > 0) {
			await this.addPhotosRemote(album.id, input.photoIds);
		}
		if (input.status === 'PUBLISHED') {
			await this.publishRemote(album.id);
		}
		return this.get(album.id) ?? album;
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
		// The Real API PATCH accepts only known keys (slug/status are immutable
		// there: status flows through publish/unpublish/archive instead).
		const { slug: _slug, status: _status, photoIds: _photoIds, accessCodeHash: _hash, ...rest } = patch;
		void _slug;
		void _status;
		void _photoIds;
		void _hash;
		const row = await api<AlbumRow>(`/v1/albums/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(rest)
		});
		const album = toWebsite(row);
		const idx = this.items.findIndex((a) => a.id === id);
		if (idx >= 0) {
			// Preserve locally-known membership (list rows carry no photoIds).
			album.photoIds = this.items[idx].photoIds;
			this.items[idx] = album;
		}
		return album;
	}

	/** Publish via the dedicated endpoint (status is immutable on PATCH). */
	async publishRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.update(id, { status: 'PUBLISHED' });
			return;
		}
		const row = await api<AlbumRow>(`/v1/albums/${id}/publish`, { method: 'POST' });
		const idx = this.items.findIndex((a) => a.id === id);
		if (idx >= 0) {
			const photoIds = this.items[idx].photoIds;
			this.items[idx] = { ...toWebsite(row), photoIds };
		}
	}

	/** Unpublish via the dedicated endpoint. */
	async unpublishRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.update(id, { status: 'DRAFT' });
			return;
		}
		const row = await api<AlbumRow>(`/v1/albums/${id}/unpublish`, { method: 'POST' });
		const idx = this.items.findIndex((a) => a.id === id);
		if (idx >= 0) {
			const photoIds = this.items[idx].photoIds;
			this.items[idx] = { ...toWebsite(row), photoIds };
		}
	}

	addPhotos(id: string, photoIds: string[]) {
		const album = this.get(id);
		if (!album) return;
		this.update(id, { photoIds: [...album.photoIds, ...photoIds.filter((p) => !album.photoIds.includes(p))] });
	}

	async addPhotosRemote(id: string, photoIds: string[]): Promise<void> {
		// The Real API replaces the full ordered membership on PUT.
		const album = this.get(id);
		const next = [...(album?.photoIds ?? []), ...photoIds.filter((p) => !(album?.photoIds ?? []).includes(p))];
		if (!API_URL) {
			this.addPhotos(id, photoIds);
			return;
		}
		await api(`/v1/albums/${id}/photos`, {
			method: 'PUT',
			body: JSON.stringify({ photoIds: next })
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
		// No single-photo DELETE upstream: rewrite the membership without it.
		const album = this.get(id);
		if (!API_URL || !album) {
			this.removePhoto(id, photoId);
			return;
		}
		await api(`/v1/albums/${id}/photos`, {
			method: 'PUT',
			body: JSON.stringify({ photoIds: album.photoIds.filter((p) => p !== photoId) })
		});
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
		// No reorder endpoint upstream: persist the reordered full list.
		const album = this.get(id);
		if (!API_URL || !album || from === to) {
			this.reorder(id, from, to);
			return;
		}
		const next = [...album.photoIds];
		const [moved] = next.splice(from, 1);
		next.splice(to, 0, moved);
		await api(`/v1/albums/${id}/photos`, {
			method: 'PUT',
			body: JSON.stringify({ photoIds: next })
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