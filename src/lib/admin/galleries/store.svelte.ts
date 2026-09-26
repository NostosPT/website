import { metadata } from '$lib/metadata';
import { daysAgo, daysFromNow, minutesAgo, mockId } from '$lib/admin/shared/mock-dates';
import type { StatusMap } from '$lib/admin/shared/status';
import type { Gallery, GalleryStatus } from './types';

export const galleryStatus: StatusMap<GalleryStatus> = {
	DRAFT: { label: 'Draft', tone: 'neutral' },
	PUBLISHED: { label: 'Shared', tone: 'success' },
	ARCHIVED: { label: 'Archived', tone: 'warning' }
};

const all = (ids: number[], selected: number[] = []) =>
	ids.map((n) => ({ photoId: `ph_${n}`, selected: selected.includes(n) }));

const seed: Gallery[] = [
	{
		id: 'gal_regaleira', slug: 'k7Qm2xVb9pLr', title: 'Quinta da Regaleira', message: 'Beatriz & Nuno — thank you for letting us be there. Choose up to 60 favourites for the album.',
		status: 'PUBLISHED', hasAccessCode: true, allowDownload: false, expiresAt: daysFromNow(54), clientId: 'cli_beatriz', serviceId: 'svc_weddings',
		photos: all([401, 403, 404, 405, 406, 408, 409, 410, 411, 413, 414, 415, 416], [401, 405, 408, 413, 414, 415, 416]),
		selectionLimit: 60, selectionSubmittedAt: minutesAgo(12), views: 38, lastViewedAt: minutesAgo(12), createdAt: daysAgo(7), updatedAt: minutesAgo(12)
	},
	{
		id: 'gal_sal_spring', slug: 'Hs3vT8nWq1Ze', title: 'Spring menu', message: 'All photographs are cleared for web and print.',
		status: 'PUBLISHED', hasAccessCode: false, allowDownload: true, expiresAt: daysFromNow(20), clientId: 'cli_sal', serviceId: 'svc_commercial',
		photos: all([407, 409, 401]), selectionLimit: null, selectionSubmittedAt: null, views: 12, lastViewedAt: daysAgo(3, 12), createdAt: daysAgo(45), updatedAt: daysAgo(40)
	},
	{
		id: 'gal_garagem47', slug: 'Pz4rY6cKm0Na', title: 'Classic collection', message: null,
		status: 'ARCHIVED', hasAccessCode: true, allowDownload: true, expiresAt: daysAgo(10), clientId: 'cli_lucas', serviceId: 'svc_automotive',
		photos: all([412, 402], [412, 402]), selectionLimit: null, selectionSubmittedAt: daysAgo(50), views: 21, lastViewedAt: daysAgo(48), createdAt: daysAgo(58), updatedAt: daysAgo(10)
	},
	{
		id: 'gal_lumen', slug: 'Wb8nE2sXq5Tj', title: 'Hotel Lumen — scouting', message: null,
		status: 'DRAFT', hasAccessCode: false, allowDownload: false, expiresAt: null, clientId: 'cli_lumen', serviceId: 'svc_commercial',
		photos: all([407, 409]), selectionLimit: null, selectionSubmittedAt: null, views: 0, lastViewedAt: null, createdAt: daysAgo(2), updatedAt: daysAgo(2)
	}
];

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const random = (length: number, alphabet = ALPHABET) =>
	Array.from(crypto.getRandomValues(new Uint32Array(length)), (n) => alphabet[n % alphabet.length]).join('');

/** Readable access codes without look-alike characters, e.g. "KR4-9WX". */
export const generateAccessCode = () => `${random(3, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789')}-${random(3, 'ABCDEFGHJKMNPQRSTUVWXYZ23456789')}`;

/**
 * Client galleries. API: GET/POST /galleries, GET/PATCH/DELETE /galleries/:id,
 * PUT /galleries/:id/photos, POST /galleries/:id/rotate-link.
 */
class GalleryStore {
	items = $state<Gallery[]>(seed);
	/** Plain codes generated this session, shown once; the API keeps only the hash. */
	revealedCodes = $state<Record<string, string>>({});

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

	/** Returns the plain access code once; the API only keeps its hash. */
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
			createdAt: now,
			updatedAt: now
		};
		this.items.unshift(gallery);
		const code = withCode ? generateAccessCode() : null;
		if (code) this.revealedCodes[gallery.id] = code;
		return { gallery, code };
	}

	update(id: string, patch: Partial<Omit<Gallery, 'id'>>) {
		const gallery = this.get(id);
		if (gallery) Object.assign(gallery, patch, { updatedAt: new Date().toISOString() });
	}

	addPhotos(id: string, photoIds: string[]) {
		const gallery = this.get(id);
		if (!gallery) return;
		const existing = new Set(gallery.photos.map((p) => p.photoId));
		this.update(id, {
			photos: [...gallery.photos, ...photoIds.filter((p) => !existing.has(p)).map((photoId) => ({ photoId, selected: false }))]
		});
	}

	removePhoto(id: string, photoId: string) {
		const gallery = this.get(id);
		if (gallery) this.update(id, { photos: gallery.photos.filter((p) => p.photoId !== photoId) });
	}

	/** Invalidates the old link immediately. */
	rotateLink(id: string) {
		this.update(id, { slug: random(12) });
	}

	/** Sets a fresh code (returned once) or removes it for link-only access. */
	setAccessCode(id: string, enabled: boolean): string | null {
		this.update(id, { hasAccessCode: enabled });
		const code = enabled ? generateAccessCode() : null;
		if (code) this.revealedCodes[id] = code;
		else delete this.revealedCodes[id];
		return code;
	}

	remove(id: string) {
		this.items = this.items.filter((g) => g.id !== id);
	}
}

export const galleries = new GalleryStore();
