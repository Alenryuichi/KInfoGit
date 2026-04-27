## 1. Data Layer — Types & Config

- [x] 1.1 Create `scripts/spec-tracker/types.ts` with SpecFramework, SpecSnapshot, DiscoveredProject interfaces
- [x] 1.2 Create `scripts/spec-tracker/config.ts` with 8 framework configs (id, name, category, sources) and discovery search terms

## 2. Data Sources

- [x] 2.1 Create `scripts/spec-tracker/sources/github-stats.ts` — fetch stars, forks, open_issues, pushed_at, latest release, weekly commits, contributors for repos with GITHUB_TOKEN auth and 202 retry logic
- [x] 2.2 Create `scripts/spec-tracker/sources/npm-downloads.ts` — fetch weekly downloads from api.npmjs.org + latest version/publishedAt from registry.npmjs.org
- [x] 2.3 Create `scripts/spec-tracker/sources/discovery.ts` — GitHub Search API (spec-driven/ai-coding-spec, stars>50, pushed<90d) + npm search, deduplicate against fixed list, cap at 10

## 3. Pipeline Entry Point

- [x] 3.1 Create `scripts/spec-tracker/fetch-spec-data.ts` — main entry: parallel-fetch all sources via Promise.allSettled, assemble SpecSnapshot, write latest.json + history/YYYY-MM-DD.json
- [x] 3.2 Create `profile-data/specs/` directory with .gitkeep

## 4. GitHub Action

- [x] 4.1 Create `.github/workflows/fetch-specs.yml` — daily cron at UTC 05:23, workflow_dispatch, run pipeline, commit changes to profile-data/specs/

## 5. Website Data Layer

- [x] 5.1 Create `website/lib/spec-tracker.ts` — getLatestSpecs() reads latest.json, getSpecTrend() reads history/*.json and returns per-framework stars time series

## 6. Website Components

- [x] 6.1 Create `website/components/spec-tracker/SpecHeroCards.tsx` — top 4 by stars, show name + stars + latest version + fill bar
- [x] 6.2 Create `website/components/spec-tracker/StarsTrendChart.tsx` — multi-line SVG chart (reuse OrgTrendChart pattern: right-side labels, top-N emphasis, resolveOverlap)
- [x] 6.3 Create `website/components/spec-tracker/NpmDownloadsChart.tsx` — horizontal bar chart showing weekly downloads (reuse HorizontalBarChart pattern)
- [x] 6.4 Create `website/components/spec-tracker/FrameworkTable.tsx` — comparison table: name, stars, npm/wk, category, latest version, last update
- [x] 6.5 Create `website/components/spec-tracker/RecentActivity.tsx` — per-framework changelog entries grouped by framework
- [x] 6.6 Create `website/components/spec-tracker/EmergingSpecs.tsx` — discovered projects list with name, stars, description, URL

## 7. Page

- [x] 7.1 Create `website/pages/code/specs.tsx` — getStaticProps loading specs data + trend data, page layout with all 6 sections, back link to /code/, empty state handling

## 8. Verification

- [x] 8.1 Run `npx tsx scripts/spec-tracker/fetch-spec-data.ts` and verify latest.json output contains all 8 frameworks + discovered projects
- [x] 8.2 Run `cd website && npm run type-check` with no errors
- [x] 8.3 Verify `/code/specs/` page renders correctly in dev server
