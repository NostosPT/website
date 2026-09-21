# Nostos — Typography System

Nostos uses typography as a core part of its visual identity.

The system combines an editorial serif with a clean sans-serif to create contrast between expressive content and functional information.

## Typefaces

### Lora

**Role:** Headings, titles and editorial details.

Lora provides the editorial character of Nostos.

Use it for:

* Page headings
* Hero statements
* Photo titles
* Editorial details
* Large display text
* Important visual statements

### Raleway

**Role:** Body, navigation, UI and technical information.

Raleway provides the clean and contemporary structure of the interface.

Use it for:

* Body text
* Navigation
* Buttons
* Forms
* Labels
* Metadata
* Technical/archive information

## Hierarchy

```text
Display / Hero
Lora
Large, expressive, high visual impact

Page Heading
Lora
Strong editorial hierarchy

Section Heading
Lora
Moderate emphasis

Body
Raleway
Clean and readable

Navigation / UI
Raleway
Functional and restrained

Archive Metadata
Raleway
Uppercase with increased letter spacing
```

## Archive / Metadata

Archive information should have a technical and catalogued appearance.

Example:

```text
N° 482
LISBON / PORTUGAL
STREET PHOTOGRAPHY
2026
```

Use:

* Raleway
* Uppercase
* Increased letter spacing
* Smaller font sizes
* Clear spacing between metadata groups

Metadata should feel like an archival reference, not decorative text.

## Case Rules

### Headings

Use normal title/sentence case.

```text
A photographic archive.
```

Avoid forcing headings into uppercase.

### UI

Use normal sentence case.

```text
Archive
Studio
About
Contact
```

### Metadata

Use uppercase.

```text
N° 482
LISBON / PORTUGAL
STREET PHOTOGRAPHY
```

This creates a deliberate distinction between editorial content and archival information.

## Contrast

Typography should rely on contrast between:

**Lora**

* Editorial
* Expressive
* Human
* Visual

**Raleway**

* Functional
* Contemporary
* Precise
* Quiet

Do not use both typefaces interchangeably without purpose.

## Weight

Keep the system restrained.

Prefer a small number of weights rather than using every available font weight.

Suggested starting point:

```text
Lora
- Regular
- Medium / SemiBold when required

Raleway
- Regular
- Medium
- SemiBold
```

## Letter Spacing

Raleway metadata and labels may use increased tracking.

Example:

```css
letter-spacing: 0.08em;
```

Normal body text should use natural spacing.

Lora headings should generally avoid excessive tracking.

## Visual Principle

Typography should be highly visible but never compete with the photography.

Large Lora headings and generous whitespace should create the editorial character.

Raleway should quietly provide the structure underneath it.

The goal is:

> **Editorial typography with archival discipline.**

## CSS Variables

```css
:root {
  --font-heading: "Lora", serif;
  --font-body: "Raleway", sans-serif;
}
```

## Example

```text
NOSTOS

A photographic
archive.

ARCHIVE
LISBON / PORTUGAL
N° 482
2026
```

Lora establishes the visual identity.

Raleway establishes the information hierarchy.
