# JP-Newman.com

A personal brand hub. One page, nine bands, one question underneath all of them.

The architecture is modelled on the best-in-class personal-brand site
(diamandis.com): a sticky nav over a full-bleed portrait hero, then alternating
full-width bands — belief, work, a featured framework, podcast, newsletter,
speaking, impact, about — closing on a quote and a dark footer.

The *visual language* is deliberately not a copy. See **Design system** below.

**Primary conversion:** Find your Freedom Number.
**Secondary conversion:** JP's Fulfillionaire Newsletter.
**Featured property:** Fulfillionaire, given its own colour band and framed
feature box — the equivalent of the Abundance Summit box on diamandis.com.

---

## Stack

Static HTML, CSS and vanilla JavaScript. No build step, no framework, no runtime
dependencies. Deploys to Cloudflare Pages as-is.

```
.
├── index.html             # the whole page
├── assets/
│   ├── css/styles.css     # design system + all 22 sections, in order
│   ├── js/main.js         # nav, drawer, scroll spy, reveals, form, analytics
│   └── img/               # portrait, OG image, app icons (PLACEHOLDERS — replace)
├── favicon.svg / favicon.ico
├── site.webmanifest
├── robots.txt / sitemap.xml
├── _headers               # Cloudflare Pages: caching + security headers
└── _redirects             # Cloudflare Pages: /freedom-number
```

---

## Local preview

```bash
python3 -m http.server 4321
```

Then open <http://localhost:4321>. Absolute `/assets/...` paths mean it must be
served from the project root, not opened as a `file://` URL.

---

## Design system

The reference site is cold tech: pure white, electric blue, **condensed** caps.
This site is about wealth, meaning and enough — so every axis is inverted while
the underlying structure is kept.

| Axis | Reference | This site |
|---|---|---|
| Display type | Condensed gothic | **Expanded** heavy grotesque (`wdth 112`) |
| Accent | Electric blue | **Brass** `#C8922F` |
| Light ground | Pure white | Warm bone `#F2EEE6` |
| Corners | Rounded cards | Crisp 4px + hairline keylines |
| Texture | Flat | Film grain on dark bands |

### Tokens

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0B0F0E` | dark bands, footer, form |
| `--moss` | `#16302A` | the Fulfillionaire band only |
| `--bone` | `#F2EEE6` | hero, secondary light bands |
| `--paper` | `#FAF8F3` | primary light bands |
| `--brass` | `#C8922F` | buttons, rules, accents |
| `--brass-band` | `#D8A63C` | the gold quote band |

Accessible variants, because brass at full strength fails contrast in one
direction or the other: `--brass-bright #E2B75F` for brass text **on dark**, and
`--brass-deep #7A5A16` for brass text **on light**. Use the token that matches
the ground; never `--brass` for body-size text.

### Type

- **Archivo** (variable, `wdth` axis) — display. Expanded and heavy is the whole
  signature; if you swap this face, keep a width axis.
- **Inter** — body and UI.
- **Instrument Serif italic** — used sparingly, for emphasis lines and the quote.
  This is the site's voice. Do not let it spread into body copy.

All three load from Google Fonts. To drop the third-party request, self-host the
latin-subset woff2 files and replace the `<link>` in `<head>`.

### Signature devices

- **Numbered sections** (`01 / WHAT I BELIEVE`) — the wayfinding spine.
- **Hairline grids** — cards butt together, separated by 1px of grid background,
  rather than floating as separate rounded cards.
- **Offset brass keylines** framing both portraits.
- **Corner ticks** on the Fulfillionaire box.
- **One gold band** as the climax, immediately before the footer. Only one.

### Photography

All site photography is greyscaled in CSS. The photos arrive from different
shoots at different times; without a unifying treatment a stage shot, a studio
portrait and an episode thumbnail fight each other. Two portraits carry an
offset brass keyline, so the frame device recurs rather than appearing once.

Episode thumbnails are the channel's own artwork, stored locally under
`assets/img/episodes/<videoId>.*` rather than hotlinked from YouTube. They are
held in greyscale and released to full colour on hover, the same behaviour as
the speaking-stage logo wall.

### Motion

Fade-and-rise reveals via `IntersectionObserver`, plus a CSS marquee of podcast
themes. Everything is disabled under `prefers-reduced-motion`. Content is always
visible without JS (`.no-js` fallback plus a global `error` failsafe).

---

## Page structure

| # | Band | Ground | Purpose |
|---|---|---|---|
| — | Hero + speaking-stage logo wall | bone | Positioning, both CTAs, credibility |
| 01 | What I believe | ink | Point of view, signature |
| 02 | What I'm building | paper | Five cards, Fulfillionaire centred as the organising idea |
| 03 | **Fulfillionaire** | moss | Featured framework + four dimensions |
| 04 | The Fulfillionaire Podcast | ink | Podcast, rating, episodes, theme marquee |
| 05 | JP's Fulfillionaire Newsletter | paper | Newsletter + opt-in form |
| 06 | Speaking | bone | Keynotes and workshops, copy + photo |
| 07 | Meet JP | paper | Portrait + biography |
| — | Footer | ink | Link columns, social |

A gold quote band ("The goal was never more…") sat between Meet JP and the
footer, and a "Know your number." CTA row opened the footer. Both removed.
The `.quote` / `.on-gold` and `.footer__cta` styles remain in `styles.css`.

A "By the numbers" impact-stats band sat between Work with JP and Meet JP and was
removed. Its CSS is retained (section 15 of `styles.css`) so the band can be
restored by pasting the markup back in.

---

## Analytics

Provider-agnostic. Uncomment a Plausible (or equivalent) script in `<head>` to
enable. Events fire through a `track()` wrapper in `main.js` that calls
`window.plausible` and/or pushes to `window.dataLayer` if present, and never
throws. Declarative clicks are wired via `data-event` attributes in the markup.

| Event | Fires when |
|---|---|
| `Freedom Number Click` | any of the three calculator CTAs |
| `Fulfillionaire Click` | the Fulfillionaire feature CTA |
| `Newsletter Opt-in` | newsletter submitted successfully |
| `Newsletter Error` | newsletter submission failed |
| `YouTube Click` / `Apple Podcasts Click` | podcast links |
| `Speaking Enquiry` / `Advisory Enquiry` | the two-up CTAs |

---

## Newsletter form

Configure `CONFIG.NEWSLETTER_ENDPOINT` in `assets/js/main.js`. Use the
GHL-hosted **form submit URL** — do not paste a raw inbound webhook into client
code. Until an endpoint is set the form runs in a safe demo state: it validates
and shows the confirmation copy without sending anything.

Protections: honeypot field, minimum-completion-time guard
(`CONFIG.MIN_FILL_MS`), client-side validation, loading/success/error states,
labelled fields and an `aria-live` status. Applies tag
`source:jpnewman-newsletter`.

---

## ⚠️ Open items — nothing below is verified

Search the codebase for `TODO:`.

**The work (section 02)**
1. **Personal Investments** — the only card with no destination. Renders as a
   non-linking `.card--static`. Convert to `<a class="card" href="…">` and re-add
   the `.card__more` line once a URL exists.
2. **Newman Private Advisory** — points at the advisory panel in section 06.
   Confirm, or give it a dedicated destination.

Fulfillionaire is the organising idea, so `.card--feature` holds the centre
column in moss (tying it to the band below) while the other four flank it.
Placement is by **named grid area** (`mid`, `one`–`four`), assigned once by
`:nth-child`; each breakpoint redefines only `grid-template-areas`. To reorder
or add a card, change the template and the `:nth-child` assignment — never the
DOM order alone, which is deliberately mission-first for screen readers.

**Copy and figures**
5. **`$2B+` real estate transacted since 2011** — appears twice. Confirm the
   figure and the wording.
6. **Podcast rating** — the block held an invented 4.9 and has been REMOVED
   rather than ship a fabricated number. Commented markup and the `.rating`
   styles remain; restore only with a real rating and review count.
7. **Episode 01 guest name** — the other three rows credit their guest; the
   Whole Foods episode has a `TODO` where the name goes.
8. **Podcast name** — set to "The Fulfillionaire Podcast". Confirm the exact
   published title and update the artwork/branding to match.
9. **Quote attribution** — confirm the closing line is JP's, or swap it.
10. **Newsletter cadence** — the proof list and form note both claim one email
    a week. Confirm, or reword.
11. **Topic marquee** — currently scrolls abstract themes (FREEDOM, LEGACY,
    TIME…). Guest names would be far stronger proof; needs ~10 recognisable
    names to fill the loop.

**Speaking-stage logo wall** — live, five logos. See
`assets/img/logos/README.md` for how to add more.

**URLs**
11. Freedom Number calculator (×4, including `_redirects`).
12. Fulfillionaire destination.
13. Apple Podcasts. (YouTube is live: `@fulfillionaire`.)
14. LinkedIn and Instagram.
15. Contact / speaking / advisory address — currently `hello@jpnewman.com`.
16. `/privacy` and `/terms` — linked in the footer, pages not yet created.

**Images**
17. **Hero portrait resolution — the weakest asset on the page.** `jp-portrait.*`
    comes from `JP Newman Headshot 3.jpg`, whose source is only **400×400**. The
    4:5 crop leaves 320px of real detail, resampled up to 640×800 with a light
    unsharp pass. It displays at 412px, so on a 1× screen it is acceptable; on a
    2× retina screen the browser is stretching 320px of true detail across 824
    device pixels and it will look soft. **A high-resolution original of this
    same shot would fix it outright** — the framing is good, only the pixels are
    short. `JP Newman Headshot 2` (800×1067) is sharper and now used in
    section 01.
18. Each of the three portraits uses a different source photo (hero = Headshot 3,
    belief = Headshot 2, about = Headshot 1), so none repeats.
19. **Speaking photo resolution** — `speaking.*` is the supplied keynote shot,
    cropped 4:5 from a 683×1024 source. It displays around 400px wide, so it is
    roughly 1.7×: fine on standard displays, slightly soft on 2× retina.
20. **OG image** — `assets/img/og-image.png` is generated. Replace with artwork.
21. **App icons** — `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`.

---

## Going live

**In plain terms:** the site lives at **jp-newman.com**, replacing the WordPress
site that is there now. The domain stays registered at GoDaddy. All that changes
is one setting telling the internet "the files are over here now."

Neither jp-newman.com nor jpnewman.com has MX records, so **no email runs on
this domain** and DNS changes cannot break any mailbox. (jpnewman.com, without
the hyphen, belongs to a different JP Newman. It is not ours.)

### 1. Put the code on GitHub

Create an empty repo, then push. Nothing goes live at this step.

### 2. Connect a host

Netlify or Cloudflare Pages. Both are free, both read the `_headers` and
`_redirects` files in this repo, and both redeploy automatically on every push.

Settings: **framework preset None**, **build command empty**, **publish
directory `/`**. There is no build step — the repo root is the site.

**Netlify is the easier of the two here.** GoDaddy cannot point a root domain
at a host via CNAME, and Netlify provides a plain A record for the apex.
Cloudflare Pages generally wants the domain's nameservers moved to Cloudflare
first: better long term, more moving parts on launch day.

### 3. Test on the free preview URL

Both hosts give you a `*.netlify.app` / `*.pages.dev` address. **Everything gets
checked there before DNS is touched** — on a phone as well as a laptop. The live
site is still untouched at this point, so there is no rush.

### 4. Clear the launch blockers

See Open Items below. The newsletter form currently validates and shows its
success message but **sends nothing**, and several links point at placeholders.

### 5. Point the domain

In GoDaddy's DNS panel, change the **A record** for the root and the **CNAME**
for `www` to the values the host gives you.

**Do not touch MX or TXT records.** There is no email today, but those records
are also where SPF/DKIM/DMARC live if email is ever added.

Allow up to a few hours for DNS to propagate. HTTPS certificates are issued
automatically by both hosts once the domain resolves.

### 6. Afterwards

Once the new site is confirmed live, the old **GoDaddy WordPress hosting plan
can be cancelled** — it is no longer serving anything. Cancel the *hosting*,
not the *domain registration*: losing the domain would take the site down.

### Old URLs

The retired WordPress site had 22 live URLs (homepage, `/podcast-episodes/`,
and 20 episode posts). `_redirects` maps every one of them onto the new site so
shared links and search results do not land on an error page, with a catch-all
for anything unlisted. Nothing further is needed for the retirement.

## Accessibility & performance

Semantic headings (single H1, section H2s), skip link, keyboard-operable menu
with `aria-expanded` and Escape-to-close, visible brass focus rings, labelled
fields with useful validation, decorative marquee and ticks hidden from
assistive tech. Foreground/background pairs use the ground-appropriate brass
token to hold WCAG AA. Responsive AVIF/WebP/JPEG portraits with explicit
dimensions, no animation libraries, ~5KB of deferred JS, no layout shift.
