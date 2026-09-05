# SentinelX — Design System (v2: "Operational Black" theme)

**This replaces the previous light/teal design system entirely.** The theme below applies to **every page** (`/`, `/dashboard`, `/dashboard/orders/[id]`, `/metrics`, `/audit`, `/about`), not just the landing hero — same colors, fonts, buttons, nav, grain, and entrance-motion language throughout. Only the landing page (`/`) uses the fixed-viewport, no-scroll hero lock described in §7; every other page is a normal scrollable app page that inherits the same visual/motion system.

## 1. Anti-flash-white foundation (apply globally, first thing in the CSS, on every page)

```css
html, body { background: #000000 !important; color: #ffffff; }
```
Root layout body tag also carries `style="background:#000;color:#fff"` as a belt-and-suspenders inline fallback so no page can ever flash white on load, including slow-loading dashboard/metrics pages with charts.
```css
html, body {
  background: #000000;
  background: var(--bg, #000000);
  color: #ffffff;
  color: var(--text, #ffffff);
}
```

## 2. Tokens

```
--bg: #000000
--text: #ffffff
--muted: #9a9a9a
--stat: #d8d8d8
--border: rgba(255, 255, 255, 0.16)
--border-soft: rgba(255, 255, 255, 0.12)

/* semantic risk colors — used as glow/border accents against black, never as flat fills */
--risk-low: #2fbf71
--risk-medium: #e0a336
--risk-high: #e0525a

--logo: 15.5px
--logo-mark: 22px
--nav: 14px
--nav-h: 40px
--btn: 13.5px
--btn-h: 40px
--hero-btn-h: 42px
--h1: 48px
--lede: 15.5px
--badge: 12.5px
--stat-size: 13.5px
--header-y: 22px
--header-x: 40px
--stats-x: 72px
--stats-y: 36px
--hero-gap: 85px
--copy-max: 860px
--lede-max: 470px
```
Responsive scaling of these tokens follows the exact same breakpoint table as the original spec (§9) — reuse it unchanged, it's just a type/spacing scale and isn't theme-specific content.

## 3. Fonts

Self-hosted WOFF2s in `frontend/public/fonts/`:
```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/inter.woff2") format("woff2");
}
@font-face {
  font-family: "Instrument Serif";
  font-style: italic;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/instrument-serif-italic.woff2") format("woff2");
}
```
Fallback if self-hosted files are missing, load:
```
https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900&family=Instrument+Serif:ital@1&display=swap
```
- **UI everywhere** (logo, nav, buttons, badges, body copy, table text, chart labels, KPI numbers): `"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Italic accent word only** (used in the landing H1, and reused sparingly for one emphasized phrase on `/metrics`' false-positive-cost callout — nowhere else): `"Instrument Serif", "Times New Roman", Times, serif`, italic, color `var(--muted)` (`#9a9a9a`) — never white, this is a deliberate muted-serif accent, not a headline color.

Global body rules: `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility;`. Numeric displays (risk scores, ₹ amounts, precision/recall figures, table numbers) use `font-variant-numeric: tabular-nums` everywhere — carried over from v1, still correct here.

## 4. Logo / mark

Reuse a single abstract mark across favicon, header logo, and loading states — same geometry everywhere for brand consistency:
```svg
<svg viewBox="0 0 24 24" fill="currentColor">
  <g transform="rotate(-30 12 12)">
    <circle cx="7.3" cy="3.2" r="1.45"/>
    <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8"/>
    <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8"/>
    <circle cx="16.7" cy="20.8" r="1.45"/>
  </g>
</svg>
```
Favicon: same shape as a white-fill data URI SVG.

Wordmark: **Sentinel** (weight 600) + `<span class="logo-suffix">X</span>` (weight 400, same color, no color change) — mirrors the "brand name + light-weight suffix" pattern cleanly without borrowing any Vesper-specific text.

Header logo: `display: inline-flex; align-items: center; gap: 9px; font-size: var(--logo); font-weight: 600; letter-spacing: -0.03em; color: #fff`, mark sized `var(--logo-mark)`.

## 5. Buttons (shared liquid-glass language — used for every CTA/action on every page: header CTA, hero CTAs, "Simulate New Order," "Send Nudge," modal confirm buttons, filter toggles on `/dashboard` and `/audit`)

Base `.btn`: `position: relative; isolation: isolate; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; height: var(--btn-h); padding: 0 16px; border-radius: 6px; font-size: var(--btn); font-weight: 500; letter-spacing: -0.02em; line-height: 1; white-space: nowrap; cursor: pointer;` transitions on background/border/shadow/color/filter at `0.35s`.

Shine `::after`: `linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 48%, transparent 76%)`, idle `translateX(-130%)`, hover `translateX(130%)` over `0.65s ease`.

**`.btn-solid`** (primary action everywhere — "View Dashboard," "Simulate Order" submit, "Send Nudge" confirm):
```css
background: linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%);
color: #111; border: 1px solid #fff;
box-shadow: inset 0 1px 0 rgba(255,255,255,0.95);
```
Hover: gradient shifts to `#fff → #f3f6ff 42% → #d5def2`, border `#f2f6ff`, `box-shadow: inset 0 1px 0 #fff, 0 0 22px rgba(186,208,255,0.35), 0 8px 18px rgba(255,255,255,0.12)`.

**`.btn-ghost`** (secondary action everywhere — "See a live score," table filter chips, cancel/close in modals):
```css
background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0.45) 50%, rgba(160,175,200,0.08));
color: #fff; border: 1px solid rgba(198,198,198,0.45);
box-shadow: inset 0 1px 0 rgba(255,255,255,0.12);
```
Hover: `rgba(210,225,255,0.18) → rgba(0,0,0,0.35) 48% → rgba(180,195,220,0.16)`, border `rgba(220,230,255,0.75)`, glow `0 0 20px rgba(170,200,255,0.22)`.

Hero-scale buttons (landing page only): height `var(--hero-btn-h)`, padding `0 18px`, ghost variant gets `backdrop-filter: blur(16px)` and a slightly stronger glow (`0 0 24–26px`) — same as the reference spec.

## 6. Navigation — liquid-metal pill, used on every page's header

Every page shares one persistent **top header** (not a sidebar — this replaces the v1 design's left-sidebar recommendation):
`display: grid; grid-template-columns: 1fr auto auto; align-items: center; padding: var(--header-y) var(--header-x) 10px; z-index: 50;` (3-column becomes `1fr auto` when the burger isn't needed, i.e. desktop can drop the third column or leave it empty — keep the grid simple).

**Left:** logo, links to `/`.
**Center:** nav — **Dashboard · Metrics · Audit · About** (maps directly to `03_sitemap_and_pages.md`'s sitemap), each item a liquid-metal pill:
```css
height: var(--nav-h); padding: 0 18px; border-radius: 7px; overflow: hidden; position: relative;
border: 1px solid rgba(198,198,198,0.55);
background: linear-gradient(105deg, #050505 0%, #2a2a2a 48%, #4a4a4a 100%);
color: #f3f3f3; font-size: var(--nav); letter-spacing: -0.01em; white-space: nowrap;
```
Shine `::before` same recipe as buttons, idle `translateX(-120%)`, hover `translateX(120%)` over `0.6s`. Hover state: border `rgba(235,235,235,0.9)`, gradient `#111 → #3a3a3a 45% → #6a6a6a`, glow `0 0 18px rgba(200,210,230,0.18)`. **The active/current page's pill stays permanently in its hover state** (persistent lighter gradient + border) so users always see where they are — this is a necessary addition since the original spec was a single-page site with anchor links; SentinelX is multi-page and needs a persistent "you are here" indicator.

**Right:** header CTA — `View Dashboard` (`.btn-solid`) — hidden/replaced with nothing extra on the `/dashboard` page itself (don't show a button linking to the page you're already on).

**Mobile (≤900px):** burger → full-screen menu exactly as the reference spec: `background: rgba(8,8,8,0.42)` backdrop, open state adds `backdrop-filter: blur(24px)`, nav becomes a full-viewport centered column, links full-width height 56px, `font-size: 19px`, `border-radius: 10px`. Escape / link click / resize ≥901px closes it. `body.menu-open { overflow: hidden }`.

## 7. Landing page (`/`) — the one exception with a fixed-viewport hero

This page alone locks to one screen with no scroll on desktop (`≥901px`): `html, body { height: 100%; overflow: hidden }`, page wrapper `height: 100dvh; overflow: hidden`. On phones (`≤900px`), drop the lock — allow normal scroll, stack sections vertically.

**Layer stack (back → front):** `html/body` black → `.hero-bg` (gradient/grain background layer, see below) → `.page` (`position: relative; z-index: 1; display: grid; grid-template-rows: auto 1fr auto; min-height: 100dvh`) → `.grain` overlay (`z-index: 100`).

**`.hero-bg` — real video, with a guaranteed fallback.** Use the provided hero footage as the background layer, at full opacity with no dark scrim on top (matches the original spec's explicit "100% opacity, no overlay" instruction for this asset — if real footage ever makes the white hero text hard to read, the documented fallback is to add a minimal bottom-edge scrim, but default to none):

```html
<div class="hero-bg-fallback" aria-hidden="true"></div>
<video
  class="hero-bg-video"
  autoplay muted loop playsinline
  aria-hidden="true"
  src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4">
</video>
```
```css
.hero-bg-fallback, .hero-bg-video {
  position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover;
}
.hero-bg-fallback {
  background: radial-gradient(ellipse at 50% 30%, #1a1a1a 0%, #000000 62%);
}
```
The fallback div is always rendered first (so it's present from the very first paint, before the video has loaded, keeping the anti-flash-white guarantee intact) and the video sits on top of it in DOM order, so it visually covers the fallback the moment it starts playing.

**Fallback trigger logic (belt-and-suspenders — don't rely on a single failure signal):**
```js
const video = document.querySelector('.hero-bg-video');
let loaded = false;
video.addEventListener('loadeddata', () => { loaded = true; });
video.addEventListener('error', () => { video.style.display = 'none'; });
setTimeout(() => {
  if (!loaded) video.style.display = 'none'; // network stall / CORS / slow CDN — reveal the gradient fallback
}, 4000);
```
This covers three failure modes: the URL 404s or CORS-blocks (`error` event), the request hangs without ever technically erroring (4s timeout), and the everyday case of it just working (video plays, fallback is invisibly there underneath the whole time in case it ever needs to reappear, e.g. `pause`/network drop mid-session isn't handled here but is an acceptable MVP-scope gap).

**Note on the asset itself:** this is a third-party-hosted URL (someone's CloudFront/user-storage link) that this project doesn't control — it could theoretically be moved or revoked later even if it works today. Once it's confirmed working, download it and commit it into `frontend/public/hero-bg.mp4` (or a free object store like Cloudflare R2's free tier) and point the `src` at that instead — this removes the external dependency entirely and keeps the whole stack self-hosted and free, consistent with `07_hosting_and_deployment.md`'s principles. Keep the CloudFront URL only as a temporary bootstrap value, not the long-term one.

**`.grain` (global, every page, not just landing):** a fixed full-viewport noise texture, implemented with an inline SVG `feTurbulence` filter (no external image needed), `opacity: 0.035`, `mix-blend-mode: overlay`, `pointer-events: none`, `z-index: 100`. Subtle — it should read as "premium texture," not be consciously noticeable.

**Hero content** (bottom-aligned, not vertically centered — `.hero { display: flex; align-items: flex-end; justify-content: center; padding: 8px 24px var(--hero-gap); }`):

- **Badge:** `Operational Risk Infrastructure` — same liquid-metal pill treatment as nav items, `background: linear-gradient(90deg, #7d7d7d 0%, #2a2a2a 52%, #0a0a0a 100%)`, sparkle SVG icon reused unchanged from the reference spec (it's a generic decorative glyph, not brand-specific).
- **H1** (two masked lines, Inter 500, `letter-spacing: -0.045em`, `line-height: 1.12`):
  - Line 1: `Catch <em>risky orders</em> before`
  - Line 2: `they become returns.`
  - `em` = Instrument Serif italic, `font-size: 1.08em`, color `var(--muted)`.
- **Lede** (`max-width: var(--lede-max)`, `color: var(--muted)`, `15.5px`, `line-height: 1.55`):
  `SentinelX scores every COD order in real time and nudges only the highest-risk toward prepaid — never blocking a customer, always logged.`
- **Actions:** `.btn-solid` "View Dashboard" → `/dashboard`; `.btn-ghost` "See a live score" → `/metrics`.

**Stats footer — deliberately rewritten, not copied.** The reference template's stats ("4.2M+ workflows automated," "180+ teams onboarded") are vanity traction numbers appropriate for an established SaaS product. SentinelX is a hackathon MVP with no real usage history, and the whole project's credibility rests on never overstating numbers (see `00_overview.md`'s bar #2 and `08_mvp_scope_and_roadmap.md`). Keep the exact visual treatment (three `.stat` items, icon + label, same flex layout, same `appear--stat` motion) but with honest content instead:

1. **Icon:** reuse the dual-pill icon unchanged. **Label:** `28–35% typical COD RTO rate` (cited industry statistic — the problem being addressed, not a claim about SentinelX's own traction).
2. **Icon:** reuse the download/checkmark tile unchanged. **Label:** `100% test-mode — zero real money moved`.
3. **Icon:** replace the three-avatars icon (it implies onboarded users/teams, which SentinelX doesn't have yet) with a simple inline checklist/log glyph — a rounded rectangle with two short check-marked lines inside, same white fill treatment as the download tile for visual consistency. **Label:** `Every decision logged — view the full audit trail`, and make this stat item a link to `/audit`.

## 8. Applying the theme to the app pages (`/dashboard`, order detail, `/metrics`, `/audit`, `/about`)

These pages are normal scrollable pages (no viewport lock), same header/nav/grain/fonts/buttons as above, plus:

- **KPI cards** (`/dashboard` top strip): black `#0a0a0a` surface, `border: 1px solid var(--border-soft)`, large tabular-nums number in white, label in `var(--muted)` beneath — no card shadow, rely on the border + subtle inner highlight (`inset 0 1px 0 rgba(255,255,255,0.06)`) for depth, consistent with the button/nav "liquid glass" language.
- **Risk badges:** pill-shaped, transparent/near-black fill, colored **border + soft glow** instead of a flat colored fill (flat saturated fills read wrong against pure black) — e.g. high risk: `border: 1px solid var(--risk-high); box-shadow: 0 0 10px rgba(224,82,90,0.35); color: var(--risk-high)`, same pattern for medium/low. Always paired with the text label ("82% High"), per the accessibility rule in §10 — even more important now that color is a glow accent, not a fill.
- **Order table:** dark surface (`#0a0a0a` rows on `#000` page background), `border-bottom: 1px solid var(--border-soft)` between rows, sticky header in `var(--muted)` uppercase small text, no zebra striping (matches the reference spec's restrained table language).
- **"Why flagged" panel** (order detail): the one place besides the landing H1 allowed to use the Instrument Serif italic accent — style the top contributing factor's name in italic serif, `var(--muted)`, inside an otherwise plain white-text card with a `var(--risk-*)`-colored left border matching that order's risk band.
- **Charts on `/metrics`** (Recharts): black background, `var(--border-soft)` gridlines, PR-curve line in white with the chosen threshold marked by a dashed line in the matching risk color, confusion-matrix quadrants as bordered/glowing cells (not filled heatmap blocks) using the same risk-color-as-glow language as the badges.
- **False-positive-cost callout box:** bordered card (not a filled warning box), `var(--muted)` icon, body text in white — this is where the single extra Instrument-Serif-italic emphasis is permitted (e.g., italicizing the phrase "*low-severity*" in "a low-severity false positive") — nowhere else on this page.
- **Audit log table (`/audit`):** same dark table treatment as the order table; expandable rows reveal the JSON payload in a monospace font on a slightly lighter `#111` inset panel.
- **About page:** plain, same typography/color tokens, no special treatment needed — content-focused, not motion-heavy.

## 9. Responsive breakpoints

Reuse the reference spec's breakpoint table verbatim (it's a pure type/spacing scale, not theme-specific): `≥1600`, `≥1920`, `≥2560`, `1280–1599`, `901–1279`, `≥901 + max-height 850/720`, `≤900`, `≤560`. Apply it to every page's header/nav/buttons; apply the hero-specific H1/lede/badge/stats sizing only on `/`.

## 10. Entrance motion (site-wide system, not landing-only)

`.appear` resting opacity is **1** (never blank if animation fails). `animation-duration: 1.05s; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); animation-delay: var(--d, 0.08s)`. On `animationend`, add `.is-in` (freezes final state, removes the animation). JS fallback: after two `requestAnimationFrame`s, if nothing is animating, force `.is-in` everywhere.

Reuse the exact keyframe set from the reference spec (`in-scale`, `in-soft`, `in-mask`, `in-pop`, `in-btn`, `in-side`, `in-stat`, `in-star`, `in-em`) — these are generic, reusable motion primitives.

**Delay choreography, adapted per page:**
- **Landing (`/`):** identical sequencing to the reference spec — logo 0.08s → nav items 0.16/0.28/0.40/0.52s → header CTA 0.34s → badge 0.22s → H1 lines 0.42/0.62s → lede 0.82s (duration 1.25s) → solid CTA 0.96s → ghost CTA 1.10s → 3 stats at 1.12/1.28/1.44s.
- **`/dashboard` on first load:** KPI cards use `appear--stat` at 0.10/0.22/0.34/0.46s (one per card); the order table fades in as a whole with `appear--soft` at 0.30s — don't animate individual table rows, it reads as slow/gimmicky on a data-dense screen.
- **`/metrics`:** each chart/card uses `appear--soft` staggered at 0.15s increments — this is the page where restraint matters most, since the content itself (real numbers) is the credibility signal, not the motion.
- **`prefers-reduced-motion: reduce`:** disable all transitions/animations globally (`* , *::before, *::after { transition: none !important; animation: none !important; }`), force every `.appear` element to its resting visible state immediately.

## 11. Accessibility (unchanged principle, more important on black)

Never rely on color alone for risk level — every badge/glow pairs with a text label. Maintain WCAG-adequate contrast for `var(--muted)` (`#9a9a9a`) text against pure black — it passes for large/secondary text but should not be used for body copy that needs to be read carefully (use white for that; reserve muted gray for captions, labels, and the serif accent). Icon set stays a single consistent library throughout (Lucide or Heroicons), same as v1.
