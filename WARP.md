# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project summary
- Static multi-page website for “Monisa” house plans, built with plain HTML/CSS/JavaScript. No build tooling, package manager, linter, or tests are configured.
- Data is loaded at runtime from data/projects.json via fetch, so pages must be served over HTTP (file:// will break fetch).

Common commands
- Serve the site locally (choose one; run from repo root):
  - Using Node (npx):
    npx --yes serve -l 5173 .
  - Using Python 3:
    py -m http.server 5173
  Then open http://localhost:5173 in a browser.

- Build: Not applicable (no bundler/build pipeline).
- Lint: Not configured.
- Tests: Not configured. Running a single test is not applicable.

High-level architecture
- Pages and assets
  - HTML: index.html, about.html, services.html, bestseller.html, favorites.html, houseInfo.html
  - CSS: styles.css (global), plus page/feature styles: bestseller.css, favorites.css, search.css
  - Data: data/projects.json (array of project objects)
  - Images: src/images/* (used by hero, cards, etc.)

- Runtime scripts (browser-side, vanilla JS; all attach behavior on DOMContentLoaded)
  - index.js
    - Hero image slider: cycles src/images/* via the #heroBg element and right-side dot controls (auto-rotates every 6s).
    - House Plans horizontal slider: keyboard and button navigation for .plans-slider.
    - “You may also like” slider on houseInfo.html: arrow and keyboard navigation for .hi-rel-slider.
    - Navigation dropdown UX: delayed close across .nav and .nav-item to prevent flicker while moving between items.
    - Testimonials slider: dot and arrow navigation with simple auto-advance and class-based transitions.
    - Footer: dynamic year fill for #year; simple newsletter form toast.
    - Best Sellers title: updates .bs-hero-title using a data-title or link text on navigation, remembers via sessionStorage, and reacts to sidebar filter changes.
    - Before/After comparison: draggable handle and responsive behavior for the comparison slider (with keyboard support and option buttons to swap images).

  - search.js
    - Loads data/projects.json into memory (allProjects).
    - Provides a modal search (open via the nav search icon) with live filtering on query and quick-filter chips.
    - Renders result cards (includes a favorite button stub that cooperates with favorites.js).

  - favorites.js
    - Local favorites with localStorage (key: monisa_favorites).
    - Exposes a lightweight API on window.FavoritesManager for getting/setting favorites and updating the UI badge.
    - Wires .favorite-btn buttons and a full-screen favorites popup (open/close, render grid, clear all).

  - filter-improvements.js (optional enhancement)
    - Adds loading overlays, active-filter badges, debounced updates, and improved empty/error states for the Best Sellers grid.
    - Requires existing helpers (e.g., cardHtml, passes, readSidebarState, applyStateToSidebar, syncUrl, readUrl) to be present globally; integrate by calling window.enhancedFilters.init() where appropriate.

Data model (inferred from usage in code)
- Projects in data/projects.json commonly include:
  - id, title, subtitle?, style, type
  - bedrooms, bathrooms, sizeSqm, sizeBand
  - priceFrom (number)
  - images (array of URLs)
  - badge? (optional label)

Development notes
- Always run via a local HTTP server so fetch('data/projects.json') works.
- JS files are plain scripts (not modules). They rely on DOM elements/classes existing on specific pages; include scripts only on pages that define the corresponding markup.
