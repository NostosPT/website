import { mockId } from '$lib/admin/shared/mock-dates';
import type { StatusMap } from '$lib/admin/shared/status';
import { api, ApiError } from '$lib/admin/api/client';
import type { LeadSource } from '$lib/admin/clients/types';
import { seedRequests } from './mock';
import type { ServiceRequest, Stage } from './types';

/** Subset of the Real API `ServiceRequestDTO` used by the pipeline. */
interface ServiceRequestDTO {
	id: string;
	reference: string;
	title: string;
	clientId: string;
	serviceId: string | null;
	stage: Stage;
	preferredDate: string | null;
	location: string | null;
	estimateFromCents: number | null;
	estimateToCents: number | null;
	quoteCents: number | null;
	quoteId: string | null;
	assigneeId: string | null;
	source: string | null;
	lostReason: string | null;
	createdAt: string;
	updatedAt: string;
}

const KNOWN_SOURCES = ['website', 'email', 'referral', 'instagram', 'archive'] as const;

/** Map a Real API request onto the dashboard shape (rich project fields stay local-only). */
function toWebsite(dto: ServiceRequestDTO): ServiceRequest {
	const source = (dto.source ?? 'WEBSITE').toLowerCase();
	return {
		id: dto.id,
		reference: dto.reference,
		title: dto.title,
		clientId: dto.clientId,
		serviceId: dto.serviceId ?? '',
		stage: dto.stage,
		project: {
			date: dto.preferredDate,
			location: dto.location,
			duration: null,
			headcount: null,
			intendedUse: null,
			details: null
		},
		estimate:
			dto.estimateFromCents != null || dto.estimateToCents != null
				? { fromCents: dto.estimateFromCents, toCents: dto.estimateToCents }
				: null,
		quoteCents: dto.quoteCents,
		quoteId: dto.quoteId,
		assigneeId: dto.assigneeId,
		source: (KNOWN_SOURCES as readonly string[]).includes(source) ? (source as LeadSource) : 'website',
		lostReason: dto.lostReason,
		notes: [],
		createdAt: dto.createdAt,
		updatedAt: dto.updatedAt
	};
}

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

/** Service requests (Real API: `/v1/service-requests`, staff session required). */
class PipelineStore {
	items = $state<ServiceRequest[]>(seedRequests);
	#loaded = false;
	#loading = false;

	get loaded() {
		return this.#loaded;
	}

	get loading() {
		return this.#loading;
	}

	/** Real backend first; keeps mock seeds when the backend is unreachable. */
	async load(): Promise<void> {
		if (this.#loaded || this.#loading) return;
		this.#loading = true;
		try {
			const response = await api<{ items: ServiceRequestDTO[] }>(
				'/v1/service-requests?page=1&pageSize=100'
			);
			this.items = response.items.map(toWebsite);
			this.#loaded = true;
		} catch (error) {
			// Offline backend (or unauthenticated): keep the mock seeds.
			if (!(error instanceof ApiError)) throw error;
			this.#loaded = true;
		} finally {
			this.#loading = false;
		}
	}

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

	/** Persist a stage move (Website API → Real API); always applies locally. */
	async moveRemote(id: string, stage: Stage): Promise<void> {
		try {
			await api(`/v1/service-requests/${id}`, {
				method: 'PATCH',
				body: JSON.stringify({ stage })
			});
		} catch {
			// Offline backend: local-only move.
		}
		this.move(id, stage);
	}

	update(id: string, patch: Partial<Omit<ServiceRequest, 'id'>>) {
		const request = this.items.find((r) => r.id === id);
		if (request) Object.assign(request, patch, { updatedAt: new Date().toISOString() });
	}

	/** Persist request edits; maps the dashboard shape onto the Real API body. */
	async updateRemote(id: string, patch: Partial<Omit<ServiceRequest, 'id'>>): Promise<void> {
		const body: Record<string, unknown> = {};
		if (patch.title !== undefined) body.title = patch.title;
		if (patch.stage !== undefined) body.stage = patch.stage;
		if (patch.project?.date !== undefined) body.preferredDate = patch.project.date;
		if (patch.project?.location !== undefined) body.location = patch.project.location;
		if (patch.estimate !== undefined) {
			body.estimateFromCents = patch.estimate?.fromCents ?? null;
			body.estimateToCents = patch.estimate?.toCents ?? null;
		}
		if (patch.quoteCents !== undefined) body.quoteCents = patch.quoteCents;
		if (patch.assigneeId !== undefined) body.assigneeId = patch.assigneeId;
		if (patch.lostReason !== undefined) body.lostReason = patch.lostReason;
		try {
			if (Object.keys(body).length > 0) {
				await api(`/v1/service-requests/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
			}
		} catch {
			// Offline backend: local-only update.
		}
		this.update(id, patch);
	}

	addNote(id: string, body: string, authorId: string) {
		const request = this.items.find((r) => r.id === id);
		request?.notes.push({ id: mockId('note'), authorId, body, createdAt: new Date().toISOString() });
	}

	/** Persist a note; always applies locally. */
	async addNoteRemote(id: string, body: string, authorId: string): Promise<void> {
		try {
			const note = await api<{ id: string; createdAt: string }>(`/v1/service-requests/${id}/notes`, {
				method: 'POST',
				body: JSON.stringify({ body })
			});
			const request = this.items.find((r) => r.id === id);
			request?.notes.push({ id: note.id, authorId, body, createdAt: note.createdAt });
		} catch {
			// Offline backend: local-only note.
			this.addNote(id, body, authorId);
		}
	}
}

export const pipeline = new PipelineStore();
