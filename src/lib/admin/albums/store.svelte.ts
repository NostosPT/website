import { daysAgo, mockId } from '$lib/admin/shared/mock-dates';
import { slugify } from '$lib/admin/shared/format';
import type { Album } from './types';

const seed: Album[] = [
	{ id: 'alb_city', slug: 'the-city-slowly', title: 'The city, slowly', description: 'Streets, arcades and the lines trams leave behind.', coverPhotoId: 'ph_414', visibility: 'PUBLIC', publishedAt: daysAgo(40), photoIds: ['ph_414', 'ph_403', 'ph_408', 'ph_410', 'ph_401', 'ph_409'], createdAt: daysAgo(90), updatedAt: daysAgo(12) },
	{ id: 'alb_night', slug: 'after-hours', title: 'After hours', description: 'The last trams and the people on them.', coverPhotoId: 'ph_416', visibility: 'PUBLIC', publishedAt: daysAgo(18), photoIds: ['ph_416', 'ph_404', 'ph_406', 'ph_411'], createdAt: daysAgo(30), updatedAt: daysAgo(18) },
	{ id: 'alb_machines', slug: 'machines', title: 'Machines', description: 'Automotive work from commissions and the street.', coverPhotoId: 'ph_412', visibility: 'UNLISTED', publishedAt: daysAgo(70), photoIds: ['ph_412', 'ph_402'], createdAt: daysAgo(100), updatedAt: daysAgo(70) },
	{ id: 'alb_quiet', slug: 'quiet-things', title: 'Quiet things', description: null, coverPhotoId: null, visibility: 'PRIVATE', publishedAt: null, photoIds: ['ph_415', 'ph_413', 'ph_407'], createdAt: daysAgo(8), updatedAt: daysAgo(2) }
];

/** Albums. API: GET/POST /albums, GET/PATCH/DELETE /albums/:id, PUT /albums/:id/photos (ordered ids). */
class AlbumStore {
	items = $state<Album[]>(seed);

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

	create(input: Pick<Album, 'title' | 'description' | 'visibility'> & { photoIds?: string[] }): Album {
		const now = new Date().toISOString();
		const album: Album = {
			id: mockId('alb'),
			slug: slugify(input.title),
			coverPhotoId: null,
			publishedAt: input.visibility === 'PUBLIC' ? now : null,
			photoIds: [],
			createdAt: now,
			updatedAt: now,
			...input
		};
		this.items.unshift(album);
		return album;
	}

	update(id: string, patch: Partial<Omit<Album, 'id'>>) {
		const album = this.get(id);
		if (!album) return;
		if (patch.visibility === 'PUBLIC' && !album.publishedAt) patch.publishedAt = new Date().toISOString();
		Object.assign(album, patch, { updatedAt: new Date().toISOString() });
	}

	addPhotos(id: string, photoIds: string[]) {
		const album = this.get(id);
		if (!album) return;
		this.update(id, { photoIds: [...album.photoIds, ...photoIds.filter((p) => !album.photoIds.includes(p))] });
	}

	removePhoto(id: string, photoId: string) {
		const album = this.get(id);
		if (!album) return;
		this.update(id, {
			photoIds: album.photoIds.filter((p) => p !== photoId),
			coverPhotoId: album.coverPhotoId === photoId ? null : album.coverPhotoId
		});
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

	remove(id: string) {
		this.items = this.items.filter((a) => a.id !== id);
	}
}

export const albums = new AlbumStore();
