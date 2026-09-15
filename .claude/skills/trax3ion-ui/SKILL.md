---
name: trax3ion-ui
description: "X3 Consulting's house UI design language (Trax3ion UI) — dark glass panels, selectable accent themes on the logo ramp, Montserrat, X3 logo mark. Use when building or restyling any X3 Consulting or Trax3ion product, app, dashboard, prototype or internal tool."
---

# Trax3ion UI — X3 Consulting Glass

Build in the **Trax3ion Glass** design language: a dark, glass-panel enterprise UI. Follow it exactly so the product is visually consistent with our other tools.

## 1. Load the tokens

Every build starts from the token sheet in section 9. Paste it into the project and use its custom properties — **never hand-pick hex values.** It carries the palette, Montserrat import, surface/button/chip classes and the ambient glow.

If the target can't take a stylesheet (e.g. an inline-styles-only environment), declare the same custom properties on the root element and reference them the same way.

## 2. Brand — non-negotiable

The brand identity is the **lime → teal gradient** of the X3 Consulting logo:

```
full logo ramp: #9ac73c → #88c14f → #63b579 → #49ad98 → #38a7ab → #33a6b2
```

- **The logo mark always uses the full lime→teal ramp.** It never recolours, whatever accent the UI is set to.
- The **UI accent** is selectable from the fixed set in section 3. Default is **Deep Teal `#33A6B2`**.
- Text **on** a brand fill is dark ink — never white. Each accent carries its own ink value.
- **We are not Sage.** Never use Sage green `#00D639` or any Sage palette colour, even for a Sage-adjacent product.
- Need another tone? Derive it with `color-mix()` against an existing token — don't introduce a new hue, and don't invent accents outside section 3.

**Status colours carry fixed meanings across every product** — reuse the mapping so users read state identically in every tool: blue `--st-planned` = scheduled/info · amber `--st-firm` = pending/warning · mint `--st-progress` = active/ok · red `--st-late` = error/high · grey `--st-complete` = done.

**Status colours are never themeable and never brand-coloured.** On an operations or shop-floor screen, "this job is late" must never be mistakable for branding. Where a product offers theme choice, say this on screen.

## 3. Accent themes

Ship all six. Four sit on the logo ramp, one is a deliberate departure, one is the raw logo lime.

| id | Name | `--brand` | `--brand-2` | `--brand-ink` | Notes |
|---|---|---|---|---|---|
| `teal` | Deep Teal | `#33A6B2` | `#2B8A96` | `#04211F` | **Default.** End of the logo ramp. Sits furthest from the status palette. |
| `sea` | Sea Green | `#49AD98` | `#38A7AB` | `#052019` | On-ramp. Green without the citrus edge. |
| `sage` | Sage | `#63B579` | `#49AD98` | `#08210F` | On-ramp, muted. Closest to mint `--st-progress` — watch that. |
| `moss` | Deep Moss | `#7FA92F` | `#5E9459` | `#141F06` | Logo lime desaturated. Green without the fizz. |
| `ice` | Ice | `#4FC3D9` | `#3796B8` | `#042027` | Off-ramp, cooler. Sits near blue `--st-planned` — watch that. |
| `lime` | Logo Lime | `#9AC73C` | `#33A6B2` | `#16240A` | The raw mark. Reads as fluorescent on large dark screens. |

Choosing a default for a new product: prefer the accent **furthest from the status colours** for anything operational, so "this is a control" never blurs into "this is a state". Reserve Logo Lime for marketing surfaces and short-lived screens, not dashboards someone stares at all day.

### Making a product themeable

Every brand value must resolve through a custom property. A literal anywhere is a value that won't follow the theme:

```css
/* ✅ themeable */
background: linear-gradient(160deg, var(--brand), var(--brand-2));
color: var(--brand-ink);
box-shadow: 0 6px 20px -6px color-mix(in srgb, var(--brand) 50%, transparent);

/* ❌ will stay the old colour forever */
background: linear-gradient(160deg, var(--brand), #33A6B2);
color: #16240A;
box-shadow: 0 6px 20px -6px rgba(154,199,60,.5);
```

The three traps, all of which have bitten a real restyle:

1. **Gradient end-stops.** `linear-gradient(160deg, var(--brand), #33A6B2)` looks themeable and isn't.
2. **Ink on brand fills.** Dark ink differs per accent, so `color:#16240A` must become `var(--brand-ink)`.
3. **Colours hiding in `rgba()`.** A hex sweep for `#00D639` will not find `rgba(0,214,57,.5)`. **Always grep the rgb triplet as well as the hex** — twelve Sage-green glows survived a "complete" rebrand exactly this way.

The theme control belongs in the product's own settings UI — a **Theme** tab in Setup — built from the app's native components so the choice persists in config and is captured by whatever change log the product keeps. Never bolt on a floating widget.

## 4. Typography

- **Montserrat** (400/500/600/700) for everything — it is the X3 Consulting brand typeface. No second font, no mono face.
- Put `font-variant-numeric: tabular-nums` on `body` so codes, quantities and metrics stay column-aligned without a monospace font.
- Scale: 9–10px uppercase labels (`letter-spacing:.4–.5px`, `color:var(--text-3)`) · 11–12.5px body · 14px card titles · 16px panel/sheet titles · 19px page title · 30px+ KPI numbers (weight 600, `line-height:1`).

## 5. The logo mark

Inline the SVG in section 10 rather than linking an asset, so there's no fetch to fail.

- Aspect is **1.77:1** — never squash it square, never put it on a coloured tile. The gradient is the brand and needs the dark ground to read.
- Sizes: 44px wide in a ~216px sidebar · 32px inline · 64px+ on a splash.
- Full lockup = the mark with **CONSULTING** set beneath it in Montserrat 600, white, uppercase, `letter-spacing:.14em`, optical width matched to the mark. Use the lockup only where there's horizontal room and no adjacent product name; elsewhere use the mark alone.
- The mark keeps its own lime→teal ramp regardless of the active accent.

## 6. Surfaces

- **Panel**: `--glass` fill, 1px `--edge` border, `--r-lg` radius, plus the `--glass-highlight` top sheen.
- **Raised panel**: add `--raised-shadow` and use `--edge-2`.
- **Overlay** (slide-over, dropdown, modal): near-opaque `rgba(14,19,28,.98)` + `backdrop-filter:blur(14px)` + strong shadow. **Never let content read through an overlay** — this is the most common mistake.
- Pills, toggles, chips: `border-radius:999px`.
- **Status chip**: token colour at full opacity, `color-mix(… 13%, transparent)` fill, `color-mix(… 36%, transparent)` border, 9px uppercase bold.
- **Toggle**: 36×21 track, 17px knob translating 2px→18px, `transition:transform .2s`; on = brand knob + brand-tinted border.

## 7. Layout

- **Shell**: ~216px sticky left sidebar (`rgba(9,13,20,.55)`, right `--edge` border) + fluid main padded `22px 26px 44px`.
- **Per-screen top bar**: page title (19px) + `--text-3` subtitle, then right-aligned controls (search, status pills, primary action).
- Always **flex/grid with `gap`** — never floats, never whitespace-spaced inline siblings.
- KPI rows: `grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px`.
- **Card headers use an icon chip**: 28–32px rounded square, `rgba(255,255,255,.06)` fill, `--edge` border, `--brand` glyph — then title + a one-line `--text-3` description.
- Group long config screens into **sub-tabs** (a sticky pill bar), never one endless scroll.

## 8. Conventions

- Icons are **Unicode glyphs + CSS**. No icon fonts, no emoji, no SVG illustration — the only SVG is the X3 logo mark.
- Motion is subtle: `transition:background .18s` on interactives, `transform .2s` on toggles/chevrons, slide-overs from the right.
- Confirm actions with a **bottom-centre toast**, not an alert.
- Risky/destructive actions get a red-tinted chip treatment, never a bare red button.
- Tables: 9px uppercase header row, rows separated by `border-top:1px solid rgba(255,255,255,.05)`, right-align numerics.
- Contrast: full-opacity ink on tinted grounds — never alpha-muted body text.
- Reference implementation: the **X3-MES App** (`~/Documents/Claude Apps/X3-MES APP`) is the canonical build of this system — lift patterns from it rather than re-deriving them. Its `prototype/X3-Production-Planner-LIVE.html` carries the Theme tab described in section 3.

### Verifying a restyle

Counting tags or checking that a file parses proves nothing about whether the UI works. Before reporting a restyle done:

- Grep for the old brand as **hex and rgb triplet**, across every file including bundled ones.
- If the framework hands template values through an **explicit allowlist** (an object returned from a render function), every new computed value must be added to it. Miss it and the markup renders with all bindings empty — a blank panel that looks like a CSS fault but isn't.
- In a class body use `get NAME(){ return [...] }` or a method. `NAME: [...]` is object syntax and throws `Unexpected class field`, which kills the whole component and blanks the app.
- **Actually execute the changed logic or load the page before saying it works.** Structural checks cannot tell you the JavaScript is broken or a binding is invisible.

## 9. Token sheet

```css
/* X3 Consulting — Trax3ion Glass UI tokens.
   Drop this in and use the variables. Do not hand-pick hex values elsewhere. */

@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');

:root {
  /* Ground & ink */
  --ink:      #080B11;                 /* app background */
  --text:     #EFF4F9;                 /* primary text */
  --text-2:   #A6B4C4;                 /* secondary text */
  --text-3:   #6F8092;                 /* labels / tertiary */

  /* Glass surfaces */
  --glass:    rgba(255,255,255,.045);  /* panel fill */
  --glass-2:  rgba(255,255,255,.075);  /* raised fill */
  --edge:     rgba(255,255,255,.10);   /* hairline border */
  --edge-2:   rgba(255,255,255,.18);   /* stronger border */

  /* Accent — default Deep Teal. Swap these three for any row in section 3. */
  --brand:    #33A6B2;
  --brand-2:  #2B8A96;
  --brand-ink:#04211F;                 /* dark ink for text ON brand fills */
  --brand-gradient: linear-gradient(160deg, var(--brand), var(--brand-2));

  /* Status — fixed meanings, never themed, reuse across every product */
  --st-planned:  #6FA8FF;   /* blue  · scheduled / info */
  --st-firm:     #F5C15A;   /* amber · pending / warning */
  --st-progress: #3ED282;   /* mint  · active / ok */
  --st-late:     #FF6B6B;   /* red   · error / high */
  --st-complete: #8DA0B4;   /* grey  · done */

  /* Geometry */
  --r-sm: 11px;
  --r-md: 16px;
  --r-lg: 22px;

  /* Elevation */
  --glass-highlight: inset 0 1px 0 rgba(255,255,255,.12);
  --raised-shadow:   0 24px 60px -28px rgba(0,0,0,.7);
  --brand-glow:      0 6px 20px -6px color-mix(in srgb, var(--brand) 50%, transparent);
}

body {
  background: var(--ink);
  color: var(--text);
  font-family: 'Montserrat', -apple-system, system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  -webkit-font-smoothing: antialiased;
}

a       { color: var(--brand); text-decoration: none; }
a:hover { color: var(--brand-2); }

/* --- Surfaces --- */
.x3-panel {
  background: var(--glass);
  border: 1px solid var(--edge);
  border-radius: var(--r-lg);
  box-shadow: var(--glass-highlight);
}
.x3-panel--raised {
  border-color: var(--edge-2);
  box-shadow: var(--glass-highlight), var(--raised-shadow);
}
/* Overlays must be near-opaque — never let content read through. */
.x3-overlay {
  background: rgba(14,19,28,.98);
  backdrop-filter: blur(14px);
  border: 1px solid var(--edge-2);
  border-radius: var(--r-md);
  box-shadow: 0 18px 44px -12px rgba(0,0,0,.7), var(--glass-highlight);
}

/* --- Buttons --- */
.x3-btn-primary {
  background: var(--brand-gradient);
  color: var(--brand-ink);           /* dark ink on the accent, never white */
  border: 0; font: inherit; font-weight: 600;
  padding: 11px 22px;
  border-radius: var(--r-sm);
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.45), var(--brand-glow);
  transition: transform .15s;
}
.x3-btn-primary:hover { transform: translateY(-1px); }

.x3-btn {
  background: rgba(255,255,255,.05);
  border: 1px solid var(--edge);
  color: var(--text-2);
  font: inherit; font-weight: 500;
  padding: 11px 18px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: background .18s;
}
.x3-btn:hover { background: rgba(255,255,255,.1); }

/* --- Status chip --- set --sc to any status token, e.g. style="--sc:var(--st-late)" */
.x3-chip {
  --sc: var(--st-planned);
  color: var(--sc);
  background: color-mix(in srgb, var(--sc) 13%, transparent);
  border: 1px solid color-mix(in srgb, var(--sc) 36%, transparent);
  font-size: 9px; font-weight: 700; letter-spacing: .4px;
  text-transform: uppercase;
  padding: 3px 9px;
  border-radius: 999px;
}

/* --- Labels & numerics --- */
.x3-label { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: .5px; }
.x3-kpi   { font-size: 30px; font-weight: 600; line-height: 1; }

/* --- Ambient background glow (optional) ---
   markup: <div class="x3-ambient"><i></i><i></i></div> */
.x3-ambient { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.x3-ambient i { position: absolute; border-radius: 50%; display: block; }
.x3-ambient i:nth-child(1) {
  width: 46vw; height: 46vw; top: -16vw; right: -8vw; opacity: .22;
  filter: blur(100px);
  background: radial-gradient(circle, var(--brand) 0%, transparent 65%);
}
.x3-ambient i:nth-child(2) {
  width: 44vw; height: 44vw; bottom: -16vw; left: 2vw; opacity: .2;
  filter: blur(110px);
  background: radial-gradient(circle, var(--brand-2) 0%, transparent 65%);
}
```

### Accent map (drop-in)

```js
const TRAX3ION_ACCENTS = [
  { id:"teal", name:"Deep Teal", a:"#33A6B2", b:"#2B8A96", ink:"#04211F" },  // default
  { id:"sea",  name:"Sea Green", a:"#49AD98", b:"#38A7AB", ink:"#052019" },
  { id:"sage", name:"Sage",      a:"#63B579", b:"#49AD98", ink:"#08210F" },
  { id:"moss", name:"Deep Moss", a:"#7FA92F", b:"#5E9459", ink:"#141F06" },
  { id:"ice",  name:"Ice",       a:"#4FC3D9", b:"#3796B8", ink:"#042027" },
  { id:"lime", name:"Logo Lime", a:"#9AC73C", b:"#33A6B2", ink:"#16240A" }
];
// Apply by setting --brand, --brand-2 and --brand-ink on the root element from the chosen row.
// Persist the id in the product's own config, not in ad-hoc browser storage.
```

## 10. Logo mark (inline this SVG verbatim)

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65.336 37" width="44" aria-label="X3 Consulting"><defs><linearGradient id="x3g" x1="0.08" y1="1.14" x2="0.845" y2="-0.206" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#9ac73c"/><stop offset="0.113" stop-color="#88c14f"/><stop offset="0.389" stop-color="#63b579"/><stop offset="0.638" stop-color="#49ad98"/><stop offset="0.85" stop-color="#38a7ab"/><stop offset="0.998" stop-color="#33a6b2"/></linearGradient></defs><g transform="translate(-319.591 -222.884)"><path d="M386.4,247.287c0,7.384-5.624,12.274-14.916,12.274-4.451,0-9.047-1.271-11.591-3.13l3.766-7.335a11.517,11.517,0,0,0,6.7,2.152c3.619,0,5.673-1.565,5.673-3.864,0-2.347-1.908-3.766-4.89-3.766a8.422,8.422,0,0,0-4.3,1.125l-2.69-5.037,7.042-8.51H358.08l5.72-8.313H383.96v6.211l-6.7,7.14C382.835,237.164,386.4,241.418,386.4,247.287Zm-45.013-17.1-7.361,11.042,7.361,11.042,7.361-11.042Zm-2.55,11.042,2.55-3.826,2.55,3.826-2.55,3.825Zm3.819-12.946,3.561-5.342h14.723l-10.923,16.384Zm-9.9,11.042-10.922-16.384h14.723l3.561,5.342Zm7.361,14.849-3.561,5.342H321.839l10.922-16.384Zm9.9-11.042,10.923,16.384H346.222l-3.561-5.342Z" transform="translate(-1.478)" fill="url(#x3g)"/></g></svg>
```

If more than one copy appears on a page, give each `linearGradient` a unique `id` (e.g. `x3g-sidebar`) so the fills don't collide. The mark always uses the full lime→teal ramp — it does not follow the active accent.