/**
 * Seed data is expressed relative to "now" so the mock dashboard always looks
 * current. Remove together with the feature mock.ts files once the API is wired.
 */

const DAY = 86_400_000;

export function daysFromNow(days: number, hour = 10, minute = 0): string {
	const date = new Date(Date.now() + days * DAY);
	date.setHours(hour, minute, 0, 0);
	return date.toISOString();
}

export const daysAgo = (days: number, hour?: number, minute?: number) =>
	daysFromNow(-days, hour, minute);

export function minutesAgo(minutes: number): string {
	return new Date(Date.now() - minutes * 60_000).toISOString();
}

/** Cheap unique ids for records created in the browser before the API exists. */
export function mockId(prefix: string): string {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
