export type PhotoStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED';
export type Visibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
export type Availability = 'NOT_FOR_SALE' | 'AVAILABLE' | 'SOLD_OUT';
export type UploadStatus = 'PENDING' | 'READY' | 'FAILED';

/**
 * An archive photograph, as the API returns it.
 * The API includes S3 keys and may include presigned URLs for renditions.
 * `watermarked` is derived from album type, not stored per-photo.
 * `category` and `tags` come from M:N relations.
 */
export interface Photo {
	id: string;
	/** Public Photo ID, shown as "Nº 482". */
	number: number;
	title: string | null;
	description: string | null;
	originalKey: string;
	displayKey: string | null;
	thumbnailKey: string | null;
	width: number | null;
	height: number | null;
	takenAt: string | null;
	location: string | null;
	status: PhotoStatus;
	visibility: Visibility;
	availability: Availability;
	priceCents: number | null;
	currency: string;
	photographerId: string | null;
	uploadStatus: UploadStatus;
	createdAt: string;
	updatedAt: string;
	/** Optional presigned URLs for renditions (may be null in Phase 1). */
	urls?: { display: string | null; thumbnail: string | null; original: string | null };
	/** Category slugs from M:N relation. */
	category?: string | null;
	/** Tag slugs from M:N relation. */
	tags?: string[];
	/** Watermarking is derived from album type, not stored per-photo. */
	watermarked?: boolean;
}

export type PhotoPatch = Partial<
	Pick<
		Photo,
		| 'title'
		| 'description'
		| 'takenAt'
		| 'location'
		| 'visibility'
		| 'availability'
		| 'priceCents'
		| 'currency'
		| 'photographerId'
	>
>;