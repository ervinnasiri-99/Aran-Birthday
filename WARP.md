# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This repository is a self-contained, static web experience for Aran's neon birthday page. It consists of a single HTML entrypoint (`index.html`), one JavaScript module (`scripts/main.js`), a Tailwind configuration file (`tailwind.config.js`), and a small `assets/` directory.

All runtime dependencies (Tailwind, GSAP + plugins, Three.js, Lottie, Lenis) are loaded from public CDNs at page load; there is no bundler or Node-based toolchain configured.

## Commands & workflows

### Run the experience locally

There is no build step or dependency installation required; the site is pure static assets.

- Easiest: open `index.html` directly in a browser.
- Alternatively, serve the repo root with any static HTTP server so that relative paths resolve correctly, e.g.:
  - Using Python (macOS/Linux/Windows PowerShell):
    - `python -m http.server 8000`
    - Then visit `http://localhost:8000/` and open `index.html`.

### Build, lint, and tests

- No build pipeline is defined (no `package.json`, bundler, or Tailwind CLI usage); Tailwind runs via the CDN script in `index.html`.
- No linting or formatting commands are configured in this repo.
- There is no automated test suite; testing is manual via browser interaction.

If you introduce tooling (e.g. bundler, linter, or tests), update this section with the corresponding commands.

## High-level architecture

### HTML structure (`index.html`)

`index.html` is the single-page layout and defines semantic sections that map directly to JavaScript behaviors:

- **Global containers**: custom cursor elements (`#cursor-outer`, `#cursor-inner`, `#cursor-trail`, `#cursor-core`, `#cursor-ripples`), a Three.js background canvas (`#bg-canvas`), and a Lottie confetti container (`#hero-confetti`).
- **Hero section** (`#hero`): headline, CTA buttons (`.hero-cta` with `.neon-button`, `.magnetic`, `.interactive` classes) and glass-panel card that animate on load.
- **Content sections**: timeline (`#timeline`, `.timeline-card`), "Why Aran Is Awesome" cards (`#awesome`, `.awesome-card`), message block (`#message`, `#message-typing`), memory wall (`#memories`, `.memory-tile`), fun facts hub (`#fun-facts`, `.fun-card`, `.flip-inner`), secret vault (`#vault`, `#vault-lock`, `.vault-shard`, `#vault-unlocked`, `#vault-gift-3d`), mini‑game (`#mini-game`, `#game-area`, `#game-score`), gift box reveal (`#gift`, `#gift-box`, `#gift-message`), achievements (`#achievements`, `.progress-bar`), quotes wall (`#quotes`, `.quotes-spotlight`), and footer (`#footer`, `#footer-blobs`, `#scroll-top`).

The JavaScript module attaches behavior by querying these IDs/classes, so any structural changes in the HTML should preserve corresponding hooks or be reflected in `scripts/main.js`.

### JavaScript runtime (`scripts/main.js`)

The JS file is a single ES module that initializes all interactive behavior when the DOM is ready via the `init()` function. It assumes the following globals are available from CDN includes in `index.html`: `window.gsap`, `window.ScrollTrigger`, `window.MotionPathPlugin`, `window.MorphSVGPlugin`, `window.THREE`, and `window.lottie`.

Key responsibilities are split into setup functions:

- **Global motion & input systems**
  - `setupSmoothScroll()`: wires up Lenis smooth scrolling and the "Back to Top" button (`#scroll-top`).
  - `setupCursorSystem()`: implements the custom cursor (outer/inner circles, trail, click ripples), background glow (`#cursor-core`), quotes spotlight, and a sticky interaction zone around the vault.
  - `setupMagneticElements()` / `setupMagnetic3DTilt()`: adds 2D magnetic motion to `.magnetic` elements and 3D tilt/parallax to `.magnetic-3d` cards.
  - `setupLiquidButtons()`: adds gradient sweeps and squash/stretch interactions to `.neon-button` CTAs.

- **Scroll-triggered and hover-driven content animations**
  - `setupScrollAnimations()`: uses GSAP + ScrollTrigger to animate timeline cards, awesome cards, memory tiles, and achievement progress bars (`.progress-bar`) on scroll.
  - `setupMessageTyping()`: typewriter effect for the main message in `#message-typing` triggered when the message section scrolls into view.
  - `setupMemoryParallax()`: pointer‑driven parallax and glow for `.memory-tile` elements.
  - `setupFunFacts()`: 3D flip/tilt interactions for `.fun-card` items and color-cycling of the cursor trail when inside the `#fun-facts` section.
  - `setupGiftBox()`: delayed hover to reveal the gift message and tilt/scale animations for `#gift-box` and `#gift-message`.
  - `setupFooterBlobs()`: generates animated neon blobs in `#footer-blobs` that subtly respond to pointer movement.
  - `setupHero()`: entrance animations for the hero glass panel and CTAs, plus initial Lottie confetti.

- **Mini experiences and 3D scenes**
  - `setupVault()` and `unlockVault()`: drag‑to‑lock interaction for `.vault-shard` elements; once all shards are "collected", triggers confetti, reveals `#vault-unlocked`, and initializes a Three.js 3D rotating gift box in `#vault-gift-3d`.
  - `setupMiniGame()`: cursor‑controlled mini game inside `#game-area` where stars (collectibles) and hazards (red orbs) spawn over time, update a score label (`#game-score`), and briefly change the game area's glow on collisions.
  - `setupThreeBackground()`: Three.js starfield rendered into `#bg-canvas` with subtle camera/particle rotation driven by pointer movement and window resize handling.

`init()` simply calls all `setup*` functions in sequence and is bound to `DOMContentLoaded` (or executed immediately if the document is already loaded). When extending behavior, follow this pattern by creating a new `setupX()` and adding it to `init()`.

### Tailwind configuration (`tailwind.config.js`)

`tailwind.config.js` defines a small extended theme (neon colors, glow shadows, `backdropBlur.glass`) and a `content` array that includes `index.html` and `scripts/**/*.{js,ts}`. However, Tailwind in this project currently runs via the CDN script block in `index.html`; the config file is primarily useful for editor tooling or for future migration to a build‑time Tailwind setup.

If you introduce a Tailwind CLI or bundler, ensure its configuration matches the paths and theme used here.

## Working within this structure

- New interactive features should generally be implemented as additional `setup*` functions in `scripts/main.js` and registered in `init()`, reusing existing class-based hooks where possible.
- When adjusting layout or section structure in `index.html`, keep IDs and key class names in sync with the selectors in `scripts/main.js` to avoid breaking interactions.
- Any migration to a more complex toolchain (e.g. adding a build step) should preserve the current CDN-based runtime behavior until equivalent bundling of GSAP, Three.js, Lottie, and Lenis is configured.