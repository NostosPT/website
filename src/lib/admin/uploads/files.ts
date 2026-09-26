/** A file picked or dropped, with its path inside any dropped folder. */
export type UploadCandidate = { file: File; path: string };

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RAW_EXTENSIONS = ['.cr2', '.cr3', '.nef', '.arw', '.dng', '.raf', '.orf', '.rw2'];

/** For the file input `accept` attribute. */
export const ACCEPT = [...IMAGE_TYPES, ...RAW_EXTENSIONS].join(',');

export const ACCEPT_LABEL = 'JPEG, PNG, WebP and camera RAW';

const IGNORED = new Set(['.DS_Store', 'Thumbs.db', 'desktop.ini']);

export function isAccepted(file: File): boolean {
	if (IGNORED.has(file.name) || file.name.startsWith('._')) return false;
	const name = file.name.toLowerCase();
	return IMAGE_TYPES.includes(file.type) || RAW_EXTENSIONS.some((ext) => name.endsWith(ext));
}

/** Browsers can decode these into a preview; RAW files get an icon instead. */
export function isPreviewable(file: File): boolean {
	return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

/** "Wedding/Ceremony/IMG_01.jpg" → "Wedding/Ceremony" (empty for loose files). */
export function folderOf(path: string): string {
	const index = path.lastIndexOf('/');
	return index === -1 ? '' : path.slice(0, index);
}

/** Files from an <input>, keeping folder paths when the input picked a directory. */
export function fromFileList(list: Iterable<File>): UploadCandidate[] {
	return Array.from(list, (file) => ({ file, path: file.webkitRelativePath || file.name }));
}

/**
 * True when a drop contains at least one folder. Must be called synchronously
 * inside the drop event: the browser empties `items` once the event returns.
 */
export function dropHasFolders(transfer: DataTransfer): boolean {
	return Array.from(transfer.items).some((item) => item.webkitGetAsEntry()?.isDirectory);
}

/**
 * Walks every dropped file and folder recursively. The entries are taken
 * synchronously; only the directory reads are asynchronous.
 */
export async function fromDrop(transfer: DataTransfer): Promise<UploadCandidate[]> {
	const entries = Array.from(transfer.items)
		.map((item) => item.webkitGetAsEntry())
		.filter((entry): entry is FileSystemEntry => entry !== null);
	const nested = await Promise.all(entries.map((entry) => walk(entry)));
	return nested.flat();
}

async function walk(entry: FileSystemEntry): Promise<UploadCandidate[]> {
	if (entry.isFile) {
		const file = await new Promise<File>((resolve, reject) =>
			(entry as FileSystemFileEntry).file(resolve, reject)
		);
		return [{ file, path: entry.fullPath.replace(/^\//, '') }];
	}
	const reader = (entry as FileSystemDirectoryEntry).createReader();
	const children: FileSystemEntry[] = [];
	// readEntries returns batches (about 100 in Chrome) until it returns none.
	for (;;) {
		const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
			reader.readEntries(resolve, reject)
		);
		if (batch.length === 0) break;
		children.push(...batch);
	}
	const nested = await Promise.all(children.map((child) => walk(child)));
	return nested.flat();
}
