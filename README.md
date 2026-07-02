# JP-Newman.com

One page. One central question. One continuous story.

A single narrative landing page: a question is introduced, JP shares why he began
asking it, Fulfillionaire presents a new way to think about wealth, the Freedom
Number Calculator gives the visitor a place to begin, and the podcast and
newsletter let them continue the conversation.

**Primary conversion:** Calculate Your Freedom Number.
**Secondary conversion:** the Notes from the Money Mystic newsletter.

---

## Stack

Static HTML, CSS, and vanilla JavaScript. No build step, no framework, no runtime
dependencies. Chosen for performance (near-zero JS), longevity, and a
frictionless deploy to Cloudflare Pages. The page is organized internally as
discrete, reusable pieces (metadata/SEO, portrait, transition statements,
primary CTA, newsletter form, podcast links, footer, numeral motif, analytics)
even though it renders as one continuous document.

```
.
├── index.html            # the whole narrative (Beats 1–5 + footer)
├── assets/
│   ├── css/styles.css     # design system + continuous-background journey
│   ├── js/main.js         # reveals, numeral motif, form, analytics events
│   ├── fonts/             # self-hosted Cormorant Garamond + Raleway (woff2, latin)
│   └── img/               # portrait, OG image, app icons (PLACEHOLDERS — replace)
├── favicon.svg / favicon.ico
├── site.webmanifest
├── robots.txt / sitemap.xml
├── _headers               # Cloudflare Pages: caching + security headers
└── _redirects             # Cloudflare Pages: /freedom-number (fast-follow)
```

---

## Local preview

No tooling required:

```bash
cd jpnewman.com
python3 -m http.server 4321
# open http://localhost:4321
```

(Absolute `/assets/...` paths mean it must be served from the project root, not
opened as a `file://` URL.)

---

## Deploy — Cloudflare Pages

1. Push this repository to its own Git remote (kept separate from
   `Official-Fulfillionaire-Website` — independent deploys, env vars, analytics,
   and domain settings).
2. In Cloudflare Pages, create a project from the repo.
3. Build settings: **Framework preset = None**, **Build command = (empty)**,
   **Build output directory = `/`** (the repo root is the site).
4. `_headers` and `_redirects` are picked up automatically.
5. DNS: recommended to move to Cloudflare at launch, once existing email
   authentication (SPF/DKIM/DMARC), redirects, subdomains, and third-party
   integrations are documented and tested. See Open Items.

---

## Design system

| Token        | Value      | Use                                    |
|--------------|------------|----------------------------------------|
| Forest green | `#0F2E1F`  | primary background, text on cream      |
| Warmer green | `#17402B`  | Beats 2–3 background                    |
| Gold         | `#B8923D`  | primary CTA, footer link, scroll cue, hairlines |
| Cream        | `#F5EFE0`  | Beat 5 + footer background, text on green |

Accessible variants used to meet WCAG AA in context:
`--gold-bright #D4AC55` (gold text on green), `#7E5F1E` (gold text on cream).

**Typography:** Cormorant Garamond (display / headlines / transition lines),
Raleway (body / UI / forms). Both self-hosted as latin-subset variable woff2 and
preloaded. Both are SIL Open Font License, so self-hosting is permitted.

**Continuous background:** the green half of the journey (forest → warmer →
forest for the climax) is a single gradient painted on `<body>`. The resolve to
cream is owned by Beat 5 itself: the forest→cream fade happens inside that
section's top padding (empty space), so forest-colored text always lands on a
solid cream backdrop regardless of how the beats above reflow. This avoids the
document-height-percentage fragility that would otherwise drop dark text onto a
mid-green background at some viewport widths.

**Numeral motif:** one recurring abstract `$` mark, fixed behind the content,
`aria-hidden`. It sharpens from blurred (hero) to fully resolved at the
calculator climax via a scroll-driven `--motif-focus` custom property, then
flips ink to forest over the cream beat. Simplified to a static, faint mark on
small screens and under `prefers-reduced-motion`.

**Motion:** restrained fade-and-rise reveals via IntersectionObserver. Fully
disabled under `prefers-reduced-motion`; content is always visible without JS
(`.no-js` fallback + a global error failsafe).

---

## Analytics

Provider-agnostic. Wire up Plausible (custom events supported) or Cloudflare Web
Analytics. To enable Plausible, uncomment the tagged-events script in
`index.html` `<head>` and set `data-domain`.

Events are dispatched from `main.js` via a safe `track()` wrapper (calls
`window.plausible` and/or pushes to `window.dataLayer` if present; never throws).
Declarative clicks are wired through `data-event` attributes in the markup.

| Event name                         | Fires when                                  |
|------------------------------------|---------------------------------------------|
| `Calculator CTA Click`             | primary "Calculate Your Freedom Number" CTA |
| `Footer Calculator Click`          | footer "Know your number." link             |
| `Newsletter Opt-in`                | newsletter form submitted successfully      |
| `Newsletter Error`                 | newsletter submission failed                |
| `YouTube Click`                    | "Watch on YouTube" link                     |
| `Apple Podcasts Click`             | "Listen on Apple Podcasts" link             |
| `Scroll Depth: Calculator Beat`    | primary calculator beat scrolled into view  |

---

## Newsletter form (GHL)

The form (`#newsletter-form`) is built for the "submit to the GHL endpoint that
triggers the existing double opt-in workflow" option. Configure it in
`assets/js/main.js` → `CONFIG.NEWSLETTER_ENDPOINT`. **Do not** paste a raw
inbound webhook URL into client code — use the GHL-hosted form submit URL.
Until an endpoint is set, the form runs in a safe demo state (validates and shows
the confirmation message without sending).

Alternatively, embed the existing GHL form iframe in place of `#newsletter-form`.

Built-in protections and states: honeypot field (`#company`), minimum-
completion-time defense (`CONFIG.MIN_FILL_MS`), client-side validation, loading /
success / error states, accessible labels and `aria-live` status, and clear
confirmation instructions.

**Applies tag:** `source:jp-newman-newsletter` (sent as the `tag` field).

---

## Freedom Number Calculator

At launch the primary CTA and footer link point to the existing standalone
calculator. The `?source=jp-newman-calculator` query parameter carries the
required attribution so GHL can apply **`source:jp-newman-calculator`**.

Fast-follow: migrate or proxy the calculator to `/freedom-number`. `_redirects`
already stubs that route; swap it for the local page or a Cloudflare Worker proxy
once migrated, and update the two CTA hrefs in `index.html`. Keep results gated
behind the existing email opt-in, but do not require the email before the visitor
has entered enough inputs to see the value of the result.

---

## SEO & sharing

Unique title, meta description, canonical URL, Open Graph + Twitter card tags,
`Person` schema (JSON-LD), favicon/app icons, `site.webmanifest`, `robots.txt`,
and `sitemap.xml` are all in place. Replace the placeholder OG image before
launch (see below).

---

## ⚠️ Placeholders to replace before launch (Open Items)

Search the codebase for `TODO:`. Nothing below is real yet:

1. **Freedom Number Calculator URL** — currently `https://freedom.fulfillionaire.com/`
   (in `index.html` ×2 and `_redirects`).
2. **YouTube URL** — `index.html` (podcast link + footer).
3. **Apple Podcasts URL** — `index.html`.
4. **LinkedIn / Instagram URLs** — footer.
5. **Contact destination** — footer (`mailto:hello@jpnewman.com`).
6. **Privacy policy** — footer links to `/privacy` (page not yet created).
7. **Newsletter GHL endpoint** — `assets/js/main.js` → `CONFIG.NEWSLETTER_ENDPOINT`.
8. **Portrait image** — `assets/img/jp-portrait.{avif,webp,jpg}` are generated
   placeholders. Replace with the approved editorial portrait at the same paths
   and dimensions (960×1200, 4:5), updating the `alt` text.
9. **OG / social-sharing image** — `assets/img/og-image.png` is a placeholder.
10. **App icons** — `assets/img/icon-192.png`, `icon-512.png`,
    `apple-touch-icon.png` are placeholders.

Before launch also: confirm the $2 billion Thrive FP figure and wording; confirm
the GHL sender address is `info@fulfillionaire.com` (not the `.con` typo); verify
both GHL source tags fire; run the full launch checklist in the build spec.

---

## Accessibility & performance notes

- Semantic headings (single H1, section H2s), skip link, keyboard-operable
  controls, visible gold focus rings, labelled fields with useful validation
  messages, decorative motif hidden from assistive tech.
- All foreground/background combinations meet WCAG AA (verified in context,
  including over the gradient).
- Self-hosted subset fonts, preloaded; responsive AVIF/WebP/JPEG portrait with
  explicit dimensions; no animation libraries; minimal deferred JS; no layout
  shift. Targets Lighthouse 95+ across all four categories.
