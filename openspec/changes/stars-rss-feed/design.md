## Context

The site is a Next.js 16 Pages Router static site (`output: 'export'`) deployed to GitHub Pages. The Stars & Posts feature displays daily curated GitHub starred repos and Bluesky posts from AI leaders, grouped by date with AI-generated summaries.

Data lives in `profile-data/`:
- `github-stars/YYYY-MM-DD.json` — starred repos per day
- `bluesky-posts/YYYY-MM-DD.json` — Bluesky posts per day
- `daily-summaries/YYYY-MM-DD.json` — AI summary per day

The existing data layer (`website/lib/social-feeds.ts`) reads these files at build time via `getStaticProps`. Since the site uses `output: 'export'`, API routes are unavailable — any dynamic content must be pre-generated as static files.

## Goals / Non-Goals

**Goals:**
- Provide an RSS 2.0 feed at `/stars/feed.xml` so readers can subscribe to daily Stars & Posts updates
- Generate the feed as a static XML file at build time (compatible with `output: 'export'`)
- Include the last 30 days of entries, one item per day
- Make the feed discoverable via `<link rel="alternate">` and a visible RSS icon

**Non-Goals:**
- Atom feed format (RSS 2.0 is sufficient; Atom can be added later)
- Per-item (per-repo/per-post) RSS entries — items are grouped by day
- Real-time feed updates — feed regenerates on each workflow run or site build
- Full HTML rendering in RSS descriptions — plain text with basic formatting is fine

## Decisions

### 1. Generate XML as a raw string (no RSS library)

The RSS 2.0 format is simple enough that template literals with proper XML escaping suffice. This avoids adding a dependency for a straightforward XML structure.

**Alternative considered**: Using a library like `feed` or `rss`. Rejected because it adds a dependency for ~50 lines of XML templating.

### 2. Standalone build script at `scripts/generate-stars-rss.ts`

The script runs via `npx tsx` (already used in the workflow), reads data files directly from `profile-data/`, and writes to `website/public/stars/feed.xml`. This follows the existing pattern of `scripts/fetch-stars.ts` and `scripts/generate-summaries.ts`.

**Alternative considered**: Generating the feed inside `next.config.js` via a webpack plugin or custom build step. Rejected because it couples RSS generation to the Next.js build, while the data sync workflow needs to regenerate the feed independently.

### 3. Output to `website/public/stars/feed.xml`

Files in `website/public/` are served as-is in the static export. Placing the feed at `stars/feed.xml` makes it available at `/stars/feed.xml`, co-located with the Stars pages.

### 4. One RSS item per day

Each `<item>` represents a full day's content. The title is "Stars & Posts — YYYY-MM-DD", the description contains the AI summary followed by a list of repos and posts, and the link points to `/stars/YYYY-MM-DD/`.

### 5. RSS generation runs in CI after summary generation

In `sync-stars.yml`, the RSS generation step runs after `generate-summaries.ts` and before the git commit step, so the feed.xml is committed alongside the data.

## Risks / Trade-offs

- **[Stale feed]** The feed is only updated when the sync workflow runs (weekly) or the site is rebuilt. → Acceptable for a personal site; the feed clearly shows dates.
- **[XML escaping]** User-generated content (repo descriptions, post text) could contain XML-unsafe characters. → The script must escape `&`, `<`, `>`, `"`, `'` in all text content.
- **[Large descriptions]** Days with many repos/posts could produce long RSS item descriptions. → Truncate or limit the listing if needed; RSS readers handle variable-length content well.
- **[feed.xml in git]** Committing a generated file adds churn. → Acceptable; it's one small file that changes weekly.
