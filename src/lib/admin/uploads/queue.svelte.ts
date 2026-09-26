import { albums } from '$lib/admin/albums/store.svelte';
import { galleries } from '$lib/admin/galleries/store.svelte';
import type { Visibility } from '$lib/admin/photos/types';
import { mockId } from '$lib/admin/shared/mock-dates';
import { folderOf, isAccepted, isPreviewable, type UploadCandidate } from './files';
import { transport } from './transport';

export type UploadStatus = 'queued' | 'uploading' | 'processing' | 'done' | 'failed' | 'cancelled';

/** Where a batch lands, captured when files are added so later changes don't move them. */
export interface UploadSettings {
	destination: 'archive' | 'album' | 'gallery';
	albumId: string;
	galleryId: string;
	/** Loose files go to `albumId`; each dropped folder becomes an album of its own. */
	albumPerFolder: boolean;
	visibility: Visibility;
	category: string;
	photographerId: string;
	watermarked: boolean;
}

export interface UploadItem {
	id: string;
	file: File;
	path: string;
	folder: string;
	status: UploadStatus;
	/** 0–1 */
	progress: number;
	error: string | null;
	preview: string | null;
	photoId: string | null;
	settings: UploadSettings;
}

const CONCURRENCY = 3;

async function dimensionsOf(file: File): Promise<{ width: number | null; height: number | null }> {
	if (!isPreviewable(file)) return { width: null, height: null };
	try {
		const bitmap = await createImageBitmap(file);
		const size = { width: bitmap.width, height: bitmap.height };
		bitmap.close();
		return size;
	} catch {
		return { width: null, height: null };
	}
}

class UploadQueue {
	/** Defaults for the next batch; kept here so they survive navigation. */
	settings = $state<UploadSettings>({
		destination: 'archive',
		albumId: '',
		galleryId: '',
		albumPerFolder: true,
		visibility: 'PRIVATE',
		category: '',
		photographerId: '',
		watermarked: true
	});
	items = $state<UploadItem[]>([]);
	rejected = $state<string[]>([]);
	#controllers = new Map<string, AbortController>();
	#folderAlbums = new Map<string, string>();

	active = $derived(this.items.filter((i) => i.status === 'uploading' || i.status === 'processing').length);
	pending = $derived(this.items.filter((i) => i.status === 'queued').length);
	done = $derived(this.items.filter((i) => i.status === 'done').length);
	failed = $derived(this.items.filter((i) => i.status === 'failed').length);
	totalBytes = $derived(this.items.reduce((sum, i) => (i.status === 'cancelled' ? sum : sum + i.file.size), 0));
	sentBytes = $derived(
		this.items.reduce((sum, i) => (i.status === 'cancelled' ? sum : sum + i.file.size * i.progress), 0)
	);
	busy = $derived(this.active > 0 || this.pending > 0);

	add(candidates: UploadCandidate[], settings: UploadSettings = this.settings) {
		const accepted = candidates.filter((c) => isAccepted(c.file));
		this.rejected = candidates.filter((c) => !isAccepted(c.file) && !c.file.name.startsWith('.')).map((c) => c.path);
		for (const { file, path } of accepted) {
			this.items.push({
				id: mockId('up'),
				file,
				path,
				folder: folderOf(path),
				status: 'queued',
				progress: 0,
				error: null,
				preview: isPreviewable(file) ? URL.createObjectURL(file) : null,
				photoId: null,
				settings: { ...settings }
			});
		}
		this.#pump();
		return accepted.length;
	}

	retry(id: string) {
		const item = this.items.find((i) => i.id === id);
		if (!item) return;
		Object.assign(item, { status: 'queued', progress: 0, error: null });
		this.#pump();
	}

	retryFailed() {
		for (const item of this.items) if (item.status === 'failed') this.retry(item.id);
	}

	cancel(id: string) {
		const item = this.items.find((i) => i.id === id);
		if (!item) return;
		this.#controllers.get(id)?.abort();
		if (item.status === 'queued' || item.status === 'uploading') item.status = 'cancelled';
	}

	cancelAll() {
		for (const item of this.items) this.cancel(item.id);
	}

	/** Drops finished and cancelled rows and frees their previews. */
	clearFinished() {
		const keep: UploadItem[] = [];
		for (const item of this.items) {
			if (item.status === 'done' || item.status === 'cancelled') {
				// Done items' previews may back the mock photo; only revoke cancelled ones.
				if (item.status === 'cancelled' && item.preview) URL.revokeObjectURL(item.preview);
			} else keep.push(item);
		}
		this.items = keep;
		this.rejected = [];
	}

	#pump() {
		while (this.active < CONCURRENCY) {
			const next = this.items.find((i) => i.status === 'queued');
			if (!next) return;
			void this.#run(next);
		}
	}

	async #run(item: UploadItem) {
		const controller = new AbortController();
		this.#controllers.set(item.id, controller);
		item.status = 'uploading';
		try {
			const { key } = await transport.put(item.file, (p) => (item.progress = p), controller.signal);
			item.status = 'processing';
			const { settings } = item;
			const photo = await transport.register(key, item.file, {
				...(await dimensionsOf(item.file)),
				title: item.file.name.replace(/\.[^.]+$/, ''),
				visibility: settings.visibility,
				category: settings.category || null,
				photographerId: settings.photographerId || null,
				watermarked: settings.watermarked
			});
			item.photoId = photo.id;
			this.#place(item, photo.id);
			item.progress = 1;
			item.status = 'done';
		} catch (error) {
			// cancel() may have changed the status while a step was awaiting.
			if ((item.status as UploadStatus) !== 'cancelled') {
				item.status = 'failed';
				item.error = error instanceof Error ? error.message : 'Upload failed';
			}
		} finally {
			this.#controllers.delete(item.id);
			this.#pump();
		}
	}

	#place(item: UploadItem, photoId: string) {
		const { settings } = item;
		if (settings.destination === 'gallery' && settings.galleryId) {
			galleries.addPhotos(settings.galleryId, [photoId]);
		} else if (settings.destination === 'album') {
			const albumId = settings.albumPerFolder && item.folder ? this.#albumFor(item.folder, settings) : settings.albumId;
			if (albumId) albums.addPhotos(albumId, [photoId]);
		}
	}

	/** One album per dropped folder, named after the folder's last segment. */
	#albumFor(folder: string, settings: UploadSettings): string {
		let id = this.#folderAlbums.get(folder);
		if (!id) {
			const title = folder.split('/').pop() || folder;
			id = albums.create({ title, description: null, visibility: settings.visibility }).id;
			this.#folderAlbums.set(folder, id);
		}
		return id;
	}
}

export const uploads = new UploadQueue();
