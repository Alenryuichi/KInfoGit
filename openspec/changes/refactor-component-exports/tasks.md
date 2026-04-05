## 1. Pre-flight Checks

- [ ] 1.1 Check for `next/dynamic` usage that may rely on default exports
- [ ] 1.2 Check for barrel `index.ts` re-exports in `website/components/`
- [ ] 1.3 Run `npm run type-check` baseline to confirm clean starting state

## 2. Convert Component Exports

- [ ] 2.1 Convert About.tsx: `export default` → `export function`, remove `'use client'` if present
- [ ] 2.2 Convert Blog.tsx: `export default` → `export function`, remove `'use client'`
- [ ] 2.3 Convert BlogCard.tsx: `export default` → `export function`
- [ ] 2.4 Convert Contact.tsx: `export default` → `export function`, remove `'use client'`
- [ ] 2.5 Convert ContactModal.tsx: `export default` → `export function`, remove `'use client'`
- [ ] 2.6 Convert CountUp.tsx: `export default` → `export function`
- [ ] 2.7 Convert Experience.tsx: `export default` → `export function`
- [ ] 2.8 Convert FeaturedProjects.tsx: `export default` → `export function`
- [ ] 2.9 Convert FilterBar.tsx: `export default` → `export function`
- [ ] 2.10 Convert FloatingLines.tsx: `export default` → `export function`, remove `'use client'`
- [ ] 2.11 Convert Footer.tsx: `export default` → `export function`, remove `'use client'`
- [ ] 2.12 Convert GitHubActivity.tsx: `export default` → `export function`, remove `'use client'`
- [ ] 2.13 Convert Header.tsx: `export default` → `export function`, remove `'use client'`
- [ ] 2.14 Convert Hero.tsx: `export default` → `export function`
- [ ] 2.15 Convert HomeCTA.tsx: `export default` → `export function`
- [ ] 2.16 Convert Layout.tsx: `export default` → `export function`
- [ ] 2.17 Convert MarkdownRenderer.tsx: `export default` → `export function`
- [ ] 2.18 Convert Projects.tsx: `export default` → `export function`
- [ ] 2.19 Convert SearchBox.tsx: `export default` → `export function`
- [ ] 2.20 Convert Skills.tsx: `export default` → `export function`
- [ ] 2.21 Convert SpotlightCard.tsx: `export default` → `export function`
- [ ] 2.22 Convert TableOfContents.tsx: `export default` → `export function`
- [ ] 2.23 Convert TagCloud.tsx: `export default` → `export function`
- [ ] 2.24 Convert TextPressure.tsx: `export default` → `export function`
- [ ] 2.25 Convert TextReveal.tsx: `export default` → `export function`
- [ ] 2.26 Convert ThemeProvider.tsx: `export default` → `export function`

## 3. Update Import Sites

- [ ] 3.1 Update all imports in `website/pages/index.tsx`
- [ ] 3.2 Update all imports in `website/pages/about.tsx`
- [ ] 3.3 Update all imports in `website/pages/work.tsx`
- [ ] 3.4 Update all imports in `website/pages/blog.tsx`
- [ ] 3.5 Update all imports in `website/pages/blog/[slug].tsx`
- [ ] 3.6 Update all imports in `website/pages/work/[slug].tsx` (if exists)
- [ ] 3.7 Update all imports in `website/pages/_app.tsx`
- [ ] 3.8 Update cross-component imports (components importing other components)

## 4. Update Test Files

- [ ] 4.1 Update imports in `About.test.tsx`
- [ ] 4.2 Update imports in `BlogCard.test.tsx`
- [ ] 4.3 Update imports in `Hero.test.tsx`
- [ ] 4.4 Update imports in `Skills.test.tsx`

## 5. Verification

- [ ] 5.1 Run `npm run type-check` — zero errors
- [ ] 5.2 Run `npm run test` — all tests pass
- [ ] 5.3 Run `npm run lint` — no new lint errors
- [ ] 5.4 Verify no remaining `export default` in `website/components/` via grep
- [ ] 5.5 Verify no remaining `'use client'` in `website/components/` via grep
