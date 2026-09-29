import { api } from '$lib/admin/api/client';

export interface AtlasCategory {
	id: string;
	slug: string;
	name: string;
}

/** Minimal photo-category directory for the Atlas forms (no full store yet). */
class AtlasCategoryDirectory {
	items = $state<AtlasCategory[]>([]);
	#loaded = false;
	#loading = false;

	get loaded() {
		return this.#loaded;
	}

	get loading() {
		return this.#loading;
	}

	options = $derived(this.items.map((c) => ({ value: c.slug, label: c.name })));

	async load(): Promise<void> {
		if (this.#loaded || this.#loading) return;
		this.#loading = true;
		try {
			const response = await api<{ items: AtlasCategory[] }>(`/v1/categories?page=1&pageSize=100`);
			this.items = response.items;
			this.#loaded = true;
		} catch {
			// Offline backend: empty directory (forms degrade to slug-less state).
			this.#loaded = true;
		} finally {
			this.#loading = false;
		}
	}
}

export const atlasCategories = new AtlasCategoryDirectory();
