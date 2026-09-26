/**
 * A private delivery gallery for a client. Mirrors `Gallery` in the API schema:
 * shared by an unguessable slug plus an optional access code (stored hashed,
 * so the dashboard only knows whether one is set). `photos` is the
 * `GalleryPhoto` join; `selected` holds the client's favourites.
 */
export type GalleryStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface GalleryPhoto {
	photoId: string;
	selected: boolean;
}

export interface Gallery {
	id: string;
	slug: string;
	title: string;
	message: string | null;
	status: GalleryStatus;
	hasAccessCode: boolean;
	allowDownload: boolean;
	expiresAt: string | null;
	clientId: string;
	serviceId: string | null;
	photos: GalleryPhoto[];
	createdAt: string;
	updatedAt: string;

	// --- proposed additions (not in the API yet) ---------------------------
	/** Cap on favourites, e.g. the number included in an album. */
	selectionLimit: number | null;
	selectionSubmittedAt: string | null;
	views: number;
	lastViewedAt: string | null;
}
