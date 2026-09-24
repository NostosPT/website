export type Visibility = 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
export type Availability = 'NOT_FOR_SALE' | 'AVAILABLE' | 'SOLD_OUT';

/**
 * An archive photograph, as the API returns it (`photoWithUrlsResponse`):
 * the stored S3 keys plus short-lived presigned URLs for each rendition.
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
	category: string | null;
	tags: string[];
	visibility: Visibility;
	availability: Availability;
	priceCents: number | null;
	currency: string;
	watermarked: boolean;
	photographerId: string | null;
	createdAt: string;
	updatedAt: string;
	urls: { display: string | null; thumbnail: string | null; original: string | null };
}

export type PhotoPatch = Partial<
	Pick<
		Photo,
		| 'title'
		| 'description'
		| 'takenAt'
		| 'location'
		| 'category'
		| 'tags'
		| 'visibility'
		| 'availability'
		| 'priceCents'
		| 'currency'
		| 'watermarked'
		| 'photographerId'
	>
>;
