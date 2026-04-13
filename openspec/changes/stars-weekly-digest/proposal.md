## Why

The Stars feature currently shows daily feeds without any higher-level aggregation. Users visiting `/stars/` see a flat list of dates and must click through each day individually. A weekly digest provides a curated overview of the week's most important trends, cross-references repos starred by multiple people, and surfaces patterns that are invisible at the daily level — reducing noise and increasing signal for weekly visitors.

## What Changes

- **New build-time script** `scripts/generate-weekly-digest.ts` that aggregates the past 7 days of GitHub stars + Bluesky posts and calls DeepSeek to produce a structured weekly summary
- **New data directory** `profile-data/weekly-digests/` storing digest JSON files named `YYYY-WXX.json` (ISO week numbering)
- **New data layer functions** in `website/lib/social-feeds.ts` to load and serve weekly digest data at build time
- **Updated list page** `/stars/` with a collapsible "This Week" card displayed above the daily date list
- **New detail pages** at `/stars/weekly/YYYY-WXX/` for full weekly digest view
- **Updated CI workflow** `.github/workflows/sync-stars.yml` to run the weekly digest generator after daily summaries

## Capabilities

### New Capabilities
- `weekly-digest-generation`: Build-time script that aggregates 7 days of stars/posts data, calls DeepSeek for structured weekly summary (trending topics, notable repos, key discussions, cross-references), and writes `YYYY-WXX.json` files
- `weekly-digest-display`: UI components and pages for showing weekly digests — collapsible card on `/stars/` list page and detail pages at `/stars/weekly/YYYY-WXX/`

### Modified Capabilities
<!-- No existing spec-level requirements are changing. The daily summary feature, social-feeds data layer, and CI workflow are being extended but their existing behavior is unchanged. -->

## Impact

- **New files**: `scripts/generate-weekly-digest.ts`, `website/pages/stars/weekly/[week].tsx`, `profile-data/weekly-digests/*.json`
- **Modified files**: `website/lib/social-feeds.ts` (new exports for weekly data), `website/pages/stars.tsx` (add digest card), `.github/workflows/sync-stars.yml` (add step)
- **Dependencies**: No new npm dependencies (uses same `fetch` + DeepSeek API pattern as existing scripts)
- **API keys**: Reuses existing `DEEPSEEK_API_KEY` secret
