/** A Field Atlas scouting location. Mirrors `AtlasLocation` in the API schema. */
export type AtlasLocationStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AtlasGeometryKind = 'POINT' | 'AREA';

export interface AtlasLocation {
	id: string;
	slug: string;
	name: string;
	description: string | null;
	country: string | null;
	region: string | null;
	city: string | null;
	geometryKind: AtlasGeometryKind;
	latitude: number | null;
	longitude: number | null;
	geoJson: unknown;
	whyInteresting: string | null;
	subjects: string | null;
	accessNotes: string | null;
	safetyNotes: string | null;
	status: AtlasLocationStatus;
	coverPhotoId: string | null;
	authorId: string | null;
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface AtlasLocationCategory {
	categoryId: string;
	slug: string;
	name: string;
}

export interface AtlasLocationPhoto {
	photoId: string;
	caption: string | null;
	position: number;
}

export interface AtlasLocationDetail extends AtlasLocation {
	categories: AtlasLocationCategory[];
	photos: AtlasLocationPhoto[];
}

export interface AtlasLocationList {
	items: AtlasLocation[];
	page: number;
	pageSize: number;
	total: number;
}

export interface AtlasLocationFilters {
	status?: AtlasLocationStatus;
	country?: string;
	category?: string;
	q?: string;
}
