## ADDED Requirements

### Requirement: Aggregate historical benchmark data at build time
The system SHALL provide a `getBenchmarkHistory()` function in `website/lib/code-weekly.ts` that reads all JSON files from `profile-data/benchmarks/history/` directory, extracts benchmark data from each, and returns a structured time-series array. This function MUST be called only at build time (inside `getStaticProps`).

#### Scenario: Multiple history files are aggregated
- **WHEN** the `profile-data/benchmarks/history/` directory contains files `2026-04-10.json`, `2026-04-11.json`, `2026-04-12.json`
- **THEN** `getBenchmarkHistory()` returns a `BenchmarkTimeSeries[]` array with entries sorted chronologically, each containing the date and per-benchmark model scores/ranks

#### Scenario: Empty history directory
- **WHEN** the `profile-data/benchmarks/history/` directory is empty or does not exist
- **THEN** `getBenchmarkHistory()` returns an empty array without throwing an error

#### Scenario: Malformed history file is skipped
- **WHEN** a JSON file in the history directory contains invalid JSON or is missing required fields
- **THEN** that file is skipped and the function continues processing remaining files without error

### Requirement: Time-series data structure
The `getBenchmarkHistory()` function SHALL return data in the `BenchmarkTimeSeries` interface format:
- `benchmarkId`: string identifier (`'arena-coding'`, `'swe-bench'`, `'aider'`, `'livecodebench'`)
- `points`: array of `{ date: string, models: Array<{ model: string, value: number, rank: number, org: string }> }` sorted by date ascending

#### Scenario: Data structure for Arena Coding benchmark
- **WHEN** a history file dated `2026-04-13` contains arenaRanking with Claude Opus 4.6 Thinking at rank 1 with Elo 1548
- **THEN** the `arena-coding` time-series includes a point `{ date: '2026-04-13', models: [{ model: 'Claude Opus 4.6 Thinking', value: 1548, rank: 1, org: 'Anthropic' }, ...] }`

#### Scenario: Data structure for percentage-based benchmarks
- **WHEN** a history file contains sweBench entries with model scores as percentages
- **THEN** the `swe-bench` time-series point includes the `resolved` percentage as the `value` field

### Requirement: Limit historical data to last 90 days
The `getBenchmarkHistory()` function SHALL only include data from the most recent 90 days to keep the serialized page props manageable.

#### Scenario: Data older than 90 days is excluded
- **WHEN** the history directory contains files spanning 120 days
- **THEN** `getBenchmarkHistory()` only returns data points from the most recent 90 days

### Requirement: Extract top-N models per snapshot
For each daily snapshot, the function SHALL extract only the top 10 models per benchmark to limit data size.

#### Scenario: Only top 10 models included per benchmark per day
- **WHEN** a history file's arenaRanking contains 30 models
- **THEN** the corresponding time-series point includes only the top 10 models by rank/score

### Requirement: Benchmarks page passes history data via getStaticProps
The `website/pages/code/benchmarks.tsx` page SHALL call `getBenchmarkHistory()` in its `getStaticProps` and pass the result as a `history` prop to the page component.

#### Scenario: History data available to page components
- **WHEN** the benchmarks page is built via SSG
- **THEN** the page component receives a `history: BenchmarkTimeSeries[]` prop containing aggregated historical data, which is passed to `BenchmarkSection` components for rendering trend views
