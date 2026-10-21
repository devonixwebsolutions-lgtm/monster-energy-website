# Monster — Unleash the Beast

A responsive Monster Energy design concept based on the supplied 18-second reference reel. It recreates the reel's section progression: a rotating hero object, opening and reassembly, a can reveal, scalloped color transitions, three flavor panels, stacked lifestyle photographs, product panels, and an oversized closing screen.

## Run locally

Serve the repository folder with any static web server. JavaScript modules require HTTP rather than opening the HTML through `file://`.

```sh
python -m http.server 8080 --directory .
```

Then open `http://localhost:8080`.

## Files

- `index.html` — sections and accessible dialogs
- `styles.css` — black and green design, mobile layout, and reduced motion
- `app.mjs` — scroll choreography and interactions
- `can.mjs` — Three.js can geometry, label mapping, studio lighting, and opening animation
- `state.mjs` — product data, animation keyframes, and flavor pack state
- `assets/` — local fonts, scripts, official product art, and lifestyle photography

The pack is a browser-local flavor list. The retailer links point to Monster's official website. There is no payment or checkout service.

## Asset and product sources

Product artwork, logo, photography, and verified U.S. 16 fl oz product facts: Monster Energy's official website.

- https://www.monsterenergy.com/en-us/
- https://www.monsterenergy.com/en-us/energy-drinks/monster-energy/original-green/
- https://www.monsterenergy.com/en-us/energy-drinks/monster-energy/zero-sugar/
- https://www.monsterenergy.com/en-us/energy-drinks/zero-sugar/ultra-paradise/
- https://www.monsterenergy.com/en-us/skateboard/monster-energy-sweeps-sls-paris-2026-street-skateboarding-podium/
- https://www.monsterenergy.com/en-us/2-wheel/monster-energy-riders-deliver-standout-results-at-2026-motocross-of-nations/

Fonts: Anton, Barlow Condensed, and DM Sans from Google Fonts. Bundled animations: GSAP 3.13.0, ScrollTrigger 3.13.0, and Three.js 0.180.0. Their licensing information is retained in the supplied scripts; see their respective projects for usage terms. Monster Energy trademarks and imagery remain the property of their owners. This site identifies itself as an independent concept.


## GitHub Pages

This export is ready for a public GitHub Pages project site. In repository Settings → Pages, choose Deploy from a branch, select main and /(root), then save. The .nojekyll file keeps the plain HTML, CSS, JavaScript modules, and assets intact. No build or Node installation is required.

## Checks

If Node is available, run `node scripts/verify.mjs` to verify assets, navigation, product data, flavor-pack state, and reversible can motion.
