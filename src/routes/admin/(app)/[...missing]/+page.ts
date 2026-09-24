import { error } from '@sveltejs/kit';

// Unknown /admin paths render inside the dashboard shell rather than the public site.
export function load() {
	error(404, 'Not found');
}
