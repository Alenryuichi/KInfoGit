## 1. Data Types & Data Layer

- [x] 1.1 Add `WeeklyDigest` and `WeeklyDigestSummary` interfaces to `website/lib/social-feeds.ts`
- [x] 1.2 Add `getWeeklyDigestsDir()` helper following the existing `getXDir()` pattern
- [x] 1.3 Implement `getAllWeeklyDigests()` that reads `profile-data/weekly-digests/`, parses each JSON file, and returns `WeeklyDigestSummary[]` sorted newest-first
- [x] 1.4 Implement `getWeeklyDigestByWeek(week: string)` that loads and returns a single `WeeklyDigest | null`
- [x] 1.5 Implement `getAdjacentWeeks(week: string)` that returns `{ prev: string | null; next: string | null }` for digest navigation

## 2. Weekly Digest Generation Script

- [x] 2.1 Create `scripts/generate-weekly-digest.ts` with config constants, types, and ISO week calculation helpers
- [x] 2.2 Implement `collectWeekDays(week: string)` that returns the 7 date strings (Mon–Sun) for a given ISO week
- [x] 2.3 Implement `loadWeekContent(dates: string[])` that aggregates daily stars and posts, computes cross-references, and truncates to fit token budget
- [x] 2.4 Implement `computeStats()` to calculate `totalRepos`, `totalPosts`, `uniqueAuthors`, `daysWithContent`
- [x] 2.5 Implement `detectCrossReferences()` to find repos starred by multiple users
- [x] 2.6 Implement `generateWeeklyDigest()` DeepSeek API call with structured JSON prompt and response validation
- [x] 2.7 Implement `main()` loop: check for existing digest, aggregate content, call DeepSeek, write `YYYY-WXX.json`
- [x] 2.8 Test script locally with existing daily data (run `npx tsx scripts/generate-weekly-digest.ts`)

## 3. Stars List Page — Weekly Digest Card

- [x] 3.1 Update `getStaticProps` in `website/pages/stars.tsx` to load the most recent weekly digest via `getAllWeeklyDigests()` and `getWeeklyDigestByWeek()`
- [x] 3.2 Create the collapsible "This Week" card component with summary preview (collapsed) and full trending topics / cross-references (expanded)
- [x] 3.3 Add `useState` toggle for expand/collapse behavior
- [x] 3.4 Add "View full digest →" link pointing to `/stars/weekly/YYYY-WXX/`
- [x] 3.5 Handle the no-digest case (render nothing above the date list)

## 4. Weekly Digest Detail Page

- [x] 4.1 Create `website/pages/stars/weekly/[week].tsx` with `getStaticPaths` enumerating all digest files
- [x] 4.2 Implement `getStaticProps` loading the digest via `getWeeklyDigestByWeek()`, returning `notFound: true` for missing digests
- [x] 4.3 Build the detail page layout: header with week label and date range, full summary, trending topics list, notable repos grid, key discussions, cross-references table, and stats
- [x] 4.4 Add prev/next week navigation using `getAdjacentWeeks()`
- [x] 4.5 Add links to individual daily pages for the days covered by the digest

## 5. CI Workflow Integration

- [x] 5.1 Add "Generate weekly digest" step to `.github/workflows/sync-stars.yml` after the daily summaries step, with `DEEPSEEK_API_KEY` env var
- [x] 5.2 Update the workflow Summary step to include weekly digest info

## 6. Verification

- [x] 6.1 Run `npm run type-check` to verify no TypeScript errors
- [x] 6.2 Run `npm run lint` to verify no ESLint errors
- [x] 6.3 Run `npm run build` (or `just build`) to verify SSG generates weekly digest pages
- [ ] 6.4 Manually verify `/stars/` shows the digest card and `/stars/weekly/YYYY-WXX/` renders correctly
