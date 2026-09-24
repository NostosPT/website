import type { Visibility } from '$lib/admin/photos/types';

/**
 * A public, curated collection of archive photographs. Mirrors `Album` in the
 * API schema; `photoIds` is the `AlbumPhoto` join ordered by `position`.
 */
export interface Album {
	id: string;
	slug: string;
	title: string;
	description: string | null;
	coverPhotoId: string | null;
	visibility: Visibility;
	publishedAt: string | null;
	photoIds: string[];
	createdAt: string;
	updatedAt: string;
}
