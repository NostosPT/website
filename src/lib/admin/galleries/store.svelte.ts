import { metadata } from '$lib/metadata';
import { daysAgo, daysFromNow, minutesAgo, mockId } from '$lib/admin/shared/mock-dates';
import type { StatusMap } from '$lib/admin/shared/status';
import type { Gallery, GalleryStatus } from './types';
import { api, API_URL } from '$lib/admin/api/client';

export const galleryStatus: StatusMap<GalleryStatus> = {
	DRAFT: { label: 'Draft', tone: 'neutral' },
	PUBLISHED: { label: 'Shared', tone: 'success' },
	ARCHIVED: { label: 'Archived', tone: 'warning' }
};

const all = (ids: number[], selected: number[] = []) =>
	ids.map((n) => ({ photoId: `ph_${n}`, selected: selected.includes(n) }));

const seed = [
	{
		id: 'gal_regaleira', slug: 'k7Qm2xVb9pLr', title: 'Quinta da Regaleira', message: 'Beatriz & Nuno — thank you for letting us be there. Choose up to 60 favourites for the album.',
		status: 'PUBLISHED', hasAccessCode: true, allowDownload: false, expiresAt: daysFromNow(54), clientId: 'cli_beatriz', serviceId: 'svc_weddings',
		photos: [{ photoId: 'ph_401', selected: true }, { photoId: 'ph_403', selected: false }, { photoId: 'ph_404', selected: false }, { photoId: 'ph_405', selected: true }, { photoId: 'ph_406', selected: false }, { photoId: 'ph_408', selected: true }, { photoId: 'ph_409', selected: false }, { photoId: 'ph_410', selected: false }, { photoId: 'ph_411', selected: false }, { photoId: 'ph_413', selected: true }, { photoId: 'ph_414', selected: true }, { photoId: 'ph_415', selected: true }, { photoId: 'ph_416', selected: true }],
		selectionLimit: 60, selectionSubmittedAt: minutesAgo(12), views: 38, lastViewedAt: minutesAgo(12), createdAt: daysAgo(7), updatedAt: minutesAgo(12)
	},
	{
		id: 'gal_sal_spring', slug: 'Hs3vT8nWq1Ze', title: 'Spring menu', message: 'All photographs are cleared for web and print.',
		status: 'PUBLISHED', hasAccessCode: false, allowDownload: true, expiresAt: daysFromNow(20), clientId: 'cli_sal', serviceId: 'svc_commercial',
		photos: [{ photoId: 'ph_407', selected: false }, { photoId: 'ph_409', selected: false }, { photoId: 'ph_401', selected: false }], selectionLimit: null, selectionSubmittedAt: null, views: 12, lastViewedAt: daysAgo(3, 12), createdAt: daysAgo(45), updatedAt: daysAgo(40)
	},
	{
		id: 'gal_garagem47', slug: 'Pz4rY6cKm0Na', title: 'Classic collection', message: null,
		status: 'ARCHIVED', hasAccessCode: true, allowDownload: true, expiresAt: daysAgo(10), clientId: 'cli_lucas', serviceId: 'svc_automotive',
		photos: [{ photoId: 'ph_412', selected: false }, { photoId: 'ph_402', selected: false }], selectionLimit: null, selectionSubmittedAt: daysAgo(50), views: 21, lastViewedAt: daysAgo(48), createdAt: daysAgo(58), updatedAt: daysAgo(10)
	},
	{
		id: 'gal_lumen', slug: 'Wb8nE2sXq5Tj', title: 'Hotel Lumen — scouting', message: null,
		status: 'DRAFT', hasAccessCode: false, allowDownload: false, expiresAt: null, clientId: 'cli_lumen', serviceId: 'svc_commercial',
		photos: [{ photoId: 'ph_407', selected: false }, { photoId: 'ph_409', selected: false }], selectionLimit: null, selectionSubmittedAt: null, views: 0, lastViewedAt: null, createdAt: daysAgo(2), updatedAt: daysAgo(2)
	}
];

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const random = (length: number, alphabet = ALPHABET) =>
	Array.from(crypto.getRandomValues(new Uint32Array(length)), (n) => alphabet[n % alphabet.length]).join('');

/** Readable access codes without look-alike characters, e.g. "KR4-9WX". */
export const generateAccessCode = () => `${random(3, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789')}-${random(3, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789')}`;

/**
 * Client galleries. API: GET/POST /v1/galleries, GET/PATCH/DELETE /galleries/:id,
 * PUT /galleries/:id/photos, POST /galleries/:id/rotate-link.
 */
class GalleryStore {
	items = $state<Gallery[]>([]);
	#loaded = false;
	#loading = false;
	/** Plain codes generated this session, shown once; the API keeps only the hash. */
	revealedCodes = $state<Record<string, string>>({});

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
			this.items = [
				{
					id: 'gal_regaleira', slug: 'k7Qm2xVb9pLr', title: 'Quinta da Regaleira', message: 'Beatriz & Nuno — thank you for letting us be there. Choose up to 60 favourites for the album.',
					status: 'PUBLISHED', hasAccessCode: true, allowDownload: false, expiresAt: daysFromNow(54), clientId: 'cli_beatriz', serviceId: 'svc_weddings',
					photos: [{ photoId: 'ph_401', selected: true }, { photoId: 'ph_403', selected: false }, { photoId: 'ph_404', selected: false }, { photoId: 'ph_405', selected: true }, { photoId: 'ph_406', selected: false }, { photoId: 'ph_408', selected: true }, { photoId: 'ph_409', selected: false }, { photoId: 'ph_410', selected: false }, { photoId: 'ph_411', selected: false }, { photoId: 'ph_413', selected: true }, { photoId: 'ph_414', selected: true }, { photoId: 'ph_415', selected: true }, { photoId: 'ph_416', selected: true }],
					selectionLimit: 60, selectionSubmittedAt: minutesAgo(12), views: 38, lastViewedAt: minutesAgo(12), createdAt: daysAgo(7), updatedAt: minutesAgo(12)
				},
				{
					id: 'gal_sal_spring', slug: 'Hs3vT8nWq1Ze', title: 'Spring menu', message: 'All photographs are cleared for web and print.',
					status: 'PUBLISHED', hasAccessCode: false, allowDownload: true, expiresAt: daysFromNow(20), clientId: 'cli_sal', serviceId: 'svc_commercial',
					photos: [{ photoId: 'ph_407', selected: false }, { photoId: 'ph_409', selected: false }, { photoId: 'ph_401', selected: false }], selectionLimit: null, selectionSubmittedAt: null, views: 12, lastViewedAt: daysAgo(3, 12), createdAt: daysAgo(45), updatedAt: daysAgo(40)
				},
				{
					id: 'gal_garagem47', slug: 'Pz4rY6cKm0Na', title: 'Classic collection', message: null,
					status: 'ARCHIVED', hasAccessCode: true, allowDownload: true, expiresAt: daysAgo(10), clientId: 'cli_lucas', serviceId: 'svc_automotive',
					photos: [{ photoId: 'ph_412', selected: false }, { photoId: 'ph_402', selected: false }], selectionLimit: null, selectionSubmittedAt: daysAgo(50), views: 21, lastViewedAt: daysAgo(48), createdAt: daysAgo(58), updatedAt: daysAgo(10)
				},
				{
					id: 'gal_lumen', slug: 'Wb8nE2sXq5Tj', title: 'Hotel Lumen — scouting', message: null,
					status: 'DRAFT', hasAccessCode: false, allowDownload: false, expiresAt: null, clientId: 'cli_lumen', serviceId: 'svc_commercial',
					photos: [{ photoId: 'ph_407', selected: false }, { photoId: 'ph_409', selected: false }], selectionLimit: null, selectionSubmittedAt: null, views: 0, lastViewedAt: null, createdAt: daysAgo(2), updatedAt: daysAgo(2)
				}
			];
			this.#loaded = true;
			return;
		}

		this.#loading = true;
		try {
			const response = await api<{ items: Gallery[]; page: number; pageSize: number; total: number }>(
				'/v1/galleries?page=1&pageSize=100'
			);
			this.items = response.items;
			this.#loaded = true;
		} finally {
			this.#loading = false;
		}
	}

	get(id: string | null | undefined): Gallery | undefined {
		return id ? this.items.find((g) => g.id === id) : undefined;
	}

	shareUrl(gallery: Pick<Gallery, 'slug'>): string {
		return new URL(`/g/${gallery.slug}`, metadata.metadataBase).toString();
	}

	containing(photoId: string): Gallery[] {
		return this.items.filter((g) => g.photos.some((p) => p.photoId === photoId));
	}

	forClient(clientId: string): Gallery[] {
		return this.items.filter((g) => g.clientId === clientId);
	}

	selectedCount(gallery: Gallery): number {
		return gallery.photos.filter((p) => p.selected).length;
	}

	/** Returns the plain access code once; the API only keeps the hash. */
	create(
		input: Pick<Gallery, 'title' | 'message' | 'clientId' | 'serviceId' | 'allowDownload' | 'expiresAt'> & {
			withCode: boolean;
		}
	): { gallery: Gallery; code: string | null } {
		const now = new Date().toISOString();
		const { withCode, ...fields } = input;
		const gallery: Gallery = {
			...fields,
			id: mockId('gal'),
			slug: random(12),
			status: 'DRAFT',
			hasAccessCode: withCode,
			photos: [],
			selectionLimit: null,
			selectionSubmittedAt: null,
			views: 0,
			lastViewedAt: null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		this.items.unshift(gallery);
		const code = withCode ? generateAccessCode() : null;
		if (code) this.revealedCodes[gallery.id] = code;
		return { gallery, code };
	}

	async createRemote(
		input: Pick<Gallery, 'title' | 'message' | 'clientId' | 'serviceId' | 'allowDownload' | 'expiresAt'> & {
			withCode: boolean;
		}
	): Promise<{ gallery: Gallery; code: string | null }> {
		if (!API_URL) {
			return this.create(input);
		}
		const { gallery, code } = await api<{ gallery: Gallery; code: string | null }>('/v1/galleries', {
			method: 'POST',
			body: JSON.stringify(input)
		});
		this.items.unshift(gallery);
		if (code) this.revealedCodes[gallery.id] = code;
		return { gallery, code };
	}

	update(id: string, patch: Partial<Omit<Gallery, 'id'>>) {
		const gallery = this.get(id);
		if (gallery) Object.assign(gallery, patch, { updatedAt: new Date().toISOString() });
	}

	async updateRemote(id: string, patch: Partial<Omit<Gallery, 'id'>>): Promise<void> {
		if (!API_URL) {
			this.update(id, patch);
			return;
		}
		await api(`/v1/galleries/${id}`, {
			method: 'PATCH',
			body: JSON.stringify(patch)
		});
		this.update(id, patch);
	}

	addPhotos(id: string, photoIds: string[]) {
		const gallery = this.get(id);
		if (!gallery) return;
		const existing = new Set(gallery.photos.map((p) => p.photoId));
		this.update(id, {
			photos: [...gallery.photos, ...photoIds.filter((p) => !existing.has(p)).map((photoId) => ({ photoId, selected: false }))]
		});
	}

	async addPhotosRemote(id: string, photoIds: string[]): Promise<void> {
		if (!API_URL) {
			this.addPhotos(id, photoIds);
			return;
		}
		await api(`/v1/galleries/${id}/photos`, {
			method: 'PUT',
			body: JSON.stringify({ photoIds })
		});
		this.addPhotos(id, photoIds);
	}

	removePhoto(id: string, photoId: string) {
		const gallery = this.get(id);
		if (gallery) this.update(id, { photos: gallery.photos.filter((p) => p.photoId !== photoId) });
	}

	async removePhotoRemote(id: string, photoId: string): Promise<void> {
		if (!API_URL) {
			this.removePhoto(id, photoId);
			return;
		}
		await api(`/v1/galleries/${id}/photos/${photoId}`, { method: 'DELETE' });
		this.removePhoto(id, photoId);
	}

	/** Invalidates the old link immediately. */
	rotateLink(id: string) {
		this.update(id, { slug: random(12) });
	}

	async rotateLinkRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.rotateLink(id);
			return;
		}
		await api(`/v1/galleries/${id}/rotate-link`, { method: 'POST' });
		this.rotateLink(id);
	}

	/** Sets a fresh code (returned once) or removes it for link-only access. */
	setAccessCode(id: string, enabled: boolean): string | null {
		this.update(id, { hasAccessCode: enabled });
		const code = enabled ? generateAccessCode() : null;
		if (code) this.revealedCodes[id] = code;
		else delete this.revealedCodes[id];
		return code;
	}

	async setAccessCodeRemote(id: string, enabled: boolean): Promise<string | null> {
		if (!API_URL) {
			return this.setAccessCode(id, enabled);
		}
		const code = await api<{ code: string | null }>(`/v1/galleries/${id}/access-code`, {
			method: 'POST',
			body: JSON.stringify({ enabled })
		});
		this.update(id, { hasAccessCode: enabled });
		if (code) this.revealedCodes[id] = code;
		else delete this.revealedCodes[id];
		return code;
	}

	remove(id: string) {
		this.items = this.items.filter((g) => g.id !== id);
	}

	async removeRemote(id: string): Promise<void> {
		if (!API_URL) {
			this.remove(id);
			return;
		}
		await api(`/v1/galleries/${id}`, { method: 'DELETE' });
		this.remove(id);
	}

	async load(): Promise<void> {
		if (this.#loaded || this.#loading) return;
		if (!API_URL) {
			// Mock mode
			this.items = [
				{
					id: 'gal_regaleira', slug: 'k7Qm2xVb9pLr', title: 'Quinta da Regaleira', message: 'Beatriz & Nuno — thank you for letting us be there. Choose up to 60 favourites for the album.',
					status: 'PUBLISHED', hasAccessCode: true, allowDownload: false, expiresAt: daysFromNow(54), clientId: 'cli_beatriz', serviceId: 'svc_weddings',
					photos: [{ photoId: 'ph_401', selected: true }, { photoId: 'ph_403', selected: false }, { photoId: 'ph_404', selected: false }, { photoId: 'ph_405', selected: true }, { photoId: 'ph_406', selected: false }, { photoId: 'ph_408', selected: true }, { photoId: 'ph_409', selected: false }, { photoId: 'ph_410', selected: false }, { photoId: 'ph_411', selected: false }, { photoId: 'ph_413', selected: true }, { photoId: 'ph_414', selected: true }, { photoId: 'ph_415', selected: true }, { photoId: 'ph_416', selected: true }],
					selectionLimit: 60, selectionSubmittedAt: minutesAgo(12), views: 38, lastViewedAt: minutesAgo(12), createdAt: daysAgo(7), updatedAt: minutesAgo(12)
				},
				{
					id: 'gal_sal_spring', slug: 'Hs3vT8nWq1Ze', title: 'Spring menu', message: 'All photographs are cleared for web and print.',
					status: 'PUBLISHED', hasAccessCode: false, allowDownload: true, expiresAt: daysFromNow(20), clientId: 'cli_sal', serviceId: 'svc_commercial',
					photos: [{ photoId: 'ph_407', selected: false }, { photoId: 'ph_409', selected: false }, { photoId: 'ph_401', selected: false }], selectionLimit: null, selectionSubmittedAt: null, views: 12, lastViewedAt: daysAgo(3, 12), createdAt: daysAgo(45), updatedAt: daysAgo(40)
				},
				{
					id: 'gal_garagem47', slug: 'Pz4rY6cKm0Na', title: 'Classic collection', message: null,
					status: 'ARCHIVED', hasAccessCode: true, allowDownload: true, expiresAt: daysAgo(10), clientId: 'cli_lucas', serviceId: 'svc_automotive',
					photos: [{ photoId: 'ph_412', selected: false }, { photoId: 'ph_402', selected: false }], selectionLimit: null, selectionSubmittedAt: daysAgo(50), views: 21, lastViewedAt: daysAgo(48), createdAt: daysAgo(58), updatedAt: daysAgo(10)
				},
				{
					id: 'gal_lumen', slug: 'Wb8nE2sXq5Tj', title: 'Hotel Lumen — scouting', message: null,
					status: 'DRAFT', hasAccessCode: false, allowDownload: false, expiresAt: null, clientId: 'cli_lumen', serviceId: 'svc_commercial',
					photos: [{ photoId: 'ph_407', selected: false }, { photoId: 'ph_409', selected: false }], selectionLimit: null, selectionSubmittedAt: null, views: 0, lastViewedAt: null, createdAt: daysAgo(2), updatedAt: daysAgo(2)
				}
			];
			this.#loaded = true;
			return;
		}

		this.#loading = true;
		try {
			const response = await api<{ items: Gallery[]; page: number; pageSize: number; total: number }>(
				'/v1/galleries?page=1&pageSize=100'
			);
			this.items = response.items;
			this.#loaded = true;
		} finally {
			this.#loading = false;
		}
	}
}

export const galleries = new GalleryStore();