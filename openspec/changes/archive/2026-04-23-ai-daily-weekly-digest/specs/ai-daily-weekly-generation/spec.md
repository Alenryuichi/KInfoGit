## ADDED Requirements

### Requirement: Aggregate a full ISO week of AI Daily content at build time

The system SHALL provide a build-time script `scripts/generate-ai-daily-weekly-digest.ts` that, for each complete ISO week (Monday–Sunday, UTC) with at least `MIN_DAYS_WITH_CONTENT=4` daily files under `profile-data/ai-daily/YYYY-MM-DD.json`, aggregates all `NewsItem[]` across those 7 files, filters by `score >= MIN_SCORE_WEEKLY (=6.0)`, de-duplicates by canonical URL (stripping `utm_*` and similar tracking params; keeping the highest-scored entry when the same canonical URL appears multiple times), and writes the result to `profile-data/ai-daily-weekly/YYYY-WXX.json`.

#### Scenario: Week with full 7 days of data is generated

- **WHEN** the week 2026-W16 has all 7 daily files present and `--force` is not supplied
- **THEN** the script writes `profile-data/ai-daily-weekly/2026-W16.json` containing `weekId`, `startDate`, `endDate`, `totalItems`, `daysWithContent`, `topicCounts`, and DeepSeek-generated fields

#### Scenario: Current (in-progress) week is skipped

- **WHEN** the script runs and the current ISO week (based on UTC today) is encountered
- **THEN** the current week is skipped without producing a file, regardless of how many daily files it already has

#### Scenario: Week with fewer than MIN_DAYS_WITH_CONTENT is skipped

- **WHEN** a week only has 2 or 3 daily files present (e.g. 2026-W15 with only 2026-04-10 and 2026-04-12)
- **THEN** the script logs a skip reason and does not write the weekly JSON

#### Scenario: Idempotent re-runs

- **WHEN** a weekly JSON already exists and `--force` is not supplied
- **THEN** the script leaves the existing file untouched and moves on to the next candidate week

#### Scenario: Forced regeneration

- **WHEN** the script is invoked with `--force`
- **THEN** it regenerates every eligible week, overwriting existing JSON files

### Requirement: Bucket items by v2 focusTopic and truncate per topic

The script SHALL bucket the filtered items by each entry's `focusTopics[]` array, expanding entries with multiple focus topics into each bucket. Only the 8 v2 focusTopics defined in `FOCUS_TOPICS` (`coding-agents`, `context-engineering`, `agent-harness`, `planning`, `tool-use`, `post-training`, `model-release`, `evals`) are included in the prompt payload. Legacy v1 topics (e.g. `memory`, `reflection`, `multi-agent`, `self-evolution`) MUST still contribute to `topicCounts` for display but MUST NOT appear in the prompt's topic sections. For each v2 topic, only the top `PER_TOPIC_TOP=8` items by score are forwarded to DeepSeek.

#### Scenario: Items with multiple focusTopics are counted in each bucket

- **WHEN** an item has `focusTopics: ['coding-agents', 'tool-use']`
- **THEN** it appears in both the `coding-agents` and `tool-use` buckets in the prompt payload

#### Scenario: Legacy topic counts are preserved but not prompted

- **WHEN** the aggregated pool includes 33 items tagged `memory` (a legacy v1 topic)
- **THEN** the output JSON's `topicCounts` reports `memory: 33`, but the prompt payload contains no `=== TOPIC: memory ===` section

### Requirement: Generate structured weekly digest via DeepSeek

The script SHALL call the DeepSeek API (`model: deepseek-chat`, `response_format: json_object`) with a prompt containing per-topic sections (`=== TOPIC: <id> (<total count>, top <N>) ===` followed by lines `- [score] <title> [source] — <oneLiner> <url>`) and SHALL parse the response into the `AiDailyWeeklyDigest` schema with fields `overview` (multi-paragraph narrative), `topStoriesByTopic` (record keyed by topic id), `trendingTopics` (array of topic-ranked cards), and `keyReads` (array of "must-read" entries with `why` annotations).

#### Scenario: Complete DeepSeek response is persisted

- **WHEN** DeepSeek returns a valid JSON object with all four fields populated
- **THEN** the script writes the full digest to the weekly JSON file, preserving topic ids verbatim

#### Scenario: DEEPSEEK_API_KEY not set

- **WHEN** the environment variable `DEEPSEEK_API_KEY` is missing
- **THEN** the script throws with a clear error message and does not write any output file

### Requirement: URL post-validation guardrail

After receiving the DeepSeek response, the script SHALL validate every URL appearing in `topStoriesByTopic[*].url` and `keyReads[*].url` by checking (a) the URL passes `isRealUrl()` shape validation, and (b) the URL's canonical form is present in the whitelist built from the input items. If both checks fail, the script SHALL attempt to recover by matching the story's `title` against an item-by-title map and replacing the URL. If recovery fails, the story SHALL be kept with its original URL but a fallthrough warning MUST be logged.

#### Scenario: Hallucinated URL is recovered via title match

- **WHEN** DeepSeek returns a story whose URL is not in the whitelist but whose title exactly matches an input item's title
- **THEN** the URL is replaced with the matched item's canonical URL, and a `[url-fix]` log line is emitted

#### Scenario: Unrecoverable URL is logged as fallthrough

- **WHEN** a returned URL is neither in the whitelist nor matchable by title
- **THEN** a `[url-fallthrough]` log line is emitted with the story title and original URL, and the story is kept unchanged

### Requirement: Automated generation via CI

The workflow `.github/workflows/sync-ai-daily.yml` SHALL execute `scripts/generate-ai-daily-weekly-digest.ts` after `scripts/ai-daily/fetch-ai-daily.ts` completes, and SHALL stage both `profile-data/ai-daily/` and `profile-data/ai-daily-weekly/` in the commit step so that any new weekly JSON is auto-committed alongside the daily digest.

#### Scenario: Weekly digest generated in CI when a new week becomes eligible

- **WHEN** the daily CI run on Monday 2026-04-27 (after 2026-W17 becomes complete) executes
- **THEN** the weekly step produces `profile-data/ai-daily-weekly/2026-W17.json` and the commit includes both the new daily file and the new weekly file
