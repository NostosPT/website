import { api, API_URL } from '$lib/admin/api/client';
import { photos } from '$lib/admin/photos/store.svelte';
import type { Photo, PhotoPatch } from '$lib/admin/photos/types';

export type UploadMeta = PhotoPatch & { width: number | null; height: number | null };

/**
 * Moves one file into the archive: store the original, then register it as a
 * photo. Both implementations end with the photo in the `photos` store.
 */
export interface UploadTransport {
	put(file: File, onProgress: (fraction: number) => void, signal: AbortSignal): Promise<{ key: string }>;
	register(key: string, file: File, meta: UploadMeta): Promise<Photo>;
}

function abortError() {
	return new DOMException('Upload cancelled', 'AbortError');
}

/** Simulates transfer time from file size; registers into the mock store. */
export const mockTransport: UploadTransport = {
	put(file, onProgress, signal) {
		return new Promise((resolve, reject) => {
			const bytesPerTick = 1.2 * 1024 * 1024 * (0.6 + Math.random() * 0.8);
			let sent = 0;
			const timer = setInterval(() => {
				sent = Math.min(file.size, sent + bytesPerTick);
				onProgress(file.size ? sent / file.size : 1);
				if (sent >= file.size) {
					clearInterval(timer);
					resolve({ key: `originals/${crypto.randomUUID()}-${file.name}` });
				}
			}, 120);
			signal.addEventListener('abort', () => {
				clearInterval(timer);
				reject(abortError());
			});
		});
	},
	async register(key, file, meta) {
		// Mock only: the object URL lives until the page reloads.
		const url = URL.createObjectURL(file);
		return photos.add({ ...meta, originalKey: key });
	}
};

/**
 * The API's documented flow (README › Images and S3):
 * 1. POST /photos/uploads { contentType } → { key, uploadUrl }
 * 2. PUT the file straight to S3 (XHR, for upload progress)
 * 3. POST /photos { originalKey: key, ...metadata }
 */
export const apiTransport: UploadTransport = {
	async put(file, onProgress, signal) {
		const { key, uploadUrl } = await api<{ key: string; uploadUrl: string }>('/v1/photos/uploads', {
			method: 'POST',
			body: JSON.stringify({ contentType: file.type || 'application/octet-stream' }),
			signal
		});
		await new Promise<void>((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			xhr.open('PUT', uploadUrl);
			xhr.setRequestHeader('content-type', file.type || 'application/octet-stream');
			xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
			xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Storage responded ${xhr.status}`)));
			xhr.onerror = () => reject(new Error('Network error while uploading'));
			xhr.onabort = () => reject(abortError());
			signal.addEventListener('abort', () => xhr.abort());
			xhr.send(file);
		});
		return { key };
	},
	async register(key, _file, meta) {
		const photo = await api<Photo>('/v1/photos', {
			method: 'POST',
			body: JSON.stringify({ ...meta, originalKey: key })
		});
		// The create response may omit presigned URLs until renditions exist.
		const registered: Photo = { ...photo, urls: photo.urls ?? { display: null, thumbnail: null, original: null } };
		photos.items.push(registered);
		return registered;
	}
};

export const transport: UploadTransport = API_URL ? apiTransport : mockTransport;
