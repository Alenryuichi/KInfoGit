## Context

This is a Next.js 16 (Pages Router) static site deployed to GitHub Pages. The blog detail page at `website/pages/blog/[slug].tsx` currently has a redundant `<Layout>` wrapper (since `_app.tsx` already provides one), displays raw markdown markers in titles from Yuque-synced content, and lacks reading navigation aids. The blog list page was recently redesigned with a single-column year-grouped summary list and theme tabs; the detail page should feel visually connected to that design.

## Goals / Non-Goals

**Goals:**
- Eliminate double Layout/FloatingLines rendering on blog detail pages
- Display clean titles free of markdown syntax artifacts
- Provide a table of contents for navigating long articles
- Enable sequential reading with prev/next post navigation
- Show reading progress visually

**Non-Goals:**
- Changing the Yuque sync pipeline or upstream markdown content
- Modifying the `BlogPost` data structure or adding new fields to the data model
- Adding comment/reaction functionality
- Changing the blog list page layout or design

## Decisions

### 1. Remove `<Layout>` from [slug].tsx

**Decision:** Remove the `<Layout>` wrapper from the blog detail page component.

**Rationale:** `_app.tsx` already wraps all pages in `<Layout>`, so having it in `[slug].tsx` causes FloatingLines and other layout elements to render twice. Removing it from the page component is the correct fix since `_app.tsx` is the canonical layout provider.

**Alternative considered:** Remove from `_app.tsx` and add to each page — rejected because it would require touching every page and is less maintainable.

### 2. Title cleaning via regex utility

**Decision:** Create a `stripMarkdownTitle(title: string): string` function in `website/lib/data.ts` that strips leading `#{1,6}\s*` patterns and trims whitespace. Apply at render time in both blog list and detail pages.

**Rationale:** Cleaning at the render layer avoids modifying source data or the sync pipeline. A shared utility ensures consistency across all pages displaying blog titles.

**Alternative considered:** Clean titles during build/sync — rejected because it's a non-goal to change the sync pipeline, and render-time cleaning is simpler and more resilient to future data changes.

### 3. TOC with IntersectionObserver

**Decision:** Extract headings (h2, h3) from the rendered markdown content. Render as a sticky sidebar on desktop (right side), collapsible panel on mobile. Use IntersectionObserver to track which heading is currently in the viewport and highlight it in the TOC.

**Rationale:** IntersectionObserver is performant (no scroll event listener overhead), well-supported, and the standard approach for active heading tracking. Sticky sidebar makes the TOC always accessible on wide screens without consuming article space.

**Alternative considered:** Scroll event listener with offset calculation — rejected for performance reasons. Third-party TOC library — rejected to keep dependencies minimal.

### 4. Prev/Next navigation via getStaticProps

**Decision:** In `getStaticProps`, pass the previous and next posts (sorted by date) as props alongside the current post. Render prev/next links in a footer navigation component.

**Rationale:** Since this is SSG, computing adjacent posts at build time is free and avoids any client-side data fetching. The sorted posts array is already available in the data layer.

**Alternative considered:** Client-side fetching of post index — rejected because it adds unnecessary runtime overhead for static data.

### 5. Reading progress bar

**Decision:** Add a thin fixed-position progress bar at the very top of the page. Track scroll position relative to article content height using a scroll event listener with `requestAnimationFrame` throttling.

**Rationale:** A top-of-page progress bar is a well-understood UX pattern. Using rAF throttling keeps it smooth without blocking the main thread.

**Alternative considered:** IntersectionObserver with percentage-based tracking — rejected because scroll position gives smoother continuous progress than discrete intersection thresholds.

## Risks / Trade-offs

- **[Double Layout edge case]** Other pages may also have redundant Layout wrappers. Mitigation: Only fix [slug].tsx in this change; audit other pages separately if needed.
- **[Title regex over-stripping]** The regex could strip legitimate `#` characters at the start of titles. Mitigation: Only strip `#{1,6}` followed by a space, which matches markdown heading syntax specifically.
- **[TOC on short articles]** Articles with few or no headings would show an empty or near-empty TOC. Mitigation: Hide the TOC component when fewer than 2 headings are extracted.
- **[SSG rebuild for prev/next]** Adding or reordering posts changes prev/next links for adjacent posts, requiring rebuild of 3 pages instead of 1. Mitigation: This is already the case with SSG; no additional cost since full rebuilds are the norm for this site.
