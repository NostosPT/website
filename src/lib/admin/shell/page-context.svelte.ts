/**
 * Lets a detail page name itself in the top bar's breadcrumb
 * (e.g. "Albums › Lisbon at night") without the shell knowing every route.
 */
class PageContext {
	detailLabel = $state<string | undefined>(undefined);
}

export const pageContext = new PageContext();
