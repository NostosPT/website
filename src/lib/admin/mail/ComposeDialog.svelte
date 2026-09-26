<script lang="ts">
	import {
		Button,
		Field,
		FileUpload,
		Input,
		Modal,
		Select,
		TagInput,
		Textarea,
		toast
	} from '@nostospt/ui';
	import { isEmail, mail } from './store.svelte';
	import { templates } from './templates';

	/** The one composer, mounted by the shell; open it with `mail.compose()`. */

	let showCc = $state(false);
	let templateId = $state('');
	let sending = $state(false);
	let submitted = $state(false);

	let draft = $derived(mail.composer.draft);
	let replying = $derived(Boolean(draft.threadId));
	let invalidTo = $derived(draft.to.filter((address) => !isEmail(address)));
	let toError = $derived(
		!submitted
			? undefined
			: draft.to.length === 0
				? 'Add at least one recipient.'
				: invalidTo.length
					? `Not a valid address: ${invalidTo.join(', ')}`
					: undefined
	);

	$effect(() => {
		if (!mail.composer.open) return;
		showCc = draft.cc.length > 0;
		templateId = '';
		submitted = false;
	});

	function applyTemplate() {
		const template = templates.find((t) => t.id === templateId);
		if (!template) return;
		if (!replying) draft.subject = template.subject;
		draft.text = template.text;
	}

	async function send() {
		submitted = true;
		if (toError) return;
		sending = true;
		await mail.send(draft);
		sending = false;
		mail.composer.open = false;
		toast.success({ title: 'Message sent', description: draft.to.join(', ') });
	}
</script>

<Modal
	bind:open={mail.composer.open}
	title={replying ? 'Reply' : 'New message'}
	size="lg"
	closeOnOutside={false}
>
	<form class="compose" id="compose-form" onsubmit={(e) => (e.preventDefault(), send())}>
		<Field label="To" error={toError}>
			{#snippet control({ id }: { id: string })}
				<TagInput
					{id}
					bind:value={draft.to}
					placeholder="name@example.com"
					separators={[',', 'Enter', 'Tab', ' ']}
					invalid={Boolean(toError)}
				/>
			{/snippet}
		</Field>

		{#if showCc}
			<Field label="Cc">
				{#snippet control({ id }: { id: string })}
					<TagInput {id} bind:value={draft.cc} separators={[',', 'Enter', 'Tab', ' ']} />
				{/snippet}
			</Field>
		{:else}
			<Button variant="link" size="xs" tone="neutral" onclick={() => (showCc = true)}>Add Cc</Button>
		{/if}

		<div class="row">
			<Field label="Subject">
				{#snippet control({ id }: { id: string })}
					<Input {id} bind:value={draft.subject} placeholder="Subject" />
				{/snippet}
			</Field>
			<Field label="Template">
				{#snippet control({ id }: { id: string })}
					<Select
						{id}
						bind:value={templateId}
						placeholder="Start from…"
						options={templates.map((t) => ({ value: t.id, label: t.name }))}
						onchange={applyTemplate}
					/>
				{/snippet}
			</Field>
		</div>

		<Field label="Message">
			{#snippet control({ id }: { id: string })}
				<Textarea {id} bind:value={draft.text} rows={10} autogrow maxRows={20} />
			{/snippet}
		</Field>

		<Field label="Attachments" optional>
			{#snippet control({ id }: { id: string })}
				<FileUpload {id} bind:files={draft.attachments} multiple />
			{/snippet}
		</Field>
	</form>

	{#snippet footer({ close }: { close: () => void })}
		<p class="from">From hello@nostos.studio via Resend</p>
		<Button variant="ghost" tone="neutral" onclick={close}>Discard</Button>
		<Button type="submit" form="compose-form" icon="send" loading={sending}>Send</Button>
	{/snippet}
</Modal>

<style>
	.compose {
		display: grid;
		gap: var(--ui-space-8);
	}
	.compose > :global(.ui-btn) {
		justify-self: start;
		margin-top: calc(var(--ui-space-4) * -1);
	}
	.row {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
		gap: var(--ui-space-6);
	}
	.from {
		margin: 0 auto 0 0;
		font-size: var(--ui-text-xs);
		color: var(--ui-fg-subtle);
	}
	@media (max-width: 640px) {
		.row {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
