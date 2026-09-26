<script lang="ts">
	import { Button, Dropzone, Icon } from '@nostospt/ui';
	import {
		ACCEPT,
		ACCEPT_LABEL,
		dropHasFolders,
		fromDrop,
		fromFileList,
		type UploadCandidate
	} from './files';

	/**
	 * The kit's Dropzone plus folders. The kit flattens `dataTransfer.files`,
	 * which loses folders, so a capture-phase listener takes the entries first and
	 * the Dropzone's own `onfiles` is skipped for that drop.
	 */
	let { onadd }: { onadd: (candidates: UploadCandidate[]) => void } = $props();

	let folderInput = $state<HTMLInputElement>();
	let skipNextFiles = false;

	function ondropcapture(event: DragEvent) {
		const transfer = event.dataTransfer;
		if (!transfer || !dropHasFolders(transfer)) return;
		skipNextFiles = true;
		fromDrop(transfer).then(onadd);
	}

	function onfiles(files: File[]) {
		if (skipNextFiles) {
			skipNextFiles = false;
			return;
		}
		onadd(fromFileList(files));
	}
</script>

<div class="upload-drop" {ondropcapture}>
	<Dropzone accept={ACCEPT} multiple {onfiles}>
		{#snippet children({ browse, dragging }: { browse: () => void; dragging: boolean })}
			<div class="surface" data-dragging={dragging || undefined}>
				<span class="icon"><Icon name="upload" size={22} /></span>
				<p class="title">{dragging ? 'Drop to upload' : 'Drop photographs or whole folders'}</p>
				<p class="hint">
					Folders keep their structure and can become albums. {ACCEPT_LABEL}.
				</p>
				<div class="actions">
					<Button icon="image" onclick={browse}>Choose files</Button>
					<Button variant="outline" icon="folder" onclick={() => folderInput?.click()}>Choose folder</Button>
				</div>
			</div>
		{/snippet}
	</Dropzone>
	<input
		bind:this={folderInput}
		class="ui-sr-only"
		type="file"
		webkitdirectory
		multiple
		tabindex="-1"
		aria-hidden="true"
		onchange={(event) => {
			onadd(fromFileList(event.currentTarget.files ?? []));
			event.currentTarget.value = '';
		}}
	/>
</div>

<style>
	.surface {
		display: grid;
		justify-items: center;
		gap: var(--ui-space-4);
		padding: clamp(2rem, 5vw, 3.5rem) var(--ui-space-12);
		text-align: center;
		border: 1px dashed var(--ui-border-strong);
		border-radius: var(--ui-radius-2xl);
		background: var(--ui-bg-surface);
		transition:
			background-color var(--ui-duration-fast) var(--ui-ease-out),
			border-color var(--ui-duration-fast) var(--ui-ease-out);
	}
	.surface[data-dragging] {
		border-color: var(--ui-accent-solid);
		background: var(--ui-accent-soft);
	}
	.icon {
		display: grid;
		place-items: center;
		width: 48px;
		height: 48px;
		margin-bottom: var(--ui-space-2);
		border: 1px solid var(--ui-border-default);
		border-radius: var(--ui-radius-lg);
		color: var(--ui-fg-muted);
	}
	.title {
		margin: 0;
		font: 400 var(--ui-text-2xl) / 1.2 var(--ui-font-serif);
		letter-spacing: -0.02em;
	}
	.hint {
		margin: 0;
		max-width: 44ch;
		font-size: var(--ui-text-sm);
		color: var(--ui-fg-muted);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--ui-space-4);
		margin-top: var(--ui-space-6);
	}
</style>
