# Data-Driven Migration Plan (Monisa)

This document outlines how we will transform the current static site into a data-driven website powered by organized JSON and Decap CMS, while preserving the current front-end look and feel.

## Goals
- Replace hard-coded cards and sections with JSON-driven rendering.
- Implement true filtering on the Best Sellers page (and anywhere else needed).
- Keep the current UI/UX intact; progressive enhancement with graceful fallbacks.
- Prepare the project for Decap CMS editing.

## Current Codebase Audit
- `index.html`: Home page, multiple sections with hardcoded plan cards and navigation.
- `bestseller.html`: Best Sellers listing grid + left filter sidebar. Title currently dynamic via `index.js`.
- `houseInfo.html`: Plan detail page with static content and related cards.
- `styles.css`: Global styles with component sections (hero, nav, cards, sidebar, etc.).
- `index.js`: UI interactions (sliders, dropdowns, footer), plus dynamic Best Sellers hero title.

## High-Level Approach
1. Introduce a `/data/` directory with JSON files (projects and taxonomies).
2. Render UI from JSON via small, framework-free JS templates (no build step required).
3. Implement client-side filtering by reading JSON into memory and applying predicates.
4. Sync filters with URL query params; support deep-linking and back/forward navigation.
5. Integrate Decap CMS to edit JSON (collections, previews optional later).
6. Keep HTML structure and classes to avoid CSS/UX regressions.

## Data Model
We will maintain a normalized but simple structure. One primary collection: `projects`.

### Project JSON (data/projects.json)
```
{
  "projects": [
    {
      "id": "24411",
      "title": "Two-story 4 bedroom house",
      "subtitle": "Modern contemporary mansion",
      "priceFrom": 270.0,
      "bedrooms": 4,
      "floors": 2,
      "style": "Modern",
      "type": "Residential", // e.g., Residential, Hotels & Lodges
      "sizeSqm": 320,         // numeric size in SQM
      "sizeBand": "300-400", // derived/explicit band for quick filter
      "images": [
        "src/images/placeholderImg1.jpg"
      ],
      "badge": "Best Seller", // optional
      "rating": 4.5,           // 0..5
      "reviews": 123,          // count
      "slug": "two-story-4br-24411", // useful for URLs later
      "featured": true         // can drive home page highlights
    }
  ]
}
```

Notes:
- We will derive `sizeBand` if missing, based on `sizeSqm` to map to current menu bands (e.g., Under 100, 100–200, 200–300, 300–400, 400–500, 500–750, 750+).
- `priceFrom` used for display and price range filters.

### Taxonomies (optional helper files)
- `data/taxonomies.json` (optional) to centralize lists and labels for filters and menus:
```
{
  "styles": ["Modern", "Contemporary", "Bungalow", "Luxury", "Rustic", "Country"],
  "types": ["Residential", "Hotels & Lodges"],
  "bedrooms": [1,2,3,4,5],
  "floors": [1,2,3,4],
  "sizeBands": [
    {"key":"under-100","label":"Under 100 SQM","min":0,"max":100},
    {"key":"100-200","label":"100–200 SQM","min":100,"max":200},
    {"key":"200-300","label":"200–300 SQM","min":200,"max":300},
    {"key":"300-400","label":"300–400 SQM","min":300,"max":400},
    {"key":"400-500","label":"400–500 SQM","min":400,"max":500},
    {"key":"500-750","label":"500–750 SQM","min":500,"max":750},
    {"key":"750-plus","label":"750+ SQM","min":750,"max":null}
  ],
  "priceRanges": [
    {"key":"under-100","label":"Under $100","min":0,"max":100},
    {"key":"100-300","label":"$100 to $300","min":100,"max":300},
    {"key":"300-500","label":"$300 to $500","min":300,"max":500}
  ]
}
```

## Rendering Strategy
- Keep existing HTML structure; add minimal hooks for JS injection.
- `index.html`:
  - Replace hard-coded plan cards in home sections with a data render step that inserts cards where current markup expects them.
  - Use attributes like `data-section="family-size"` or specific container classes to mount.
- `bestseller.html`:
  - Replace grid items with data-driven render into `.bs-page-grid`.
  - Sidebar checkboxes become functional filters (read from `taxonomies.json` optionally or static HTML as now).
- `houseInfo.html`:
  - In phase 1, keep static. In phase 2, load a project by `?id=` (or `slug`) and populate fields.

Implementation will occur in `index.js` in separate modules:
- `loadData()` – fetch JSON files with cache and basic error handling.
- `renderCard(project)` – returns DOM for a card respecting current classes.
- `renderGrid(projects, container)` – clears and appends.
- `applyFilters(projects, filterState)` – returns filtered array.
- `syncUrl(filterState)` and `readUrl()` – sync with query params.

## Filtering Model
- Filter state structure:
```
{
  "types": Set<string>,
  "bedrooms": Set<number>,
  "floors": Set<number>,
  "styles": Set<string>,
  "sizeBands": Set<string>,
  "priceRange": string | null // key from taxonomies
}
```
- Predicates applied AND across groups, OR within a group (e.g., 3 OR 4 bedrooms, AND Modern style).
- Price range is a single-select in current UI; can be multi-select later.
- State synchronized to URL (e.g., `?types=Residential&bedrooms=3,4&styles=Modern&price=100-300`).
- On page load, parse URL and pre-check corresponding checkboxes; run initial render.

## Decap CMS Integration Plan
- Add `/admin/` with `index.html` and `config.yml`.
- Backend: `git-gateway` or `github` depending on hosting.
- Collections:
  - `projects`: file-based collection editing `data/projects.json` (list-based JSON editor) or folder-based (one file per project under `content/projects/` then build a combined JSON via simple script—optional later).
  - `taxonomies`: optional collection for `data/taxonomies.json`.
- Media folder: `src/images/` to match current assets.
- Configure preview templates later if needed.

## Step-by-Step Phased Plan
1. Data foundation
   - Create `data/projects.json` with a small seed set extracted from current HTML.
   - (Optional) Create `data/taxonomies.json` to centralize labels.
2. Rendering primitives
   - Implement `loadData()`, `renderCard()`, `renderGrid()` in `index.js`.
   - Replace the Best Sellers grid population with JSON-driven render.
3. Filtering (Best Sellers)
   - Implement `readUrl()`, `syncUrl()`, filter state, and predicates.
   - Wire sidebar checkboxes to update state -> render.
   - Ensure hero title continues to update from current filter selection (already added logic).
4. Home page dynamic sections
   - Render home page “Plans for every family size” and pricing bands from JSON using flags/queries (e.g., `featured`, `bedrooms==3`, `priceFrom within range`).
5. House detail (Phase 2)
   - Accept `?id=` or `/project/:slug` (later) and render detail page from JSON.
   - Populate related items using simple heuristics (same style/bedrooms/price band).
6. Decap CMS
   - Add `/admin/` + `config.yml` targeting `data/*.json`.
   - Test editorial flow; document guidelines for editors.
7. QA & Acceptance
   - Visual diff vs current site.
   - Performance: ensure first render < 200ms after JSON load for 100–300 items.
   - Robust URL deep-linking for filters.

## Non-Breaking Principles
- Keep existing CSS classes and DOM structure.
- Progressive enhancement: if JSON fails to load, keep static fallback (during transition only).
- No external frameworks; vanilla JS only.

## Acceptance Criteria
- Best Sellers grid fully data-driven; identical styling to current.
- Filters work and are reflected in URL; reloading preserves state.
- Hero title reflects current selection or deep link.
- Home page cards populated from JSON without layout regressions.
- Decap CMS can create/edit projects and taxonomies.

## Open Questions / Future Enhancements
- Do we want server-side search or Algolia later for scaling?
- Image CDN or responsive sources for performance.
- Per-project pages with SEO-friendly slugs.

## Work Breakdown (mirrors TODOs)
- Audit codebase [done]
- Design JSON schema [done]
- Author data files with seed content
- Implement Best Sellers data render + filters
- Home page dynamic sections
- House detail from JSON (phase 2)
- Decap CMS setup
- QA + acceptance
