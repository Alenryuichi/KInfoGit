## Context

The Stars section of the site aggregates GitHub starred repos and Bluesky posts from ~35 AI leaders into date-based daily feeds. Data is fetched by `scripts/fetch-stars.ts` and `scripts/fetch-bluesky.ts`, stored as per-date JSON in `profile-data/github-stars/` and `profile-data/bluesky-posts/`, and served via `website/lib/social-feeds.ts` through SSG pages at `/stars/[date]`.

Currently there is no concept of a "person" that spans platforms — a GitHub user `karpathy` and a Bluesky handle `karpathy.bsky.social` are unconnected. The person-to-platform mapping lives implicitly in the fetch scripts' hardcoded arrays.

Constraints:
- Pure SSG / static export — no runtime server, no API routes.
- GitHub Pages hosting — `unoptimized: true` for images, no ISR.
- Existing dark theme with Tailwind utility classes.

## Goals / Non-Goals

**Goals:**
- Introduce a canonical "person" entity that links GitHub + Bluesky identities.
- Provide an index page for browsing all tracked people.
- Provide a detail page per person showing their cross-platform activity.
- Generate per-person data at build time so pages are fully static.

**Non-Goals:**
- Real-time or on-demand data fetching (SSG only).
- User-facing search or filtering on the people index (can be added later).
- Automatic person discovery — the `people.json` registry is hand-curated.
- Per-person RSS feeds or notifications.
- Pagination of activity items (show last 30 days, truncate if needed).

## Decisions

### 1. Person identity: canonical `id` in `people.json`

Each tracked person gets an entry in `profile-data/people.json`:

```json
[
  {
    "id": "karpathy",
    "name": "Andrej Karpathy",
    "bio": "AI educator, ex-Tesla/OpenAI",
    "github": "karpathy",
    "bluesky": "karpathy.bsky.social",
    "avatar": "https://avatars.githubusercontent.com/u/241138"
  }
]
```

The `id` is used as the URL slug (`/stars/people/karpathy/`). Platform fields are optional (some people may only be on one platform). Avatar URLs point to GitHub's CDN or Bluesky's CDN — no local copies.

**Alternative considered**: Derive person mapping automatically from display names. Rejected because name matching across platforms is unreliable and the list is small enough to curate by hand.

### 2. Build-time aggregation script

A new `scripts/generate-people-data.ts` script runs before `next build` (added to `just build`). It:

1. Reads `people.json` for the person registry.
2. Scans existing `profile-data/github-stars/*.json` and `profile-data/bluesky-posts/*.json`.
3. For each person, collects their starred repos and Bluesky posts from the last 30 days.
4. Computes a per-day activity count array (for sparklines).
5. Calls DeepSeek API to generate a 1–2 sentence "recent interests" summary per person.
6. Writes output to `profile-data/people-activity/{id}.json`.

**Alternative considered**: Compute aggregation inside `getStaticProps`. Rejected because scanning all date files per-person per-page would be slow and redundant; a single pre-build pass is more efficient and keeps the Next.js data layer simple.

### 3. Data layer: `website/lib/people.ts`

A new module that reads `people.json` and per-person activity JSON:

- `getAllPeople()` → array of person summaries (for index page).
- `getPersonByHandle(handle: string)` → full person data with activity (for detail page).

This follows the same pattern as `social-feeds.ts` — read JSON files at build time via `fs`.

### 4. SSG routing

- `/stars/people/` → `website/pages/stars/people/index.tsx` using `getStaticProps`.
- `/stars/people/[handle].tsx` using `getStaticPaths` (from `people.json` ids) + `getStaticProps`.

Pages Router, same as existing `[date].tsx`. `fallback: false` since the person list is fixed at build time.

### 5. Activity sparkline: inline SVG

A small `ActivitySparkline` React component renders a 30-point SVG polyline. No charting library dependency. Data is an array of 30 numbers (activity count per day). Rendered at ~200×40px with a subtle gradient fill.

**Alternative considered**: Use a charting library (recharts, visx). Rejected to avoid adding a dependency for a single tiny chart. A hand-rolled SVG polyline is ~30 lines of code.

### 6. Author links on date pages

In `[date].tsx`, the `starredBy` field in `RepoCard` and the author handle in `BlueskyPostCard` become `<Link>` components pointing to `/stars/people/{id}/`. The mapping from GitHub username / Bluesky handle to person `id` is provided via a lookup map loaded in `getStaticProps`.

### 7. Component structure

- `PersonCard` — used on the index grid. Shows avatar, name, platform badges.
- `PlatformBadge` — small badge with GitHub/Bluesky icon + handle.
- `ActivitySparkline` — SVG sparkline of daily activity.

All components use Tailwind, dark theme, consistent with existing card styling in `[date].tsx`.

## Risks / Trade-offs

- **Build time increase** → The aggregation script adds one pass over all daily JSON files plus one DeepSeek API call per person (~35 calls). Mitigated by caching: skip regeneration if `people-activity/{id}.json` is newer than the latest feed file.
- **Avatar URL stability** → GitHub/Bluesky avatar CDN URLs may change. Mitigated by refreshing URLs during each `fetch-stars` / `fetch-bluesky` run; `people.json` avatar is a fallback.
- **Stale interest summaries** → Summaries are only regenerated on build. Acceptable since the site is rebuilt daily by CI.
- **Handle changes** → If a Bluesky user changes their handle, the mapping in `people.json` breaks silently. Mitigated by using DID-based lookups in the future; for now, manual maintenance is fine given the small list.
