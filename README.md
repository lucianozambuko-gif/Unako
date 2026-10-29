# Unako GBV Foundation — website

Static website for **Unako GBV Foundation**, a non-profit building a youth development and gender-based-violence support centre for Mount Frere, Eastern Cape, South Africa.

Live site (once GitHub Pages is enabled): https://lucianozambuko-gif.github.io/Unako/

## Structure

Plain HTML/CSS/JS, no build step or framework required.

```
index.html           Home (hero, reel, "know the signs" flip cards, youth & sport gallery)
about.html           About Unako, the founder, and who's involved
support.html         Breathing space, "Where do I start?" finder, the seven services, healthy vs warning signs, consent
centre.html          What a visit will look like, the wishlist, and the interactive build/pledge tool
get-involved.html    Donate / volunteer / partner
contact.html         Founder contact details + national safety helplines
404.html             Custom not-found page (used by GitHub Pages)
assets/css/style.css Shared styles (light + dark mode via prefers-color-scheme)
assets/js/main.js    All interactivity (see below); no libraries
assets/images/       Site images (logo/emblem; community/ holds the youth sport photos)
assets/media/        Intro reel (unako-reel.mp4, 1080x1080, no audio) and its poster frame
reference/           Original source materials (founding brief PDF, first single-page draft)
```

## Interactive features

Everything is vanilla JS in `assets/js/main.js`. Each feature only runs if its markup is on the page. All of it is progressive: with JS off, content stays visible and static. Animation is switched off for visitors with `prefers-reduced-motion`.

- **Scroll effects**: a progress bar, a header that shrinks as you scroll, and sections that reveal on scroll.
- **Calm design**: warm ivory and muted plum palette (tokens at the top of `style.css`), slow eased motion with no springs, soft drifting glows behind the hero headers, and rounded floating `section.panel` blocks.
- **Home hero**: the headline fades in word by word, and the emblem floats in a soft halo.
- **Know the signs** (home): flip cards built as `<button aria-pressed>`.
- **Reel** (home): click-to-play with `preload="none"`, so phones don't download 1.7 MB unless asked.
- **Gallery** (home): opens in a lightbox using native `<dialog>`, with arrow keys for previous/next.
- **Breathing space** (support page): an optional, user-started breathing guide (in 4, hold 4, out 6) that stops when the tab is hidden.
- **Support finder** (support page): a two-step guided question flow. Answers are not stored or sent anywhere (POPIA). To change the questions or results, edit the `flow` and `results` objects in `main.js`. Result `services` point at the `svc-*` ids in `support.html`.
- **Centre builder** (centre page): each checklist item's `value` matches a `.piece[data-piece]` in the SVG, and `data-cost` is in rands. "Pledge" opens a pre-filled `mailto:` to the founder.

## Running locally

No build tools needed — open `index.html` directly in a browser, or serve the folder locally, e.g.:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Deployment

The site is plain static HTML, so it deploys as-is to GitHub Pages, Netlify, Vercel, or any static host. For GitHub Pages: Settings → Pages → Deploy from branch → `main` / `/ (root)`.

## Content source

Page copy is based on the foundation's founding brief (`reference/unakho-gbv-foundation-brief.pdf`) provided by founder Lindokuhle Kentane.
