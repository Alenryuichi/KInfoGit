## ADDED Requirements

### Requirement: Scan github-stars for co-starred repos over a rolling 30-day window

The system SHALL provide `scripts/ai-daily/sources/stars-co-starred.ts` exporting `fetchCoStarredItems(projectRoot: string): Promise<RawNewsItem[]>`. The function SHALL read up to 30 consecutive daily files under `profile-data/github-stars/YYYY-MM-DD.json` (ending at today in Asia/Shanghai), aggregate `starredBy` handles per repo into Sets, and return items whose Set size is `>= 2` (minCount).

#### Scenario: Repo with two independent starrers qualifies

- **WHEN** `profile-data/github-stars/` contains `2026-04-01.json` with `starredBy: 'simonw'` for `repo-A` and `2026-04-10.json` with `starredBy: 'minimaxir'` for `repo-A`
- **THEN** `fetchCoStarredItems()` emits a RawNewsItem for `repo-A` with summary beginning `"Starred by 2 leaders (minimaxir, simonw): ..."`

#### Scenario: Solo-starred repo is filtered out

- **WHEN** a repo appears across the window but only ever has a single distinct handle in `starredBy`
- **THEN** that repo is excluded from the returned items

#### Scenario: Missing or corrupted daily file is skipped

- **WHEN** one of the 30 daily JSON files is absent or contains malformed JSON
- **THEN** that file is skipped silently and aggregation proceeds with the remaining files

#### Scenario: starredBy may be a single string or an array

- **WHEN** `star.starredBy` on a given record is the string `"karpathy"` (not an array)
- **THEN** the function coerces it into a single-entry set for that day and aggregates normally

### Requirement: Emit RawNewsItem with synthetic summary and canonical URL

Each qualifying repo SHALL be emitted as a `RawNewsItem` with these field mappings:

- `title = repo` (e.g. `"huggingface/ml-intern"`)
- `url = https://github.com/<repo>` (or the value of `star.url` if present and well-formed)
- `summary = "Starred by <N> leaders (<up to 3 handles>): <description>"`, capped at 500 chars
- `sourceName = "Co-Starred"`
- `sourceType = "rss"`
- `publishedAt = latestDate` (the latest YYYY-MM-DD at which any handle starred this repo in the window)

#### Scenario: Summary leads with social-proof signal

- **WHEN** a repo is starred by 2 leaders and has a 200-char description
- **THEN** the generated summary starts with `"Starred by 2 leaders"` so the signal is never truncated when the 500-char cap clips the description

#### Scenario: Handles are deduped and sorted when listed

- **WHEN** the same handle appears multiple times for the same repo across different days
- **THEN** the summary lists the handle once, and handles in the listing are in sorted order

#### Scenario: Description-less repo still emits a valid summary

- **WHEN** `star.description` is empty or missing
- **THEN** the summary is `"Starred by <N> leaders (<handles>):"` with no trailing description fragment, and the item is still emitted

### Requirement: Cap output to top 10 items sorted by count / score / stars

The function SHALL sort qualifying items by `starredBy.size` DESC, then `maxScore` DESC, then `stargazersCount` DESC, and return at most the top 10.

#### Scenario: Fewer than 10 qualifying items returns all of them

- **WHEN** the window yields 2 qualifying repos
- **THEN** exactly 2 items are returned in the sorted order

#### Scenario: More than 10 qualifying items is capped

- **WHEN** the window yields 15 qualifying repos (hypothetical future state)
- **THEN** only the top 10 by the sort order are returned

### Requirement: Integrate into AI Daily pipeline and metrics

The function SHALL be invoked from `scripts/ai-daily/fetch-ai-daily.ts` via `Promise.allSettled` alongside the other source fetchers. Its result SHALL be merged into `allRaw` and counted into `metrics.recordSources({ coStarred: N, ... })`. The schema `SourceBreakdown` SHALL include `coStarred: number`, and `RunRecord.sources` (consumed by `/ai-daily/metrics`) SHALL include optional `coStarred?: number`.

#### Scenario: Co-starred count appears in run record

- **WHEN** the pipeline runs and `fetchCoStarredItems()` returns 2 items
- **THEN** the record appended to `profile-data/ai-daily/_meta/YYYY-MM.json` has `sources.coStarred: 2`

#### Scenario: Fetch failure doesn't kill the pipeline

- **WHEN** `fetchCoStarredItems()` throws (e.g. profile-data/github-stars directory missing)
- **THEN** Promise.allSettled captures the rejection, a warning is logged, and the rest of the pipeline proceeds with `coStarred = 0`

### Requirement: Display co-starred band on /ai-daily/metrics

The `/ai-daily/metrics` `SourceStackChart` SHALL include a color band for `coStarred` (lime `#a3e635`) stacked alongside the existing six source bands (rss/search/social/horizon/github/reddit). The legend beneath the chart SHALL include a `■ co-starred` entry.

#### Scenario: Seventh stacked band visible in rendered SVG

- **WHEN** a run has `sources.coStarred: 2` and the metrics page renders
- **THEN** the stacked bar for that date shows a lime segment sized proportionally to 2 items out of the day's total; the legend row shows the `■ co-starred` token

#### Scenario: Empty co-starred day shows no lime segment

- **WHEN** a run has `sources.coStarred: 0`
- **THEN** the bar for that date renders without a lime segment (other colors unaffected)
