# Design — Cek Bisnis

Locked design system for the complete Cek Bisnis application. Future Hallmark runs read this file first; routes defer to it.

## Current surface amendment · 2026-08-09

This amendment supersedes any conflicting rounded/soft-surface statements below. The Hum 07 information remains the composition provenance; the current Cek Bisnis product surface is a **neo-brutalist utility press**: warm cream paper, square black rules, hard offset shadows, lime/yellow/cyan/coral blocks, Plus Jakarta Sans, and JetBrains Mono labels.

- Macrostructure remains Narrative Workflow on the landing page and Workbench on analysis routes.
- Cards and controls are square; only status dots may be circular.
- Primary actions use a physical 2–4px press and hard shadow, with no blur or glass.
- Dense comparisons use a desktop table that becomes one readable card per item below 1000px.
- Official franchise, AI-provider, and marketplace marks are height-aligned inside bordered white/ink tiles; text labels remain visible when a remote mark fails.
- AI analysis sits after the deterministic economics calculator. It is a second opinion, never the primary source of financial truth.
- `tokens.css` is the canonical token source; `app/brutal.css` is the final visual layer.

## Original Hum composition provenance

- Genre · playful, trustworthy, practical.
- Theme · studied DNA from Hallmark Hum 07, adapted for Indonesian UMKM decisions.
- Axes · warm cream paper / rounded humanist sans / controlled multi-accent.
- Marketing macrostructure · Narrative Workflow with H2 split hero and F4 numbered sequence.
- Analysis routes · functional Workbench with F6 product catalogue; business logic remains visually primary.
- Survey route · Map Diagram with the same type, colour, controls, and CTA voice.
- Navigation · N10 floating-on-scroll morph.
- Footer · Ft5 statement.

## Provenance

Extracted from `https://www.usehallmark.com/examples/hum-07/` as a public reference for the user's own Cek Bisnis brand on 2026-07-22. Tokens and fonts are exact from source CSS; the page composition is adapted rather than copied. Rhythm was verified against rendered Cek Bisnis pages because URL-only study cannot judge visual pacing.

## Theme

- Cream is the default ground; never pure white.
- Mint owns primary analysis actions.
- Pear marks planning and scale selection.
- Cyan marks data, links, and location work.
- Coral appears once per page for the high-energy decision or closing moment.
- Accents never blend into each other.

## Typography

- Display and body · Plus Jakarta Sans, weights 400–700.
- Labels and tabular figures · JetBrains Mono, weights 400–500.
- Display tracking · `-0.025em`; display line-height · `1.02–1.08`.
- Body minimum · `1rem`; main interface body · `1.0625rem`.
- No serif and no italic display emphasis.

## Spacing and shape

- Named 4-point scale from `--space-3xs` through `--space-4xl`.
- One shared `78rem` content shell with identical section edges.
- Cards · `20px`; inputs · `12px`; actions · full pill.
- Touch targets · minimum `44px`; clickable labels never wrap.

## CTA voice

- Primary · mint or pear push button with a solid lower edge and a physical press.
- Secondary · paper fill with one hairline and the same pill shape.
- Labels name the destination: “Mulai analisis”, “Jalankan survei”, “Unduh GeoJSON”.

## Motion stance

- Three primitives only: N10 nav morph, physical button press, one gentle character pulse.
- Cards may use one small lift with a focus equivalent.
- No universal scroll reveals and no celebratory toast.
- Reduced-motion removes spatial movement and resolves states within 150ms.

## Per-page allowances

- Landing may use the existing business photography and BusinessTour video.
- Analysis routes use the seven generated equipment atlases to explain real purchases.
- Survey routes use the Leaflet map as the primary proof; no decorative map substitute.
- Functional status colours may use success, warning, and danger tokens with text/icon support.

## What every route shares

- Cek Bisnis logo and wordmark.
- Plus Jakarta Sans + JetBrains Mono roles.
- Cream ground, controlled multi-accent meanings, rounded controls, dashed process seams.
- N10 header, focus rings, 44px targets, and the same download/survey button physics.
- Honest numbers only; estimates always retain their validation warning.

## Tokens (canonical · `tokens.css` is the source of truth)

```css
:root {
  --color-paper: oklch(97% 0.012 95);
  --color-paper-2: oklch(94% 0.016 95);
  --color-paper-3: oklch(91% 0.020 95);
  --color-ink: oklch(20% 0.012 250);
  --color-ink-2: oklch(28% 0.014 250);
  --color-rule: oklch(86% 0.014 90);
  --color-accent: oklch(80% 0.16 150);
  --color-accent-ink: oklch(20% 0.012 250);
  --color-focus: oklch(50% 0.20 235);
  --color-pear: oklch(86% 0.18 95);
  --color-cyan: oklch(66% 0.18 235);
  --color-coral: oklch(68% 0.24 18);
  --font-display: var(--font-plus-jakarta), sans-serif;
  --font-body: var(--font-plus-jakarta), sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;
  --radius-card: 1.25rem;
  --radius-pill: 999px;
  --radius-input: 0.75rem;
}
```

## Exports

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(97% 0.012 95);
  --color-paper-2: oklch(94% 0.016 95);
  --color-paper-3: oklch(91% 0.020 95);
  --color-ink: oklch(20% 0.012 250);
  --color-ink-2: oklch(28% 0.014 250);
  --color-rule: oklch(86% 0.014 90);
  --color-accent: oklch(80% 0.16 150);
  --color-pear: oklch(86% 0.18 95);
  --color-cyan: oklch(66% 0.18 235);
  --color-coral: oklch(68% 0.24 18);
  --font-display: var(--font-plus-jakarta), sans-serif;
  --font-body: var(--font-plus-jakarta), sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2.5rem;
  --spacing-2xl: 4rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --radius-card: 1.25rem;
  --radius-input: 0.75rem;
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(97% 0.012 95)", "$type": "color" },
    "paper-2": { "$value": "oklch(94% 0.016 95)", "$type": "color" },
    "ink": { "$value": "oklch(20% 0.012 250)", "$type": "color" },
    "ink-2": { "$value": "oklch(28% 0.014 250)", "$type": "color" },
    "accent": { "$value": "oklch(80% 0.16 150)", "$type": "color" },
    "pear": { "$value": "oklch(86% 0.18 95)", "$type": "color" },
    "cyan": { "$value": "oklch(66% 0.18 235)", "$type": "color" },
    "coral": { "$value": "oklch(68% 0.24 18)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Plus Jakarta Sans, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Plus Jakarta Sans, sans-serif", "$type": "fontFamily" },
    "mono": { "$value": "JetBrains Mono, monospace", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "2.5rem", "$type": "dimension" }
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
  --background: 97% 0.012 95;
  --foreground: 20% 0.012 250;
  --card: 94% 0.016 95;
  --card-foreground: 20% 0.012 250;
  --popover: 97% 0.012 95;
  --popover-foreground: 20% 0.012 250;
  --primary: 80% 0.16 150;
  --primary-foreground: 20% 0.012 250;
  --secondary: 91% 0.020 95;
  --secondary-foreground: 28% 0.014 250;
  --muted: 86% 0.014 90;
  --muted-foreground: 43% 0.014 90;
  --accent: 86% 0.18 95;
  --accent-foreground: 20% 0.012 250;
  --destructive: 48% 0.18 25;
  --destructive-foreground: 97% 0.012 95;
  --border: 86% 0.014 90;
  --input: 86% 0.014 90;
  --ring: 50% 0.20 235;
  --radius: 1.25rem;
}
```

## Notes

Do not carry over the source’s bread imagery, testimonials, pricing, or decorative star-burst. Avoid centred hero stacks, repeated decorative eyebrows, three generic feature cards, accent gradients, raw colours outside tokens, and motion on every section.
