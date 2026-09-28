import type { Visibility } from '$lib/admin/photos/types';

export type AlbumType = 'WATERMARK' | 'PAID' | 'FREE';
export type AlbumStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

/**
 * A client album. Mirrors `Album` in the API schema; `photoIds` is the `AlbumPhoto`
 * join ordered by `position`. The API also includes type, status, accessCodeHash,
 * secretVersion, priceCents, packPriceCents, packSize, currency, expiresAt,
 * publishedAt, views, lastViewedAt.
 */
export interface Album {
	id: string;
	clientId: string;
	slug: string;
	title: string;
	description: string | null;
	type: AlbumType;
	status: AlbumStatus;
	accessCodeHash: string | null;
	secretVersion: number;
	priceCents: number | null;
	packPriceCents: number | null;
	packSize: number | null;
	currency: string;
	coverPhotoId: string | null;
	expiresAt: string | null;
	publishedAt: string | null;
	views: number;
	lastViewedAt: string | null;
	photoIds: string[];
	createdAt: string;
	updatedAt: string;
}

export interface AlbumDetail extends Album {
	photos: { photoId: string; position: number; isPreview: boolean }[];
}

export interface AlbumList {
	items: Album[];
	page: number;
	pageSize: number;
	total: number;
}

export interface AlbumFilters {
	clientId?: string;
	status?: AlbumStatus;
	type?: AlbumType;
	q?: string;
}