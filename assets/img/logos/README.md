# Speaking-stage logos

Five live, sliced from the supplied `Credibility Logos.png` composite:

| File | Stage | Native |
|---|---|---|
| `baby-bathwater-institute.*` | Baby Bathwater Institute | 563×408 |
| `summit.*` | Summit | 396×368 |
| `i-am-creation-summit.*` | I Am Creation Summit | 427×425 |
| `happy-hustle.*` | Happy Hustle | 730×238 |
| `impact-makers-party.*` | Impact Makers Party | 869×150 |

Each is a trimmed PNG with transparency, plus a WebP.

## Adding one

Drop the file here and copy a `<li class="logowall__slot">` in `index.html`.
Transparent PNG or SVG; anything from square to about 6:1 works.

## Why there are no fixed boxes

These marks run from 1:1 to nearly 6:1. A fixed-size box would render the square
ones tiny and the wide ones huge. Instead the CSS applies **both** a `max-height`
(3rem) and a `max-width` (9rem): tall shapes hit the height cap, wide shapes hit
the width cap, and every mark lands at similar visual weight — no per-logo rules,
and a new logo of any proportion slots in without tuning.

Logos sit at 50% opacity in greyscale and go to full colour on hover, the same
treatment as the podcast episode thumbnails.
