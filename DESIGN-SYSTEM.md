# Reblooma design system — "Matte Stone"

The single reference for building new Reblooma pages. Everything here is already implemented in
`assets/tailwind.config.js` (tokens), `assets/site.css` (components) and `assets/site.js` (behaviour).

**Feel:** quiet, printed, clinical-but-warm. Paper tones, a serif for anything that speaks, small
caps for labels, and colour used almost nowhere — so the one gradient means something when it appears.

---

## 1. Colour

### Surfaces (a stack, lightest on top)

| Token | Hex | Used for |
|---|---|---|
| `surface-container-lowest` | `#ffffff` | Documents, the inside of a "paper" element |
| `surface` / `background` | `#fcf9f6` | Alternate section band |
| `surface-tier-1` | `#f3f0ed` | **Cards.** The default raised surface |
| `surface-tier-2` | `#efebe7` | Quiet bands behind cards |
| `surface-stone` (page) | `#e4deda` | The page background (`body`) |
| `surface-container` | `#f0edea` | Footer |
| `navy-deep` | `#243546` | Dark feature bands (practitioner page) |
| `primary` / `ink` | `#000000` / `#16181a` | Ink, dark CTA bands, buttons |

Sections alternate `#e4deda` → `#fcf9f6` → `#f3f0ed` to separate ideas without rules or shadows.

### Text

| Use | Value |
|---|---|
| Headings, key figures | `#16181a` (`text-ink`, `text-primary`) |
| Body | `text-on-surface-variant` `#44474a`, or `text-ink/62` |
| Muted labels, footnotes | `text-ink/42` |
| On dark navy | `#ffffff` headings, `#959ea8` body, `#87cbf2` labels |

`opacity-42` and `opacity-62` are custom steps in the Tailwind config. They exist because the
Stitch exports use them; keep using 42 / 62 / 80 rather than inventing new ones.

### Brand assets

The files are in `assets/brand/`. **Pick by background; there is nothing to
resolve at render time.**

| File | What it is | On |
|---|---|---|
| `reblooma-mark.png` | The lotus alone, gradient | anything &mdash; the gradient reads on light and dark |
| `reblooma-lockup-dark.png` | Lotus + wordmark, dark wordmark, padded | **light** backgrounds |
| `reblooma-logo.png` | The same lockup, tightly cropped | light backgrounds, where padding wastes space |
| `reblooma-wordmark-light.png` | Wordmark only, white, 264&times;44 | **dark** backgrounds only |

**The white wordmark is white**, and a surface that put it on a white card
rendered an invisible logo. That is the whole rule.

**The wordmark is one solid colour and carries no accent letter.** The colour
lives in the lotus. A rule that would have turned one letter teal was deleted on
20 September; no markup had ever used it.

**Still missing:** a light LOCKUP &mdash; lotus plus white wordmark &mdash; for
dark heroes and email headers. Only the wordmark-alone light version exists, and
at 264&times;44 it does not scale.

---

### The one accent

```css
linear-gradient(120deg, #3498db, #8e44ad)   /* blue → purple */
```

- `.brand-gradient-text` — gradient on text
- `.savings-bar-gradient` — gradient on a filled bar

**Spend it on money and proof only:** savings figures, the pre-tax bar, "coming soon", a few
key words in a pull quote. Never on a button, never on a whole heading, and at most twice per screen.

### Borders

`rgba(22, 24, 26, 0.08)` (`outline-muted`, `border-primary/10`) — hairlines everywhere.
Cards have a 1px border and `shadow-sm`, never a big shadow.

---

## 2. Type

**Lora** (serif) for anything that speaks. **Source Sans 3** for anything that labels or instructs.

| Token | Size / line-height | Family | Use |
|---|---|---|---|
| `display-lg` | 48px / 1.1, -0.02em, 500 | Lora | Page H1, pull quotes |
| `display-lg-mobile` | 32px / 1.2, 500 | Lora | Same, under `md` |
| `headline-md` | 32px / 1.3, 500 | Lora | Section H2 |
| `headline-sm` | 24px / 1.4, 500 | Lora | Card titles, FAQ questions |
| `body-lg` | 18px / 1.6, 300 | Source Sans 3 | Hero paragraph |
| `body-md` | 16px / 1.5, 400 | Source Sans 3 | Body |
| `label-caps` | 12px / 1, 0.05em, 600 | Source Sans 3 | Eyebrows, nav, footnote labels |
| `ui-button` | 14px / 1, 600 | Source Sans 3 | Buttons |

Rules:
- Always pair the mobile and desktop display sizes:
  `class="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg"`
- Eyebrow labels are uppercase with `tracking-widest` and `text-ink/42`.
- Body copy caps at roughly 46–68 characters (`max-w-xl`, `max-w-[720px]`).
- Italic Lora is for the human voice: pull quotes, the founder letter, "one letter, twelve months".
- Numbers that matter are Lora, 1.9rem–3rem, often gradient.

---

## 3. Layout & spacing

| Token | Value |
|---|---|
| `container-padding` | 24px (side gutter, every section) |
| `section-gap` | 96px (desktop vertical rhythm) |
| `section-gap-md` / `-sm` | 64px / 52px |
| `gutter` / `base` | 16px / 8px |

Widths:
- `max-w-7xl` — full-bleed sections on the home page
- `max-w-[1080px]` — practitioner page sections
- `max-w-[720px]` — reading columns: FAQ, essays, timelines
- `max-w-5xl` / `max-w-md` — pricing cards / modal

Section boilerplate:

```html
<section class="bg-[#f3f0ed] border-y border-primary/5 py-[52px] sm:py-[64px] md:py-section-gap">
  <div class="max-w-7xl mx-auto px-container-padding"> … </div>
</section>
```

**Radius:** `rounded-[4px]` on everything. The Tailwind scale is deliberately tiny
(`DEFAULT` 2px, `lg` 4px, `xl` 8px, `full` 12px), so `rounded-full` is a squircle, not a pill.

---

## 4. Components

### Buttons

```html
<button class="btn-primary font-ui-button text-ui-button px-6 py-3">Join the waitlist</button>
<button class="btn-secondary font-ui-button text-ui-button px-6 py-3">See how it works</button>
```

- `.btn-primary` — ink `#16181a`, white text, 4px radius, 600 weight
- `.btn-secondary` — transparent, 1px ink border
- On navy: white background, `#243546` text
- Practitioner-page CTAs are uppercase with `tracking-wider`; patient-side CTAs are sentence case.
  Keep that split: it reads as trade tool versus consumer product.

### Card

```html
<div class="bg-[#f3f0ed] border border-[#16181a]/[0.08] rounded-[4px] shadow-sm p-8">
```

Inside, in order: eyebrow label → heading → body → hairline → list → CTA pinned with `mt-auto`.

### Tick list

```html
<li class="flex items-start gap-3">
  <span class="material-symbols-outlined text-primary text-[18px] mt-0.5">check</span>
  <span class="font-body-md text-body-md text-on-surface-variant">…</span>
</li>
```

### FAQ (one style across the whole site)

`<details>` + `<summary>`, hairline between rows, first one `open`, and a thin `+` / `–`:

```html
<span class="text-2xl font-light group-open:hidden">+</span>
<span class="text-2xl font-light hidden group-open:block">–</span>
```

Never use a rotating icon.

### Footnotes

Numbered superscripts in body copy, with matching numbered notes in the footer at
`0.70rem` / `text-ink/42`. Every number, claim about money, and legal statement gets one.

### Dark band

`bg-[#243546]` (practitioner) or `bg-primary` (home) with a 56×3px gradient tab in the top-left
corner. Used at most once per page, for the argument you most want remembered.

### Icons

Material Symbols Outlined for UI (check, close, arrow_forward, menu). Hand-drawn 1.5px-stroke
SVGs for concept icons in step sections. Don't mix the two in one row.

---

## 5. Motion

Slow, almost unnoticeable. 6s document glow cycle, 3s money-flow dots, 0.3s hover transitions.
Everything animated is wrapped by `@media (prefers-reduced-motion: reduce)`.
No entrance animations, no parallax, no counters that tick up.

---

## 6. Behaviour (`assets/site.js`)

Any element opens the waitlist modal with a data attribute — never write your own form:

| Attribute | Behaviour |
|---|---|
| `data-waitlist` | Asks patient or practitioner first |
| `data-waitlist="patient"` | Skips to contact details |
| `data-waitlist="practitioner"` | Skips, and shows practice fields |
| `data-waitlist="testing"` | Practitioner with "testing practice" pre-ticked |
| `data-waitlist="consult"` | Patient; hands off to Dr. B after capture |
| `data-cta="hero"` | Label recorded against the lead in GoHighLevel |

Deep links: `#waitlist`, `#waitlist-patient`, `#waitlist-practitioner`, `#waitlist-testing`.
Config (`waitlistWebhook`, `consultationUrl`) sits at the top of the file.

---

## 7. Page skeleton

```
<head>  tailwind CDN → assets/tailwind.config.js → fonts → assets/site.css → assets/site.js (defer)
<body>  .texture-overlay → top bar → sticky header + mobile menu
        <main class="relative z-20"> … </main>
        footer: footnotes → three columns → disclaimer
```

Header and footer are duplicated per page on purpose (static hosting, no build step). Change one,
change all four. Nav items live in the build helper at the top of each page's markup.

---

## 8. Rules of thumb

**Do**
- Alternate section backgrounds instead of adding borders or shadows
- Keep one idea per section, stated in the H2
- Put every number next to the assumption behind it
- Use the gradient only for savings and proof
- Let text breathe: 52px of vertical padding on mobile, 96px on desktop

**Don't**
- Add a new colour. If something needs emphasis, use weight, size or the gradient
- Use pill buttons, heavy shadows, or a radius above 8px
- Write "spa day", "pamper", "relax" in product copy, or promise reimbursement
- Use the gradient on a button or a full heading
- Set body text below 16px, or grey below `/42`

---

## 9. Voice

Plain, specific, unhurried. Short declaratives. The best lines on the site are structural:
"The setting was never the test." "You never discount. Their tax rate does it for you."

- Say the limit out loud: what doesn't qualify, who decides, what we don't do.
- Never promise reimbursement; the plan administrator decides.
- Practitioner pages talk about money and time. Patient pages talk about care and paperwork.
- No exclamation marks. No "revolutionary". No emoji.
