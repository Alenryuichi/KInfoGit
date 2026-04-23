## ADDED Requirements

### Requirement: Weekly digest data layer

The system SHALL provide `website/lib/ai-daily-weekly.ts` exporting the following build-time functions that read from `profile-data/ai-daily-weekly/` via `resolveProfileDataPath('ai-daily-weekly')`:

- `getAllAiDailyWeeklies(): AiDailyWeeklySummary[]` — returns every weekly digest sorted by `weekId` descending, excluding the current in-progress ISO week
- `getAiDailyWeeklyByWeek(weekId: string): AiDailyWeeklyDigest | null` — returns the full digest for a given `YYYY-WXX` id
- `getAdjacentAiDailyWeeks(weekId: string): { prev: string | null; next: string | null }` — returns neighbor weekIds for prev/next navigation
- `getLatestAiDailyWeekly(): AiDailyWeeklyDigest | null` — returns the most recent published weekly digest

These functions MUST be callable only at build time (inside `getStaticProps` / `getStaticPaths`) and MUST NOT be bundled into client-side JavaScript.

#### Scenario: Current ISO week is filtered out

- **WHEN** today is `2026-04-23` (Thursday of ISO week `2026-W17`) and `profile-data/ai-daily-weekly/` contains `2026-W16.json` and `2026-W17.json`
- **THEN** `getAllAiDailyWeeklies()` only returns the summary for `2026-W16`

#### Scenario: Missing week returns null

- **WHEN** a caller requests `getAiDailyWeeklyByWeek('2026-W14')` but no such file exists
- **THEN** the function returns `null` without throwing

### Requirement: Weekly detail page at /ai-daily/weekly/[week]

The page `website/pages/ai-daily/weekly/[week].tsx` SHALL be statically generated for every weekId returned by `getAllAiDailyWeeklies()` and SHALL render a Bento Grid layout with:

- Header: back-link to `/ai-daily/`, prev/next week navigation, week id, date range, and signal-radar badge
- Stats strip: `totalItems`, `uniqueTopics`, `daysWithContent`, plus the three highest-count topics as color-accented large numbers
- Left column (3/5): Overview paragraphs, Top Stories by Topic (sub-cards per v2 topic, each story row with `▲ score` badge + title + oneLiner + sources meta), Key Reads (italic `→ why` annotations)
- Right column (2/5): Trending Topics, Topic Spread (including legacy v1 topics rendered semi-transparent with `(legacy)` label), Daily Logs (7 links to `/ai-daily/YYYY-MM-DD/`)
- Footer: entry-count mono row + `Powered by DeepSeek`

#### Scenario: Known week renders with full data

- **WHEN** a user navigates to `/ai-daily/weekly/2026-W16/` and `2026-W16.json` contains 20 stories across 8 v2 topics
- **THEN** the page renders all 8 topic sub-cards, the stats strip reports the correct `totalItems`, and the Daily Logs section shows 7 date links

#### Scenario: Unknown week returns 404

- **WHEN** a user navigates to `/ai-daily/weekly/2026-W10/` and no such file exists
- **THEN** the build produces no page for that path (`fallback: false`) and Next.js returns 404

### Requirement: Weekly banner on /ai-daily listing

The page `website/pages/ai-daily.tsx` SHALL call `getLatestAiDailyWeekly()` in `getStaticProps` and, when the result is non-null, render a banner above the daily list containing a `WEEKLY` badge, the week id, the date range, signal/topic counts, a truncated overview (first paragraph, max 220 characters), the top three topic chips, and a `Read full digest →` link to `/ai-daily/weekly/<weekId>/`. When `getLatestAiDailyWeekly()` returns `null`, no banner SHALL be rendered.

#### Scenario: Banner renders with latest week

- **WHEN** `2026-W16` is the latest published weekly and a user visits `/ai-daily/`
- **THEN** the banner displays `WEEKLY 2026-W16 • Apr 13 – Apr 19` with the truncated overview and a working `Read full digest →` link

#### Scenario: Banner hidden when no weekly exists

- **WHEN** `profile-data/ai-daily-weekly/` is empty
- **THEN** `/ai-daily/` renders normally without the banner and without layout collapse

### Requirement: Pagefind integration for weekly pages

Each `/ai-daily/weekly/[week]/` page SHALL include `data-pagefind-body` on its content container and emit `data-pagefind-meta` attributes for `title`, `weekId`, and `dateRange` so that static-site search indexing picks up weekly digests alongside daily digests.

#### Scenario: Weekly digest is indexed by Pagefind

- **WHEN** the SSG build runs and the Pagefind indexer walks the generated HTML
- **THEN** searching for a unique phrase from `2026-W16.json`'s overview returns the `/ai-daily/weekly/2026-W16/` page in results
