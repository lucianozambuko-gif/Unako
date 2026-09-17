# Unako GBV Foundation — website

Static website for **Unako GBV Foundation**, a non-profit building a youth development and gender-based-violence support centre for Mount Frere, Eastern Cape, South Africa.

Live site (once GitHub Pages is enabled): https://lucianozambuko-gif.github.io/Unako/

## Structure

Plain HTML/CSS/JS, no build step or framework required.

```
index.html          Home
about.html           About Unako, the founder, and who's involved
support.html         The seven support services on offer
centre.html          What a visit will look like, the build wishlist, cost estimates
get-involved.html    Donate / volunteer / partner
contact.html         Founder contact details + national safety helplines
404.html             Custom not-found page (used by GitHub Pages)
assets/css/style.css Shared styles (light + dark mode via prefers-color-scheme)
assets/js/main.js    Mobile navigation toggle
assets/images/       Site images (logo/emblem)
reference/           Original source materials (founding brief PDF, first single-page draft)
```

## Running locally

No build tools needed — open `index.html` directly in a browser, or serve the folder locally, e.g.:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Deployment

The site is plain static HTML, so it deploys as-is to GitHub Pages, Netlify, Vercel, or any static host. For GitHub Pages: Settings → Pages → Deploy from branch → `main` / `/ (root)`.

## Safety note

The quick-exit bar at the top of every page lets a visitor leave the site instantly if it's not safe to be browsing it. Please don't remove it.

## Content source

Page copy is based on the foundation's founding brief (`reference/unakho-gbv-foundation-brief.pdf`) provided by founder Lindokuhle Kentane.
