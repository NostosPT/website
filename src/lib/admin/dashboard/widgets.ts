import type { Component } from 'svelte';
import type { WidgetId } from './config';
import { kpis, metrics } from './metrics';
import { dashboard } from './store.svelte';
import ActivityWidget from './widgets/ActivityWidget.svelte';
import ArchiveWidget from './widgets/ArchiveWidget.svelte';
import AttentionWidget from './widgets/AttentionWidget.svelte';
import GalleriesWidget from './widgets/GalleriesWidget.svelte';
import KpiTiles from './widgets/KpiTiles.svelte';
import PipelineWidget from './widgets/PipelineWidget.svelte';
import TrendWidget from './widgets/TrendWidget.svelte';
import UpcomingWidget from './widgets/UpcomingWidget.svelte';

export interface WidgetDefinition {
	component: Component;
	/** Columns on the 12-column (wide) and 6-column (medium) board; narrow is one column. */
	span: { lg: number; md: number };
	/** Hidden when it would render nothing for the signed-in role. */
	visible: () => boolean;
}

const always = () => true;

/** Every board widget. Order and selection come from `PUBLIC_DASHBOARD_WIDGETS`. */
export const widgets: Record<WidgetId, WidgetDefinition> = {
	kpis: {
		component: KpiTiles,
		span: { lg: 12, md: 6 },
		visible: () => dashboard.config.kpis.some((id) => dashboard.allows(kpis[id].area))
	},
	trend: {
		component: TrendWidget,
		span: { lg: 8, md: 6 },
		visible: () => Object.values(metrics).some((m) => dashboard.allows(m.area))
	},
	attention: { component: AttentionWidget, span: { lg: 4, md: 6 }, visible: always },
	pipeline: { component: PipelineWidget, span: { lg: 6, md: 3 }, visible: () => dashboard.allows('crm') },
	upcoming: { component: UpcomingWidget, span: { lg: 6, md: 3 }, visible: () => dashboard.allows('crm') },
	activity: { component: ActivityWidget, span: { lg: 4, md: 3 }, visible: always },
	galleries: { component: GalleriesWidget, span: { lg: 4, md: 3 }, visible: () => dashboard.allows('studio') },
	archive: { component: ArchiveWidget, span: { lg: 4, md: 6 }, visible: () => dashboard.allows('archive') }
};
