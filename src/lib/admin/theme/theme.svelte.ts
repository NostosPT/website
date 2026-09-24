import { browser } from '$app/environment';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/** Keep in sync with the pre-paint script in src/app.html. */
export const THEME_STORAGE_KEY = 'nostos:admin-theme';

export const themeModes: { value: ThemeMode; label: string; icon: string }[] = [
	{ value: 'light', label: 'Light', icon: 'sun' },
	{ value: 'dark', label: 'Dark', icon: 'moon' },
	{ value: 'system', label: 'System', icon: 'monitor' }
];

function readStoredMode(): ThemeMode {
	if (!browser) return 'system';
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);
		return stored === 'light' || stored === 'dark' ? stored : 'system';
	} catch {
		return 'system';
	}
}

const darkQuery = () => matchMedia('(prefers-color-scheme: dark)');

class ThemeState {
	mode = $state<ThemeMode>(readStoredMode());
	#systemDark = $state(browser && darkQuery().matches);

	resolved: ResolvedTheme = $derived(
		this.mode === 'system' ? (this.#systemDark ? 'dark' : 'light') : this.mode
	);

	set(mode: ThemeMode) {
		this.mode = mode;
		try {
			if (mode === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
			else localStorage.setItem(THEME_STORAGE_KEY, mode);
		} catch {
			// Private mode or blocked storage: the choice lasts for this visit.
		}
	}

	toggle() {
		this.set(this.resolved === 'dark' ? 'light' : 'dark');
	}

	/** Follows OS changes while mode is "system". Call from an effect; returns cleanup. */
	watchSystem() {
		const query = darkQuery();
		const onChange = (event: MediaQueryListEvent) => (this.#systemDark = event.matches);
		query.addEventListener('change', onChange);
		return () => query.removeEventListener('change', onChange);
	}
}

export const theme = new ThemeState();
