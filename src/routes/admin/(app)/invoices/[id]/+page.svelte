<script lang="ts">
	import { clients } from '$lib/admin/clients/store.svelte';
	import DocumentEditor from '$lib/admin/invoices/DocumentEditor.svelte';
	import { documentTypes } from '$lib/admin/invoices/store.svelte';
	import PageHeader from '$lib/admin/shell/PageHeader.svelte';

	let { data } = $props();
	let doc = $derived(data.doc);
	let type = $derived(documentTypes[doc.type]);
</script>

<PageHeader
	kicker={`${type.label}${doc.clientId ? ` · ${clients.get(doc.clientId)?.name ?? ''}` : ''}`}
	title={doc.number ?? `New ${type.label.toLowerCase()}`}
	back={{ href: '/admin/invoices', label: 'Invoices' }}
	detail
/>

{#key `${doc.id}:${doc.status}`}
	<DocumentEditor {doc} />
{/key}
