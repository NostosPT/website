# Nostos — Color System

The Nostos color palette is intentionally restrained, natural and editorial.

The system is built around a near-black text color, an almost-white background and muted green tones for brand hierarchy and interaction.

## Core Palette

| Role       | HEX       | RGB                  | HSL                  |
| ---------- | --------- | -------------------- | -------------------- |
| Text       | `#060606` | `rgb(6, 6, 6)`       | `hsl(0, 0%, 2%)`     |
| Background | `#FCFCFC` | `rgb(252, 252, 252)` | `hsl(0, 0%, 99%)`    |
| Primary    | `#798F78` | `rgb(121, 143, 120)` | `hsl(117, 9%, 52%)`  |
| Secondary  | `#B3C2B2` | `rgb(179, 194, 178)` | `hsl(116, 12%, 73%)` |
| Accent     | `#90AB8E` | `rgb(144, 171, 142)` | `hsl(116, 15%, 61%)` |

## Color Roles

### Text

`#060606`

Primary color for:

* Headings
* Body text
* Navigation
* Important interface elements
* High-contrast content

The color is intentionally softer than pure black while remaining highly legible.

### Background

`#FCFCFC`

Primary surface color for:

* Page backgrounds
* Main layouts
* Archive views
* Editorial content

Avoid pure white unless required by an external context.

### Primary

`#798F78`

The main Nostos brand color.

Use for:

* Primary actions
* Selected states
* Important interactive elements
* Brand details
* Buttons where appropriate

Primary should remain relatively restrained. It should not dominate photography.

### Secondary

`#B3C2B2`

A lighter supporting green.

Use for:

* Secondary surfaces
* Subtle UI elements
* Borders
* Tags
* Supporting visual hierarchy
* Hover states where appropriate

### Accent

`#90AB8E`

The stronger supporting accent.

Use for:

* Highlights
* Focus states
* Small visual details
* Interactive feedback
* Selected or active elements when Primary is already in use

Accent should be used sparingly.

## Usage Principles

### Photography comes first

The color system must never compete with the photographs.

The interface should provide a neutral frame around the visual work.

### Keep the palette restrained

Do not introduce additional brand colors without a clear functional reason.

Avoid:

* Gradients
* Neon colors
* Excessive green surfaces
* Decorative color blocks
* Random shades of green

### Hierarchy

A typical page should rely primarily on:

```text
Background → #FCFCFC
Text       → #060606
Primary    → #798F78
Secondary  → #B3C2B2
Accent     → #90AB8E
```

Primary and Accent are supporting colors, not replacements for the neutral foundation.

## Dark Mode

Dark mode is not currently part of the core Nostos visual system.

If introduced later, it should be treated as a separate theme rather than simply inverting the existing palette.

## CSS Variables

Recommended naming:

```css
:root {
  --color-text: #060606;
  --color-background: #fcfcfc;
  --color-primary: #798f78;
  --color-secondary: #b3c2b2;
  --color-accent: #90ab8e;
}
```

These names describe the role of each color rather than its visual appearance, allowing the palette to evolve without forcing component-level changes.
