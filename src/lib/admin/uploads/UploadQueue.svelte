<script lang="ts">
	import {
		Badge,
		Button,
		Card,
		CardHeader,
		Icon,
		Progress,
		Table,
		TableCell,
		TableHeaderCell,
		TableRow,
		Thumbnail,
		Tooltip
	} from '@nostospt/ui';
	import { formatBytes, pluralize } from '$lib/admin/shared/format';
	import type { StatusMap } from '$lib/admin/shared/status';
	import { uploads, type UploadStatus } from './queue.svelte';

	const status: StatusMap<UploadStatus> = {
		queued: { label: 'Queued', tone: 'neutral' },
		uploading: { label: 'Uploading', tone: 'info' },
		processing: { label: 'Processing', tone: 'purple' },
		done: { label: 'Done', tone: 'success' },
		failed: { label: 'Failed', tone: 'danger' },
		cancelled: { label: 'Cancelled', tone: 'neutral' }
	};

	let overall = $derived(uploads.totalBytes ? (uploads.sentBytes / uploads.totalBytes) * 100 : 0);
</script>

<Card>
	<CardHeader
		title="Queue"
		description={`${pluralize(uploads.done, 'file')} done of ${uploads.items.length} · ${formatBytes(uploads.sentBytes)} of ${formatBytes(uploads.totalBytes)}`}
		divided
	>
		{#snippet actions()}
			{#if uploads.failed}
				<Button size="sm" variant="outline" icon="rotate-ccw" onclick={() => uploads.retryFailed()}>Retry failed</Button>
			{/if}
			{#if uploads.busy}
				<Button size="sm" variant="ghost" tone="danger" onclick={() => uploads.cancelAll()}>Cancel all</Button>
			{:else}
				<Button size="sm" variant="ghost" tone="neutral" onclick={() => uploads.clearFinished()}>Clear finished</Button>
			{/if}
		{/snippet}
	</CardHeader>

	<div class="overall">
		<Progress value={overall} size="sm" tone={uploads.failed ? 'warning' : 'accent'} label="Overall progress" />
	</div>

	<Table density="compact" stickyHeader>
		<thead>
			<TableRow>
				<TableHeaderCell>File</TableHeaderCell>
				<TableHeaderCell>Folder</TableHeaderCell>
				<TableHeaderCell numeric>Size</TableHeaderCell>
				<TableHeaderCell width="34%">Progress</TableHeaderCell>
				<TableHeaderCell width="56px"><span class="ui-sr-only">Actions</span></TableHeaderCell>
			</TableRow>
		</thead>
		<tbody>
			{#each uploads.items as item (item.id)}
				{@const s = status[item.status]}
				<TableRow>
					<TableCell>
						<span class="file">
							{#if item.preview}
								<Thumbnail src={item.preview} alt="" size={32} />
							{:else}
								<Thumbnail icon="file" size={32} />
							{/if}
							<span class="name">{item.file.name}</span>
						</span>
					</TableCell>
					<TableCell muted truncate>
						{#if item.folder}
							<span class="folder" title={item.folder}>
								<Icon name="folder" size={13} /><span>{item.folder.split('/').pop()}</span>
							</span>
						{:else}—{/if}
					</TableCell>
					<TableCell numeric muted>{formatBytes(item.file.size)}</TableCell>
					<TableCell>
						{#if item.status === 'uploading'}
							<Progress value={item.progress * 100} size="sm" showValue label={`Uploading ${item.file.name}`} />
						{:else if item.status === 'failed'}
							<Tooltip content={item.error ?? 'Upload failed'}>
								<Badge tone={s.tone} size="sm" icon="alert-circle">{s.label}</Badge>
							</Tooltip>
						{:else if item.status === 'done' && item.photoId}
							<a class="done" href={`/admin/photos/${item.photoId}`}>
								<Badge tone={s.tone} size="sm" icon="check">{s.label}</Badge>
								<span>Edit details</span>
							</a>
						{:else}
							<Badge tone={s.tone} size="sm" variant={item.status === 'queued' ? 'dot' : 'soft'}>{s.label}</Badge>
						{/if}
					</TableCell>
					<TableCell align="end">
						{#if item.status === 'failed'}
							<Button size="xs" variant="ghost" tone="neutral" iconOnly icon="rotate-ccw" label="Retry" onclick={() => uploads.retry(item.id)} />
						{:else if item.status === 'queued' || item.status === 'uploading'}
							<Button size="xs" variant="ghost" tone="neutral" iconOnly icon="x" label="Cancel" onclick={() => uploads.cancel(item.id)} />
						{/if}
					</TableCell>
				</TableRow>
			{/each}
		</tbody>
	</Table>
</Card>

<style>
	.overall {
		padding: var(--ui-space-6) var(--ui-space-8);
	}
	.file {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-6);
		min-width: 0;
	}
	.name {
		overflow: hidden;
		max-width: 28ch;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.folder {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-3);
		max-width: 22ch;
	}
	.folder span {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	.done {
		display: inline-flex;
		align-items: center;
		gap: var(--ui-space-4);
		font-size: var(--ui-text-sm);
		color: var(--ui-accent-text);
		text-decoration: none;
	}
	.done:hover span {
		text-decoration: underline;
	}
</style>
