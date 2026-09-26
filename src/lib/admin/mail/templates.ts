import type { MailTemplate } from './types';

/**
 * Reusable messages. `{{placeholders}}` are filled in by `fillTemplate` when a
 * feature opens the composer (e.g. a gallery's "Send to client").
 */
export const templates: MailTemplate[] = [
	{
		id: 'gallery-ready',
		name: 'Gallery ready',
		subject: 'Your photographs are ready — {{gallery}}',
		text: 'Hello {{firstName}},\n\nYour gallery is ready to view:\n{{link}}\n\nAccess code: {{code}}\n\nTake your time choosing your favourites. The gallery stays open until {{expires}}.\n\nWith care,\nNostos'
	},
	{
		id: 'quote',
		name: 'Quote',
		subject: 'Your quote from Nostos — {{reference}}',
		text: 'Hello {{firstName}},\n\nThank you for the details. Please find the quote for {{project}} attached.\n\nIt is valid for 30 days. Reply to this email to confirm, and we will hold the date.\n\nNostos'
	},
	{
		id: 'invoice',
		name: 'Invoice',
		subject: 'Invoice {{number}} from Nostos',
		text: 'Hello {{firstName}},\n\nPlease find invoice {{number}} attached, due on {{due}}.\n\nThank you,\nNostos'
	},
	{
		id: 'booking',
		name: 'Booking confirmation',
		subject: 'Confirmed: {{project}} on {{date}}',
		text: 'Hello {{firstName}},\n\nThis confirms {{project}} on {{date}} at {{location}}.\n\nWe will be in touch a few days before with the final details.\n\nNostos'
	},
	{
		id: 'follow-up',
		name: 'Follow-up',
		subject: 'How are the photographs settling in?',
		text: 'Hello {{firstName}},\n\nIt has been a little while since we delivered your photographs. We would love to hear how they are living with you, and a short review helps other people find us.\n\nIf you would like prints or an album, just reply.\n\nNostos'
	}
];

export function fillTemplate(text: string, values: Record<string, string>): string {
	return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => values[key] ?? match);
}
