import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()]
	],

	build: {
		sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false
	}
});
