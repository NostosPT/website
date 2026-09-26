<script lang="ts">
	import {
		Button,
		CurrencyInput,
		Input,
		NumberInput,
		Select,
		Table,
		TableCell,
		TableHeaderCell,
		TableRow
	} from '@nostospt/ui';
	import { formatMoney, LOCALE } from '$lib/admin/shared/format';
	import { invoices, vatRates } from './store.svelte';
	import { lineNet } from './totals';
	import type { LineItem, VatRate } from './types';

	let { lines = $bindable(), readonly = false }: { lines: LineItem[]; readonly?: boolean } = $props();
</script>

<Table density="compact" layout="fixed">
	<thead>
		<TableRow>
			<TableHeaderCell>Description</TableHeaderCell>
			<TableHeaderCell width="92px" numeric>Qty</TableHeaderCell>
			<TableHeaderCell width="140px" numeric>Unit price</TableHeaderCell>
			<TableHeaderCell width="150px">VAT</TableHeaderCell>
			<TableHeaderCell width="84px" numeric>Disc. %</TableHeaderCell>
			<TableHeaderCell width="110px" numeric>Net</TableHeaderCell>
			{#if !readonly}<TableHeaderCell width="44px"><span class="ui-sr-only">Remove</span></TableHeaderCell>{/if}
		</TableRow>
	</thead>
	<tbody>
		{#each lines as line, index (line.id)}
			<TableRow>
				<TableCell>
					<Input size="sm" bind:value={line.description} placeholder="Describe the work or product" {readonly} aria-label={`Line ${index + 1} description`} />
				</TableCell>
				<TableCell>
					<NumberInput size="sm" layout="vertical" bind:value={line.quantity} min={0} step={1} {readonly} aria-label="Quantity" />
				</TableCell>
				<TableCell>
					<CurrencyInput
						size="sm"
						value={line.unitPriceCents / 100}
						currency="EUR"
						currencies={['EUR']}
						locale={LOCALE}
						{readonly}
						aria-label="Unit price"
						onchange={({ value }: { value: number | null }) => (line.unitPriceCents = Math.round((value ?? 0) * 100))}
					/>
				</TableCell>
				<TableCell>
					<Select
						size="sm"
						value={String(line.vatRate)}
						options={vatRates}
						disabled={readonly}
						aria-label="VAT rate"
						onchange={(e: Event) => (line.vatRate = Number((e.currentTarget as HTMLSelectElement).value) as VatRate)}
					/>
				</TableCell>
				<TableCell>
					<NumberInput size="sm" layout="vertical" bind:value={line.discount} min={0} max={100} {readonly} aria-label="Discount percent" />
				</TableCell>
				<TableCell numeric>{formatMoney(lineNet(line))}</TableCell>
				{#if !readonly}
					<TableCell>
						<Button
							size="xs"
							variant="ghost"
							tone="neutral"
							iconOnly
							icon="trash"
							label="Remove line"
							disabled={lines.length === 1}
							onclick={() => (lines = lines.filter((l) => l.id !== line.id))}
						/>
					</TableCell>
				{/if}
			</TableRow>
		{/each}
	</tbody>
	{#snippet footer()}
		{#if !readonly}
			<Button size="sm" variant="ghost" icon="plus" onclick={() => (lines = [...lines, invoices.newLine()])}>Add line</Button>
		{/if}
	{/snippet}
</Table>
