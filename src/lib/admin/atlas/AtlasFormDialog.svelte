<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Button,
		Field,
		Input,
		Modal,
		MultiSelect,
		NumberInput,
		SegmentedControl,
		Textarea,
		toast
	} from '@nostospt/ui';
	import { atlas } from './store.svelte';
	import { atlasCategories } from './categories.svelte';
	import type { AtlasGeometryKind } from './types';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	let name = $state('');
	let description = $state('');
	let country = $state('');
	let region = $state('');
	let city = $state('');
	let geometryKind = $state<AtlasGeometryKind>('POINT');
	let latitude: number | undefined = $state(undefined);
	let longitude: number | undefined = $state(undefined);
	let geoJsonText = $state('');
	let categorySlugs: string[] = $state([]);
	let submitted = $state(false);

	let nameError = $derived(submitted && !name.trim() ? 'Give the location a name.' : undefined);
	let geoError = $derived.by(() => {
		if (!submitted) return undefined;
		if (geometryKind === 'POINT') {
			if (latitude === undefined || longitude === undefined) return 'Drop a point: latitude and longitude are required.';
			if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
				return 'Coordinates out of range.';
			return undefined;
		}
		if (!geoJsonText.trim()) return 'Paste a GeoJSON Polygon for the area.';
		try {
			JSON.parse(geoJsonText);
			return undefined;
		} catch {
			return 'GeoJSON is not valid JSON.';
		}
	});

	$effect(() => {
		if (!open) return;
		name = '';
		description = '';
		country = '';
		region = '';
		city = '';
		geometryKind = 'POINT';
		latitude = undefined;
		longitude = undefined;
		geoJsonText = '';
		categorySlugs = [];
		submitted = false;
		void atlasCategories.load();
	});

	async function create(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (nameError || geoError) return;
		const input = {
			name: name.trim(),
			description: description.trim() || null,
			country: country.trim().toUpperCase() || null,
			region: region.trim() || null,
			city: city.trim() || null,
			geometryKind,
			latitude: geometryKind === 'POINT' ? (latitude ?? null) : null,
			longitude: geometryKind === 'POINT' ? (longitude ?? null) : null,
			geoJson: geometryKind === 'AREA' ? (JSON.parse(geoJsonText) as unknown) : undefined
		};
		try {
			const location = await atlas.createRemote(input);
			if (categorySlugs.length > 0) {
				try {
					await atlas.setCategoriesRemote(location.id, categorySlugs);
				} catch {
					// Categories stay unset when offline; location itself is saved.
				}
			}
			open = false;
			toast.success(`${location.name} mapped`);
			goto(`/admin/atlas/${location.id}`);
		} catch {
			const location = atlas.create(input);
			open = false;
			toast.success(`${location.name} mapped`);
			goto(`/admin/atlas/${location.id}`);
		}
	}
</script>

<Modal bind:open title="New location" description="A scouting frame for field photography." size="md">
	<form id="atlas-form" class="form" onsubmit={create}>
		<Field label="Name" error={nameError}>
			{#snippet control({ id }: { id: string })}
				<Input {id} bind:value={name} placeholder="e.g. Miradouro da Graça" invalid={Boolean(nameError)} autofocus />
			{/snippet}
		</Field>
		<Field label="Description" optional>
			{#snippet control({ id }: { id: string })}
				<Textarea {id} bind:value={description} rows={2} />
			{/snippet}
		</Field>
		<div class="row">
			<Field label="Country" hint="ISO code" optional>
				{#snippet control({ id }: { id: string })}
					<Input {id} bind:value={country} placeholder="PT" maxlength={2} />
				{/snippet}
			</Field>
			<Field label="Region" optional>
				{#snippet control({ id }: { id: string })}
					<Input {id} bind:value={region} placeholder="Alentejo" />
				{/snippet}
			</Field>
			<Field label="City" optional>
				{#snippet control({ id }: { id: string })}
					<Input {id} bind:value={city} placeholder="Lisbon" />
				{/snippet}
			</Field>
		</div>
		<Field label="Geometry">
			{#snippet control()}
				<SegmentedControl
					bind:value={geometryKind}
					ariaLabel="Geometry kind"
					items={[
						{ value: 'POINT', label: 'Point' },
						{ value: 'AREA', label: 'Area' }
					]}
					block
				/>
			{/snippet}
		</Field>
		{#if geometryKind === 'POINT'}
			<div class="row">
				<Field label="Latitude" error={geoError}>
					{#snippet control({ id }: { id: string })}
						<NumberInput {id} bind:value={latitude} min={-90} max={90} step={0.0001} precision={6} invalid={Boolean(geoError)} />
					{/snippet}
				</Field>
				<Field label="Longitude" error={geoError}>
					{#snippet control({ id }: { id: string })}
						<NumberInput {id} bind:value={longitude} min={-180} max={180} step={0.0001} precision={6} invalid={Boolean(geoError)} />
					{/snippet}
				</Field>
			</div>
		{:else}
			<Field label="GeoJSON Polygon" error={geoError} hint="Paste a Polygon or MultiPolygon. Drawing arrives with the map.">
				{#snippet control({ id }: { id: string })}
					<Textarea {id} bind:value={geoJsonText} rows={4} invalid={Boolean(geoError)} />
				{/snippet}
			</Field>
		{/if}
		<Field label="Categories" optional>
			{#snippet control({ id }: { id: string })}
				<MultiSelect {id} bind:value={categorySlugs} options={atlasCategories.options} placeholder="Photographic categories" />
			{/snippet}
		</Field>
	</form>
	{#snippet footer({ close }: { close: () => void })}
		<Button variant="ghost" tone="neutral" onclick={close}>Cancel</Button>
		<Button type="submit" form="atlas-form">Map location</Button>
	{/snippet}
</Modal>

<style>
	.form {
		display: grid;
		gap: var(--ui-space-10);
	}
	.row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--ui-space-6);
	}
</style>
