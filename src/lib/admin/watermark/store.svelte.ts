import { mockId } from '$lib/admin/shared/mock-dates';
import type { WatermarkPreset, WatermarkRules } from './types';

export const positions = [
	'top-left',
	'top',
	'top-right',
	'left',
	'center',
	'right',
	'bottom-left',
	'bottom',
	'bottom-right'
] as const;

const seed: WatermarkPreset[] = [
	{ id: 'wm_archive', name: 'Archive — subtle', kind: 'text', lines: ['NOSTOS', '{number}'], font: 'sans', size: 1.6, opacity: 55, tone: 'light', position: 'bottom-right', margin: 3, tiled: false, imageUrl: null },
	{ id: 'wm_proof', name: 'Gallery proof', kind: 'text', lines: ['NOSTOS · PROOF'], font: 'sans', size: 2.2, opacity: 18, tone: 'light', position: 'center', margin: 0, tiled: true, imageUrl: null },
	{ id: 'wm_editorial', name: 'Editorial signature', kind: 'text', lines: ['Nostos'], font: 'serif', size: 3, opacity: 70, tone: 'light', position: 'bottom-left', margin: 4, tiled: false, imageUrl: null }
];

/** Watermark presets and rules. Needs API endpoints (/watermarks) plus the rendition worker. */
class WatermarkStore {
	presets = $state<WatermarkPreset[]>(seed);
	rules = $state<WatermarkRules>({
		archivePreviews: 'wm_archive',
		galleryProofs: 'wm_proof',
		galleryDownloads: null
	});

	options = $derived(this.presets.map((p) => ({ value: p.id, label: p.name })));

	get(id: string | null | undefined): WatermarkPreset | undefined {
		return id ? this.presets.find((p) => p.id === id) : undefined;
	}

	create(): WatermarkPreset {
		const preset: WatermarkPreset = { ...seed[0], id: mockId('wm'), name: 'New preset' };
		this.presets.push(preset);
		return preset;
	}

	save(preset: WatermarkPreset) {
		const index = this.presets.findIndex((p) => p.id === preset.id);
		if (index >= 0) this.presets[index] = preset;
	}

	remove(id: string) {
		this.presets = this.presets.filter((p) => p.id !== id);
		for (const key of Object.keys(this.rules) as (keyof WatermarkRules)[]) {
			if (this.rules[key] === id) this.rules[key] = null;
		}
	}
}

export const watermarks = new WatermarkStore();

export function renderLine(line: string, values: { number?: number; photographer?: string }): string {
	return line
		.replaceAll('{number}', values.number != null ? `Nº ${values.number}` : 'Nº 482')
		.replaceAll('{year}', String(new Date().getFullYear()))
		.replaceAll('{photographer}', values.photographer ?? 'Nostos');
}
