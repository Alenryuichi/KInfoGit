## Why

The blog detail page (`website/pages/blog/[slug].tsx`) has three UX issues: (1) double Layout rendering — `[slug].tsx` wraps content in `<Layout>` while `_app.tsx` already wraps all pages, causing FloatingLines to render twice; (2) blog posts synced from Yuque contain markdown markers in titles (e.g., `### 最致命的问题：无法应对考古需求`), which display raw to the user; (3) no reading aids — no table of contents, no prev/next post navigation, no reading progress indicator — making long-article experience poor.

## What Changes

- Remove the redundant `<Layout>` wrapper from `[slug].tsx` to eliminate double rendering of FloatingLines and other layout elements
- Add a `stripMarkdownTitle()` utility that strips leading `#{1,6}\s*` and other markdown artifacts from blog post titles, applied in both list and detail pages
- Add a sticky TOC sidebar on desktop (collapsible on mobile) that extracts headings from markdown content and highlights the active heading via IntersectionObserver
- Add prev/next post navigation links at the article footer, passing sorted posts via `getStaticProps`
- Add a thin reading progress bar at the top of the page that tracks scroll position

## Capabilities

### New Capabilities
- `blog-detail-reading-experience`: Complete blog detail page UX improvement — Layout fix, title cleaning, TOC navigation, prev/next links, and reading progress bar

### Modified Capabilities

## Impact

- `website/pages/blog/[slug].tsx` — Remove Layout wrapper, integrate TOC sidebar, prev/next nav, and progress bar
- `website/pages/blog/index.tsx` — Apply title cleaning utility to blog list rendering
- `website/lib/data.ts` — Add `stripMarkdownTitle()` utility function
- `website/components/` — New components: `TableOfContents`, `PrevNextNav`, `ReadingProgressBar`
