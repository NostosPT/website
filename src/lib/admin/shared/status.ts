import type { Tone } from '@nostospt/ui';

/** A status rendered as a kit Badge. Every feature maps its enums through this. */
export type StatusStyle = { label: string; tone: Tone };

export type StatusMap<K extends string> = Record<K, StatusStyle>;

export function statusOf<K extends string>(map: StatusMap<K>, key: K): StatusStyle {
	return map[key] ?? { label: key, tone: 'neutral' };
}

export const visibilityStatus: StatusMap<'PUBLIC' | 'UNLISTED' | 'PRIVATE'> = {
	PUBLIC: { label: 'Public', tone: 'success' },
	UNLISTED: { label: 'Unlisted', tone: 'info' },
	PRIVATE: { label: 'Private', tone: 'neutral' }
};

export const visibilityOptions = [
	{ value: 'PUBLIC', label: 'Public' },
	{ value: 'UNLISTED', label: 'Unlisted' },
	{ value: 'PRIVATE', label: 'Private' }
];

export const statusOptions = [
	{ value: 'DRAFT', label: 'Draft' },
	{ value: 'PUBLISHED', label: 'Published' },
	{ value: 'ARCHIVED', label: 'Archived' }
];

export const albumStatusStatus: StatusMap<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'> = {
	DRAFT: { label: 'Draft', tone: 'neutral' as const },
	PUBLISHED: { label: 'Published', tone: 'success' as const },
	ARCHIVED: { label: 'Archived', tone: 'warning' as const }
};
