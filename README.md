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

Posts to the GoHighLevel **inbound webhook** for sub-account
`KV9ByFOi2JhXySNLQzjH` — the same endpoint fulfillionaire.com uses, so signups
from both sites land in one place and run the same workflow. Tagged
`fulfillionaire newsletter`, with an extra `source: jp-newman.com` field so the
two sites can be told apart.

**Why a hidden iframe and not `fetch()`.** The webhook sends no CORS headers, so
a `fetch()` is blocked by the browser and the signup is silently lost. A form
POSTing into a hidden iframe is an ordinary navigation, which CORS does not
apply to. The response cannot be read back, so success is assumed once the POST
is away. fulfillionaire.com does the same thing for the same reason.

### Bot protection — what is real and what is not

Four layers, in descending order of how much they actually do:

1. **Double opt-in** (GHL workflow). The only one that truly keeps the list
   clean: a bot can submit, but it never clicks the confirmation link, so it
   never becomes a subscriber.
2. **Honeypot field** (`#company`) — hidden from people, filled by naive bots.
   Fails silently so a scraper learns nothing.
3. **Minimum fill time** (`CONFIG.MIN_FILL_MS`, 2.5s) — catches instant submits.
4. **Cloudflare Turnstile** — rendered, and **enforced**: the submit handler
   calls `turnstile.getResponse()` and refuses to send without a token, which is
   the step fulfillionaire.com is missing (it renders the widget but never reads
   the token, so there it blocks nothing).

**The honest limit on Turnstile here.** This is a static site with no backend, so
there is nothing to *verify* the token against — Cloudflare's siteverify call
needs a server. Requiring the token stops bots that will not solve the challenge
in a real browser; it does not stop one POSTing straight to the webhook. The
token is forwarded as `cf-turnstile-response` so server-side verification can be
added later without touching the form. **Double opt-in remains the real defence.**

## ⚠️ Open items — nothing below is verified

Search the codebase for `TODO:`.

**Resolved — destinations now live**
- Freedom Number calculator -> `fulfillionaire.com/freedomnumber/` (3 places)
- Join the community -> `fulfillionaire.com/workshop`. Now the primary CTA in the
  Fulfillionaire box, with Find Your Number demoted to secondary.
- Apple Podcasts, LinkedIn, Instagram -> real destinations
- Contact and speaking enquiries -> `info@fulfillionaire.com`
- Privacy and Terms -> real pages at `/privacy/` and `/terms/`
- Personal Investments and Newman Private Advisory -> deliberately NOT links;
  both render as `.card--static` with no hover affordance

**Still open**
1. **Turnstile hostname — the widget does not work yet.** The site key
   `0x4AAAAAAEbyjqgotwk3KByF` is copied from fulfillionaire.com and is scoped to
   that domain, so on any other host it creates its container and hidden input
   but **renders no iframe**, and `getResponse()` throws. Until the hostname is
   added in Cloudflare (Turnstile -> the widget -> Hostname Management), add
   `jp-newman.com`, `www.jp-newman.com` and the GitHub Pages preview host,
   Turnstile contributes **nothing** on this site. The code fails open on
   purpose: when the widget has not rendered the check is skipped, so visitors
   can still subscribe rather than being locked out by a broken widget.
2. **Governing law** — `terms/index.html` assumes Texas because Thrive FP is
   Austin-based. Confirm or replace.
3. **Legal review** — the privacy policy and terms were written to match what the
   site actually does (no cookies, no analytics, no trackers; first name and email
   only, and only on subscribe). Accurate, but not lawyer-drafted.
4. **`$2B` vs `$1.4B`** — the Thrive FP card says "more than $2 billion of
   transactions since 2011"; the bio says "more than $1.4 billion in transaction
   volume". Both are live on the page. One is wrong.
5. **Podcast rating** — the block held an invented 4.9 and was REMOVED rather than
   shipped. Restore only with a real rating and review count; markup is commented
   in place.
6. **Newsletter cadence** — the proof list and form note both claim one email a
   week. Confirm or reword.
7. **Quote attribution** — confirm the closing line is JP's.
8. **Topic marquee** — scrolls abstract themes. Guest names would be stronger
   proof; needs ~10 recognisable names to fill the loop.

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
