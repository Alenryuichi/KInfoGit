## 1. Fix Double Layout

- [x] 1.1 Remove the `<Layout>` wrapper from `website/pages/blog/[slug].tsx` so that only `_app.tsx` provides the Layout
- [x] 1.2 Verify FloatingLines and other layout elements render exactly once on blog detail pages

## 2. Title Cleaning Utility

- [x] 2.1 Create `stripMarkdownTitle(title: string): string` in `website/lib/utils.ts` that strips leading `#{1,6}\s+` patterns and trims whitespace
- [x] 2.2 Write unit tests for `stripMarkdownTitle` covering: headings with markers, clean titles, edge cases (empty string, multiple `#` levels)
- [x] 2.3 Apply `stripMarkdownTitle` to title rendering in `website/pages/blog/[slug].tsx`
- [x] 2.4 Apply `stripMarkdownTitle` to title rendering in `website/pages/blog.tsx` (blog list page)

## 3. Table of Contents

- [x] 3.1 Create heading extraction utility that parses h2/h3 headings from markdown/rendered content with id and text
- [x] 3.2 Create `TableOfContents` component with sticky sidebar layout for desktop (>= 1024px)
- [x] 3.3 Add collapsible panel mode for mobile viewports (< 1024px)
- [x] 3.4 Implement IntersectionObserver-based active heading tracking and highlight
- [x] 3.5 Add smooth scroll behavior when clicking TOC entries
- [x] 3.6 Hide TOC when article has fewer than 2 headings
- [x] 3.7 Integrate `TableOfContents` into `website/pages/blog/[slug].tsx`

## 4. Prev/Next Post Navigation

- [x] 4.1 Update `getStaticProps` in `website/pages/blog/[slug].tsx` to compute and pass previous/next post data (title, slug) based on chronological sort
- [x] 4.2 Create `PrevNextNav` footer component displaying previous (left) and next (right) post links
- [x] 4.3 Handle edge cases: omit prev link for oldest post, omit next link for newest post
- [x] 4.4 Integrate `PrevNextNav` at the bottom of the article content in `[slug].tsx`

## 5. Reading Progress Bar

- [x] 5.1 Create `ReadingProgressBar` component with fixed position at top of viewport
- [x] 5.2 Implement scroll tracking with `requestAnimationFrame` throttling, calculating progress as percentage of article content scrolled
- [x] 5.3 Style the progress bar (thin, themed color, smooth width transition)
- [x] 5.4 Integrate `ReadingProgressBar` into `website/pages/blog/[slug].tsx`

## 6. Verification

- [x] 6.1 Run `npm run type-check` and fix any TypeScript errors
- [x] 6.2 Run `npm run lint` and fix any linting issues
- [x] 6.3 Run `npm run test` and verify all tests pass (including new stripMarkdownTitle tests)
- [x] 6.4 Visually verify on desktop: single Layout, clean titles, sticky TOC with active tracking, prev/next nav, progress bar
- [x] 6.5 Visually verify on mobile: collapsible TOC, responsive prev/next nav, progress bar
