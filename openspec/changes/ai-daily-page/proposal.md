## Why

The site currently has Blog and Work pages for authored content, but no automated, curated AI news feed. As an AI Agent Engineer, having a daily AI news digest on the personal site demonstrates domain engagement and provides value to visitors. Horizon (open-source AI news aggregator) can auto-generate daily digests from HN, arXiv, Reddit, and RSS — fitting perfectly into the existing SSG + GitHub Actions CI pattern already used for Yuque sync.

## What Changes

- Add Horizon integration as a Python-based sync script triggered by GitHub Actions cron (daily)
- Add a conversion script to transform Horizon's Markdown output into structured JSON under `profile-data/ai-daily/`
- Add new `pages/ai-daily.tsx` (list) and `pages/ai-daily/[date].tsx` (detail) pages with TLDR-style minimal UI
- Add "AI Daily" tab to the site navigation header
- Add `getStaticProps`/`getStaticPaths` data loading for AI daily content

## Capabilities

### New Capabilities
- `horizon-sync`: Horizon integration — GitHub Actions workflow that runs Horizon daily, converts output to JSON, and commits to the repo
- `ai-daily-page`: New AI Daily pages — list view (latest dates) and detail view (single day's content) with TLDR-style layout
- `ai-daily-nav`: Navigation integration — add AI Daily tab to header, with active state detection

### Modified Capabilities
_(none — all new pages and pipelines, no existing behavior changes)_

## Impact

- `scripts/` — new Horizon config and conversion script
- `.github/workflows/` — new `sync-horizon.yml` workflow
- `profile-data/ai-daily/` — new data directory for daily JSON files
- `website/pages/` — new `ai-daily.tsx` and `ai-daily/[date].tsx`
- `website/components/` — new AI Daily components (list, detail, news item)
- `website/components/Header.tsx` — add nav item
- `website/lib/` — new data loading functions for AI daily
- Dependencies: Horizon (Python, runs in CI only, not a website dependency)
