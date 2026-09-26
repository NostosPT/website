import { mockId } from '$lib/admin/shared/mock-dates';
import type { StatusMap } from '$lib/admin/shared/status';
import { seedRequests } from './mock';
import type { ServiceRequest, Stage } from './types';

export const stages: { key: Stage; label: string; hint: string }[] = [
	{ key: 'NEW', label: 'New', hint: 'Submitted, not reviewed' },
	{ key: 'QUALIFIED', label: 'Qualified', hint: 'Enough to quote' },
	{ key: 'QUOTED', label: 'Quoted', hint: 'Waiting on the client' },
	{ key: 'BOOKED', label: 'Booked', hint: 'Date confirmed' },
	{ key: 'COMPLETED', label: 'Completed', hint: 'Delivered' },
	{ key: 'LOST', label: 'Lost', hint: 'Closed without booking' }
];

export const stageStatus: StatusMap<Stage> = {
	NEW: { label: 'New', tone: 'info' },
	QUALIFIED: { label: 'Qualified', tone: 'purple' },
	QUOTED: { label: 'Quoted', tone: 'warning' },
	BOOKED: { label: 'Booked', tone: 'accent' },
	COMPLETED: { label: 'Completed', tone: 'success' },
	LOST: { label: 'Lost', tone: 'neutral' }
};

/** Service requests. Needs API endpoints: /requests (list, create, patch, notes). */
class PipelineStore {
	items = $state<ServiceRequest[]>(seedRequests);

	newCount = $derived(this.items.filter((r) => r.stage === 'NEW').length);

	/** Booked shoots from today on, soonest first. */
	upcoming = $derived(
		this.items
			.filter((r) => r.stage === 'BOOKED' && r.project.date && r.project.date >= new Date().toISOString())
			.sort((a, b) => (a.project.date ?? '').localeCompare(b.project.date ?? ''))
	);

	/** Value of open quotes: work that is one reply away from booked. */
	quotedValueCents = $derived(
		this.items.filter((r) => r.stage === 'QUOTED').reduce((sum, r) => sum + (r.quoteCents ?? 0), 0)
	);

	get(id: string | null | undefined): ServiceRequest | undefined {
		return id ? this.items.find((r) => r.id === id) : undefined;
	}

	byStage(stage: Stage): ServiceRequest[] {
		return this.items
			.filter((r) => r.stage === stage)
			.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	}

	forClient(clientId: string): ServiceRequest[] {
		return this.items.filter((r) => r.clientId === clientId);
	}

	move(id: string, stage: Stage) {
		this.update(id, { stage });
	}

	update(id: string, patch: Partial<Omit<ServiceRequest, 'id'>>) {
		const request = this.items.find((r) => r.id === id);
		if (request) Object.assign(request, patch, { updatedAt: new Date().toISOString() });
	}

	addNote(id: string, body: string, authorId: string) {
		const request = this.items.find((r) => r.id === id);
		request?.notes.push({ id: mockId('note'), authorId, body, createdAt: new Date().toISOString() });
	}
}

export const pipeline = new PipelineStore();
