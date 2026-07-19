# Design — Cek Bisnis

A locked design system for the complete Cek Bisnis application. Every route uses the same visual language; extend this file before adding page-specific styling.

## Genre

Modern-minimal with an Indonesian small-business workbench voice: precise, practical, calm, and readable for first-time entrepreneurs.

## Macrostructure family

- Marketing page: Workbench with split proof and real business previews.
- App pages: Workbench with tabular economics, responsive product catalogue, and live map panels.
- Content/download sections: compact reference sheet with vertically stacked headings and inline actions.

## Theme

Cobalt on a cool engineered paper. Blue is a signal, never a decorative flood.

- `--color-paper`: `oklch(98.5% 0.004 250)`
- `--color-paper-2`: `oklch(96% 0.007 250)`
- `--color-paper-3`: `oklch(92% 0.010 250)`
- `--color-ink`: `oklch(20% 0.020 258)`
- `--color-ink-2`: `oklch(32% 0.018 257)`
- `--color-rule`: `oklch(88% 0.010 250)`
- `--color-rule-2`: `oklch(72% 0.014 252)`
- `--color-accent`: `oklch(50% 0.200 256)`
- `--color-focus`: `oklch(44% 0.190 256)`
- `--color-graphite`: `oklch(20% 0.016 260)`

## Typography

- Display: Space Grotesk, weight 600–700, roman.
- Body: Inter, weight 400–600.
- Outlier: JetBrains Mono is limited to the hero preview metrics; labels and coordinates use Inter.
- Display tracking: `-0.035em`.
- Type-scale anchor: `--text-display = clamp(3rem, 6vw, 5.25rem)`.

## Spacing

The source values live in `tokens.css`. Use the named 4-point scale and logical properties. No page-level raw colour or font values.

## Motion

- Easings: `--ease-out`, `--ease-in`, and `--ease-in-out`.
- Motion primitives: button press, inventory image reveal, and functional loading spinner.
- Reduced motion: spatial movement removed; state changes remain visible within 150 ms.

## Microinteractions stance

- Focus rings appear instantly.
- Hover effects always have focus and touch equivalents.
- Loading preserves the action label and uses `aria-live` where results change.
- Success is silent when the result is already visible.

## CTA voice

- Primary: compact cobalt rectangle, 6 px radius, destination named in the label.
- Secondary: ink text with arrow or a one-pixel ruled control.
- Sticky mobile CTA appears only when the primary action would otherwise be far away.

## Per-page allowances

- Marketing may use existing business photography and the existing product-tour video.
- Analysis pages may use generated catalogue imagery only to explain equipment.
- Map pages use the real interactive map as their primary visual proof.

## What pages MUST share

- Cek Bisnis logo and wordmark.
- Cobalt signal colour below 5% of a viewport.
- Space Grotesk, Inter, and JetBrains Mono roles.
- Tight 6–10 px radii, ruled surfaces, and one dark graphite band per long page.
- 44 px minimum touch targets and the same focus language.

## What pages MAY differ on

- Landing uses split proof; detail routes use a business-photo diptych.
- Inventory uses product catalogue cards; economics use tabular metrics.
- Survey routes let the map dominate the workbench.

## Exports

### tokens.css

```css
:root {
  --color-paper: oklch(98.5% 0.004 250);
  --color-paper-2: oklch(96% 0.007 250);
  --color-paper-3: oklch(92% 0.010 250);
  --color-rule: oklch(88% 0.010 250);
  --color-rule-2: oklch(72% 0.014 252);
  --color-muted: oklch(48% 0.015 256);
  --color-neutral: oklch(39% 0.016 257);
  --color-ink-2: oklch(32% 0.018 257);
  --color-ink: oklch(20% 0.020 258);
  --color-accent: oklch(50% 0.200 256);
  --color-accent-ink: oklch(98.5% 0.004 250);
  --color-focus: oklch(44% 0.190 256);
  --color-graphite: oklch(20% 0.016 260);
  --font-display: var(--font-space-grotesk), sans-serif;
  --font-body: var(--font-inter), sans-serif;
  --font-outlier: var(--font-jetbrains-mono), monospace;
  --space-3xs: 0.125rem;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.953rem;
  --text-2xl: 2.441rem;
  --text-display: clamp(3rem, 6vw, 5.25rem);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
  --radius-card: 0.625rem;
  --radius-pill: 999px;
  --radius-input: 0.375rem;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(98.5% 0.004 250);
  --color-paper-2: oklch(96% 0.007 250);
  --color-paper-3: oklch(92% 0.010 250);
  --color-rule: oklch(88% 0.010 250);
  --color-rule-2: oklch(72% 0.014 252);
  --color-muted: oklch(48% 0.015 256);
  --color-neutral: oklch(39% 0.016 257);
  --color-ink-2: oklch(32% 0.018 257);
  --color-ink: oklch(20% 0.020 258);
  --color-accent: oklch(50% 0.200 256);
  --color-focus: oklch(44% 0.190 256);
  --font-display: var(--font-space-grotesk), sans-serif;
  --font-body: var(--font-inter), sans-serif;
  --font-outlier: var(--font-jetbrains-mono), monospace;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2.5rem;
  --spacing-2xl: 4rem;
  --text-sm: 0.875rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.953rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --radius-card: 0.625rem;
  --radius-input: 0.375rem;
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(98.5% 0.004 250)", "$type": "color" },
    "paper-2": { "$value": "oklch(96% 0.007 250)", "$type": "color" },
    "ink": { "$value": "oklch(20% 0.020 258)", "$type": "color" },
    "ink-2": { "$value": "oklch(32% 0.018 257)", "$type": "color" },
    "rule": { "$value": "oklch(88% 0.010 250)", "$type": "color" },
    "accent": { "$value": "oklch(50% 0.200 256)", "$type": "color" },
    "focus": { "$value": "oklch(44% 0.190 256)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Space Grotesk, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Inter, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "JetBrains Mono, monospace", "$type": "fontFamily" }
  },
  "space": {
    "sm": { "$value": "0.75rem", "$type": "dimension" },
    "md": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "2.5rem", "$type": "dimension" },
    "2xl": { "$value": "4rem", "$type": "dimension" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "220ms", "$type": "duration" },
    "long": { "$value": "420ms", "$type": "duration" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 98.5% 0.004 250;
  --foreground: 20% 0.020 258;
  --card: 96% 0.007 250;
  --card-foreground: 20% 0.020 258;
  --popover: 98.5% 0.004 250;
  --popover-foreground: 20% 0.020 258;
  --primary: 50% 0.200 256;
  --primary-foreground: 98.5% 0.004 250;
  --secondary: 92% 0.010 250;
  --secondary-foreground: 32% 0.018 257;
  --muted: 88% 0.010 250;
  --muted-foreground: 48% 0.015 256;
  --accent: 50% 0.200 256;
  --accent-foreground: 98.5% 0.004 250;
  --destructive: 52% 0.190 25;
  --destructive-foreground: 98.5% 0.004 250;
  --border: 88% 0.010 250;
  --input: 88% 0.010 250;
  --ring: 44% 0.190 256;
  --radius: 0.625rem;
}
```
