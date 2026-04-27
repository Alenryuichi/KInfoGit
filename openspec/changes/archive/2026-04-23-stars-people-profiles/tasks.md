## 1. People Configuration Data

- [x] 1.1 Create `profile-data/people.json` with entries for all ~30 tracked people, mapping canonical `id` to `name`, `bio`, `github`, `bluesky`, and `avatar` fields (derive from GITHUB_USERS and BLUESKY_HANDLES arrays)
- [x] 1.2 Add TypeScript type definition for `Person` in `website/lib/people.ts` matching the people.json schema

## 2. Build-Time Data Aggregation Script

- [x] 2.1 Create `scripts/generate-people-data.ts` that reads `profile-data/people.json` and scans `profile-data/github-stars/*.json` and `profile-data/bluesky-posts/*.json` to collect per-person activity from the last 30 days
- [x] 2.2 Implement daily activity count computation (30-element array for sparkline data)
- [x] 2.3 Implement DeepSeek API call to generate per-person "recent interests" summary (skip if no API key or no activity)
- [x] 2.4 Write per-person output JSON files to `profile-data/people-activity/{id}.json` with stars, posts, dailyCounts, and interestSummary fields
- [x] 2.5 Integrate `generate-people-data` into the `just build` pipeline (after fetch-stars/fetch-bluesky, before next build)

## 3. Data Layer

- [x] 3.1 Implement `getAllPeople()` in `website/lib/people.ts` — reads people.json, augments each entry with summary activity count from people-activity files
- [x] 3.2 Implement `getPersonByHandle(handle: string)` — returns person entry merged with full activity data from people-activity JSON, or null if not found
- [x] 3.3 Implement `getAllPersonIds()` — returns array of all person IDs for `getStaticPaths`
- [x] 3.4 Implement `getHandleToPersonMap()` — returns lookup map from `github:{username}` and `bluesky:{handle}` to person ID

## 4. Shared Components

- [x] 4.1 Extract `RepoCard` and `BlueskyPostCard` from `website/pages/stars/[date].tsx` into `website/components/stars/RepoCard.tsx` and `website/components/stars/BlueskyPostCard.tsx`; re-export from original location to avoid breaking existing imports
- [x] 4.2 Create `PersonCard` component — avatar, name, platform badges, link to detail page (used on people index grid)
- [x] 4.3 Create `PlatformBadge` component — small badge with GitHub or Bluesky icon and handle text
- [x] 4.4 Create `ActivitySparkline` component — inline SVG polyline rendering 30-day activity data

## 5. People Index Page

- [x] 5.1 Create `website/pages/stars/people/index.tsx` with `getStaticProps` loading all people via `getAllPeople()`
- [x] 5.2 Implement responsive grid layout of `PersonCard` components, sorted alphabetically by name
- [x] 5.3 Add page `<Head>` with title "People — Stars — Kylin Miao" and meta description
- [x] 5.4 Add back link to `/stars/` and dark theme styling consistent with existing stars pages

## 6. Person Detail Page

- [x] 6.1 Create `website/pages/stars/people/[handle].tsx` with `getStaticPaths` (from `getAllPersonIds()`, `fallback: false`) and `getStaticProps` (from `getPersonByHandle()`)
- [x] 6.2 Implement profile header section — avatar, name, bio, external platform links (GitHub / Bluesky)
- [x] 6.3 Implement "Recent interests" AI summary section with AI badge (hide if no summary)
- [x] 6.4 Render `ActivitySparkline` component with person's dailyCounts data
- [x] 6.5 Render chronological list of recent activity items using shared `RepoCard` and `BlueskyPostCard` components
- [x] 6.6 Add page `<Head>` with title "{Name} — Stars — Kylin Miao"
- [x] 6.7 Add back link to `/stars/people/`

## 7. Author Links on Date Pages

- [x] 7.1 Update `getStaticProps` in `website/pages/stars/[date].tsx` to load handle-to-person-ID map via `getHandleToPersonMap()` and pass it as a prop
- [x] 7.2 Update `RepoCard` to render `starredBy` as a `<Link>` to `/stars/people/{id}/` when the author exists in the map
- [x] 7.3 Update `BlueskyPostCard` to render author display name as a `<Link>` to the person's profile page when the author handle exists in the map

## 8. Testing & Verification

- [x] 8.1 Add unit tests for `website/lib/people.ts` functions (getAllPeople, getPersonByHandle, getHandleToPersonMap)
- [x] 8.2 Run `npm run type-check` to verify no TypeScript errors
- [x] 8.3 Run `npm run lint` to verify no ESLint errors
- [x] 8.4 Run `just build` end-to-end and verify people pages are generated in the static export
