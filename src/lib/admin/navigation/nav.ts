import type { Area } from '$lib/admin/team/types';

export type NavItem = {
	label: string;
	href: string;
	icon: string;
	/** Permission area; items the current role can't view are hidden. */
	area?: Area;
	/** Match the path exactly rather than as a prefix. */
	exact?: boolean;
};

export type NavSection = { title: string | null; items: NavItem[] };

export const ADMIN_ROOT = '/admin';

export const navigation: NavSection[] = [
	{
		title: null,
		items: [
			{ label: 'Overview', href: '/admin', icon: 'bar-chart', exact: true },
			{ label: 'Email', href: '/admin/mail', icon: 'inbox', area: 'mail' }
		]
	},
	{
		title: 'WORK',
		items: [
			{ label: 'Pipeline', href: '/admin/pipeline', icon: 'board', area: 'crm' },
			{ label: 'Clients', href: '/admin/clients', icon: 'users', area: 'crm' },
			{ label: 'Services', href: '/admin/services', icon: 'diamond', area: 'studio' },
			{ label: 'Gallery', href: '/admin/galleries', icon: 'share-2', area: 'studio' },
			{ label: 'Feedback', href: '/admin/success', icon: 'heart', area: 'crm' }
		]
	},
	{
		title: 'LIBRARY',
		items: [
			{ label: 'Photos', href: '/admin/photos', icon: 'image', area: 'archive' },
			{ label: 'Albums', href: '/admin/albums', icon: 'bookmark', area: 'archive' },
			{ label: 'Uploads', href: '/admin/uploads', icon: 'upload', area: 'archive' },
			{ label: 'Watermarks', href: '/admin/watermarks', icon: 'typography', area: 'archive' }
		]
	},
	{
		title: 'FIELD',
		items: [{ label: 'Atlas', href: '/admin/atlas', icon: 'globe', area: 'field' }]
	},
	{
		title: 'BUSINESS',
		items: [
			{ label: 'Orders', href: '/admin/orders', icon: 'credit-card', area: 'finance' },
			{ label: 'Invoices', href: '/admin/invoices', icon: 'receipt', area: 'finance' }
		]
	},
	{
		title: 'SYSTEM',
		items: [{ label: 'Team', href: '/admin/team', icon: 'user-check', area: 'team' }]
	}
];

export const allNavItems = navigation.flatMap((section) => section.items);

export function isActive(item: NavItem, pathname: string): boolean {
	if (item.exact) return pathname === item.href || pathname === `${item.href}/`;
	return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Breadcrumb trail from the path: section item, then detail pages by segment. */
export function breadcrumbsFor(pathname: string, detailLabel?: string) {
	const crumbs: { label: string; href?: string }[] = [{ label: 'Studio', href: ADMIN_ROOT }];
	const item = allNavItems.find((i) => !i.exact && isActive(i, pathname));
	if (item) {
		crumbs.push({ label: item.label, href: item.href });
		if (pathname !== item.href && detailLabel) crumbs.push({ label: detailLabel });
	} else if (pathname === ADMIN_ROOT) {
		crumbs.push({ label: 'Overview' });
	}
	return crumbs;
}

export type CreateAction = { label: string; hint: string; icon: string; href: string };

/** "New …" entries shared by the top bar menu and the command palette. `?new` opens the create dialog. */
export const createActions: CreateAction[] = [
	{ label: 'Upload photos', hint: 'Files or folders', icon: 'upload', href: '/admin/uploads' },
	{ label: 'New album', hint: 'Curated collection', icon: 'bookmark', href: '/admin/albums?new' },
	{ label: 'New gallery', hint: 'Client delivery', icon: 'share-2', href: '/admin/galleries?new' },
	{ label: 'New client', hint: 'Add to CRM', icon: 'user-plus', href: '/admin/clients?new' },
	{ label: 'New quote or invoice', hint: 'Business', icon: 'receipt', href: '/admin/invoices/new' },
	{ label: 'Compose email', hint: 'Email', icon: 'send', href: '/admin/mail?compose' }
];
