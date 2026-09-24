/**
 * A watermark specification (CONTENT.md › Watermark: subtle and consistent).
 *
 * The dashboard only previews it with CSS. The real renditions come from the
 * worker the API README lists as not built yet (e.g. `sharp`), which should read
 * this same spec so the preview and the output agree. Originals are never
 * watermarked, only the display and gallery renditions.
 */
export type WatermarkPosition =
	| 'top-left'
	| 'top'
	| 'top-right'
	| 'left'
	| 'center'
	| 'right'
	| 'bottom-left'
	| 'bottom'
	| 'bottom-right';

export interface WatermarkPreset {
	id: string;
	name: string;
	kind: 'text' | 'image';
	/** Text lines. Placeholders: {number} → "Nº 482", {year}, {photographer}. */
	lines: string[];
	font: 'sans' | 'serif';
	/** Text height as a percentage of the image width. */
	size: number;
	/** 0–100. */
	opacity: number;
	tone: 'light' | 'dark';
	position: WatermarkPosition;
	/** Inset from the edges, as a percentage of the image width. */
	margin: number;
	/** Repeat diagonally across the whole frame (proofing). */
	tiled: boolean;
	/** Logo for `kind: 'image'`, uploaded to storage. */
	imageUrl: string | null;
}

/** Which preset each rendition uses; null means no watermark. */
export interface WatermarkRules {
	archivePreviews: string | null;
	galleryProofs: string | null;
	galleryDownloads: string | null;
}
