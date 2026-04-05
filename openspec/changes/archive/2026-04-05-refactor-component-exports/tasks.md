## 1. Pre-flight Checks

- [x] 1.1 Check for `next/dynamic` usage that may rely on default exports
- [x] 1.2 Check for barrel `index.ts` re-exports in `website/components/`
- [x] 1.3 Run `npm run type-check` baseline to confirm clean starting state

## 2. Convert Component Exports

- [x] 2.1 Convert About.tsx: `export default` → `export function`, remove `'use client'` if present
- [x] 2.2 Convert Blog.tsx: `export default` → `export function`, remove `'use client'`
- [x] 2.3 Convert BlogCard.tsx: `export default` → `export function`
- [x] 2.4 Convert Contact.tsx: `export default` → `export function`, remove `'use client'`
- [x] 2.5 Convert ContactModal.tsx: `export default` → `export function`, remove `'use client'`
- [x] 2.6 Convert CountUp.tsx: `export default` → `export function`
- [x] 2.7 Convert Experience.tsx: `export default` → `export function`
- [x] 2.8 Convert FeaturedProjects.tsx: `export default` → `export function`
- [x] 2.9 Convert FilterBar.tsx: `export default` → `export function`
- [x] 2.10 Convert FloatingLines.tsx: `export default` → `export function`, remove `'use client'`
- [x] 2.11 Convert Footer.tsx: `export default` → `export function`, remove `'use client'`
- [x] 2.12 Convert GitHubActivity.tsx: `export default` → `export function`, remove `'use client'`
- [x] 2.13 Convert Header.tsx: `export default` → `export function`, remove `'use client'`
- [x] 2.14 Convert Hero.tsx: `export default` → `export function`
- [x] 2.15 Convert HomeCTA.tsx: `export default` → `export function`
- [x] 2.16 Convert Layout.tsx: `export default` → `export function`
- [x] 2.17 Convert MarkdownRenderer.tsx: `export default` → `export function`
- [x] 2.18 Convert Projects.tsx: `export default` → `export function`
- [x] 2.19 Convert SearchBox.tsx: `export default` → `export function`
- [x] 2.20 Convert Skills.tsx: `export default` → `export function`
- [x] 2.21 Convert SpotlightCard.tsx: `export default` → `export function`
- [x] 2.22 Convert TableOfContents.tsx: `export default` → `export function`
- [x] 2.23 Convert TagCloud.tsx: `export default` → `export function`
- [x] 2.24 Convert TextPressure.tsx: `export default` → `export function`
- [x] 2.25 Convert TextReveal.tsx: `export default` → `export function`
- [x] 2.26 Convert ThemeProvider.tsx: `export default` → `export function`

## 3. Update Import Sites

- [x] 3.1 Update all imports in `website/pages/index.tsx`
- [x] 3.2 Update all imports in `website/pages/about.tsx`
- [x] 3.3 Update all imports in `website/pages/work.tsx`
- [x] 3.4 Update all imports in `website/pages/blog.tsx`
- [x] 3.5 Update all imports in `website/pages/blog/[slug].tsx`
- [x] 3.6 Update all imports in `website/pages/work/[slug].tsx` (if exists)
- [x] 3.7 Update all imports in `website/pages/_app.tsx`
- [x] 3.8 Update cross-component imports (components importing other components)

## 4. Update Test Files

- [x] 4.1 Update imports in `About.test.tsx`
- [x] 4.2 Update imports in `BlogCard.test.tsx`
- [x] 4.3 Update imports in `Hero.test.tsx`
- [x] 4.4 Update imports in `Skills.test.tsx`

## 5. Verification

- [x] 5.1 Run `npm run type-check` — zero errors
- [x] 5.2 Run `npm run test` — all tests pass
- [x] 5.3 Run `npm run lint` — no new lint errors
- [x] 5.4 Verify no remaining `export default` in `website/components/` via grep
- [x] 5.5 Verify no remaining `'use client'` in `website/components/` via grep
