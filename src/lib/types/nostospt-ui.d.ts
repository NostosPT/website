/**
 * Ambient types for @nostospt/ui.
 *
 * The kit publishes untyped Svelte/JS sources, so without this TypeScript
 * rejects every import. Export names are declared exactly (a typo fails the
 * check); component props stay loose until the kit ships its own declarations.
 */
declare module '@nostospt/ui' {
	import type { Component } from 'svelte';

	type KitComponent = Component<Record<string, any>, Record<string, any>, string>;

	export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

	// primitives
	export const Icon: KitComponent;
	export const Button: KitComponent;
	export const ButtonGroup: KitComponent;
	export const Badge: KitComponent;
	export const Avatar: KitComponent;
	export const AvatarGroup: KitComponent;
	export const Tag: KitComponent;
	export const Kbd: KitComponent;
	export const Spinner: KitComponent;
	export const Divider: KitComponent;
	export const Skeleton: KitComponent;
	export const Trend: KitComponent;
	export const Price: KitComponent;

	// surfaces
	export const Card: KitComponent;
	export const CardHeader: KitComponent;
	export const CardBody: KitComponent;
	export const CardFooter: KitComponent;
	export const Toolbar: KitComponent;
	export const Popover: KitComponent;
	export const Modal: KitComponent;
	export const Tooltip: KitComponent;

	// forms
	export const Field: KitComponent;
	export const InputFrame: KitComponent;
	export const Input: KitComponent;
	export const Textarea: KitComponent;
	export const TextBox: KitComponent;
	export const Select: KitComponent;
	export const Dropdown: KitComponent;
	export const MultiSelect: KitComponent;
	export const Listbox: KitComponent;
	export const Checkbox: KitComponent;
	export const Radio: KitComponent;
	export const Switch: KitComponent;
	export const SegmentedControl: KitComponent;
	export const NumberInput: KitComponent;
	export const TagInput: KitComponent;
	export const PhoneInput: KitComponent;
	export const CurrencyInput: KitComponent;
	export const Dropzone: KitComponent;
	export const FileUpload: KitComponent;
	export const PinInput: KitComponent;
	export const OtpInput: KitComponent;
	export const OptionCard: KitComponent;
	export const Calendar: KitComponent;
	export const DatePicker: KitComponent;

	// data display
	export const List: KitComponent;
	export const ListItem: KitComponent;
	export const Thumbnail: KitComponent;
	export const Table: KitComponent;
	export const TableRow: KitComponent;
	export const TableCell: KitComponent;
	export const TableHeaderCell: KitComponent;
	export const Pagination: KitComponent;
	export const Progress: KitComponent;
	export const DataList: KitComponent;
	export const DataListRow: KitComponent;
	export const Stat: KitComponent;
	export const Sparkline: KitComponent;
	export const EmptyState: KitComponent;

	// navigation
	export const Sidebar: KitComponent;
	export const SidebarHeader: KitComponent;
	export const SidebarSearch: KitComponent;
	export const SidebarNav: KitComponent;
	export const SidebarSection: KitComponent;
	export const SidebarItem: KitComponent;
	export const SidebarFooter: KitComponent;
	export const Tabs: KitComponent;
	export const TabPanel: KitComponent;
	export const Menu: KitComponent;
	export const ContextMenu: KitComponent;
	export const MenuItem: KitComponent;
	export const MenuSeparator: KitComponent;
	export const MenuLabel: KitComponent;
	export const Breadcrumb: KitComponent;
	export const Accordion: KitComponent;
	export const AccordionItem: KitComponent;

	// feedback
	export const Alert: KitComponent;
	export const Toaster: KitComponent;

	export type ToastInput =
		| string
		| {
				title: string;
				description?: string;
				tone?: Tone;
				duration?: number;
				action?: { label: string; onclick: () => void };
		  };
	type ToastOptions = Partial<Exclude<ToastInput, string>>;
	type ToastFn = (input: ToastInput, options?: ToastOptions) => number;

	export const toast: ToastFn & {
		success: ToastFn;
		error: ToastFn;
		warning: ToastFn;
		info: ToastFn;
		dismiss: (id: number) => void;
		dismissAll: () => void;
	};
	export function dismissToast(id: number): void;
	export function dismissAllToasts(): void;

	// utilities
	export const COUNTRIES: { iso: string; name: string; dial: string }[];
	export function flagOf(iso: string): string;
	export const icons: Record<string, string>;
	export const iconNames: string[];
	export function cx(...values: unknown[]): string;
	export function uid(prefix?: string): string;
	export function clamp(value: number, min: number, max: number): number;
	export function initials(name?: string, max?: number): string;
	export function hashIndex(value?: string, buckets?: number): number;
}
