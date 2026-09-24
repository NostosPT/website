// The studio dashboard is a client-rendered app. It talks to the Nostos API
// with the staff session cookie (credentials: 'include'), needs no SEO, and
// its module-level stores are per-browser, so nothing leaks between requests.
export const ssr = false;
export const prerender = false;
