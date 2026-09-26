import type { ProviderId } from '$lib/admin/invoices/types';

export const invoicingProviders: { id: ProviderId; name: string; url: string }[] = [
	{ id: 'invoicexpress', name: 'InvoiceXpress', url: 'https://www.invoicexpress.com' },
	{ id: 'moloni', name: 'Moloni', url: 'https://www.moloni.pt' },
	{ id: 'vendus', name: 'Vendus', url: 'https://www.vendus.pt' },
	{ id: 'toconline', name: 'TOConline', url: 'https://www.toconline.pt' }
];

export type IntegrationState = 'connected' | 'sandbox' | 'pending' | 'disconnected';

/**
 * Studio-wide settings. Secrets (API keys) never live here: they are entered
 * once, stored server-side by the API, and only their status comes back.
 */
class SettingsStore {
	studio = $state({
		name: 'Nostos',
		legalName: 'Nostos Photography Studio',
		taxId: '',
		address: 'Lisboa, Portugal',
		email: 'hello@nostos.studio',
		phone: '',
		website: 'https://nostos.studio',
		currency: 'EUR',
		timezone: 'Europe/Lisbon'
	});

	invoicing = $state<{ provider: ProviderId | null; state: IntegrationState; defaultDueDays: number; defaultVat: number }>({
		provider: 'invoicexpress',
		state: 'sandbox',
		defaultDueDays: 14,
		defaultVat: 23
	});

	mail = $state({
		provider: 'Resend',
		state: 'sandbox' as IntegrationState,
		domain: 'nostos.studio',
		domainVerified: false,
		fromName: 'Nostos',
		fromAddress: 'hello@nostos.studio',
		inboundAddress: 'hello@nostos.studio',
		signature: 'Nostos\nArchive & studio · Lisbon\nnostos.studio'
	});

	storage = $state({ provider: 'S3 (SeaweedFS)', bucket: 'nostos-originals', state: 'connected' as IntegrationState });

	notifications = $state({
		newRequest: true,
		gallerySelection: true,
		invoicePaid: true,
		inboundMail: false,
		weeklyDigest: true
	});

	providerName = $derived(invoicingProviders.find((p) => p.id === this.invoicing.provider)?.name ?? null);
}

export const settings = new SettingsStore();
