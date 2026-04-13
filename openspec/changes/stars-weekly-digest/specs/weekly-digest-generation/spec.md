## ADDED Requirements

### Requirement: Weekly digest aggregation
The system SHALL aggregate all GitHub stars and Bluesky posts from a 7-day period (Monday through Sunday, ISO week) into a single dataset for digest generation.

#### Scenario: Full week of data
- **WHEN** the generate-weekly-digest script runs for ISO week 2026-W15 (2026-04-06 through 2026-04-12)
- **THEN** the script SHALL read all daily data files from `profile-data/github-stars/` and `profile-data/bluesky-posts/` for dates 2026-04-06 through 2026-04-12 inclusive

#### Scenario: Partial week data
- **WHEN** some days within the week have no data files
- **THEN** the script SHALL aggregate whatever days have data and include a `daysWithContent` stat reflecting the actual count

#### Scenario: No data for the week
- **WHEN** no data files exist for any day in the target week
- **THEN** the script SHALL skip digest generation for that week and log a message

### Requirement: Cross-reference detection
The system SHALL identify repos that were starred by multiple people within the same week.

#### Scenario: Repo starred by multiple users
- **WHEN** the repo `owner/name` appears in GitHub stars from two or more different `starredBy` users in the same week
- **THEN** the cross-references section SHALL include that repo with the list of users who starred it

#### Scenario: No cross-references
- **WHEN** no repos were starred by more than one user in the week
- **THEN** the cross-references array SHALL be empty

### Requirement: DeepSeek summary generation
The system SHALL call the DeepSeek API to generate a structured weekly summary containing overview, trending topics, notable repos, key discussions, and cross-references.

#### Scenario: Successful API response
- **WHEN** the DeepSeek API returns a valid response
- **THEN** the script SHALL parse the response and write a structured JSON file to `profile-data/weekly-digests/YYYY-WXX.json`

#### Scenario: API key not configured
- **WHEN** the `DEEPSEEK_API_KEY` environment variable is not set
- **THEN** the script SHALL log a warning and exit without error

#### Scenario: API error or malformed response
- **WHEN** the DeepSeek API returns an error or unparseable response
- **THEN** the script SHALL log a warning and write a minimal digest containing only computed stats and cross-references (no AI-generated text)

### Requirement: Idempotent generation
The system SHALL skip digest generation for weeks that already have a non-empty digest file.

#### Scenario: Existing digest file
- **WHEN** the file `profile-data/weekly-digests/2026-W15.json` already exists with a non-empty `overview` field
- **THEN** the script SHALL skip generation for week 2026-W15 and log that it was skipped

#### Scenario: Empty or corrupt existing file
- **WHEN** the existing digest file is empty or contains invalid JSON
- **THEN** the script SHALL regenerate the digest for that week

### Requirement: Weekly digest JSON schema
The output file SHALL conform to the following structure: `week` (string, ISO week), `dateRange` (object with `start` and `end` date strings), `overview` (string), `trendingTopics` (array of topic objects), `notableRepos` (array of repo objects with `starredBy` arrays), `keyDiscussions` (array), `crossReferences` (array of repos with multiple starrers), and `stats` (object with `totalRepos`, `totalPosts`, `uniqueAuthors`, `daysWithContent`).

#### Scenario: Output file structure
- **WHEN** a weekly digest is successfully generated
- **THEN** the output JSON file SHALL contain all required top-level fields: `week`, `dateRange`, `overview`, `trendingTopics`, `notableRepos`, `keyDiscussions`, `crossReferences`, `stats`

### Requirement: CI workflow integration
The weekly digest generation step SHALL be added to the `sync-stars.yml` workflow, running after the daily summaries step.

#### Scenario: Workflow execution order
- **WHEN** the sync-stars workflow runs
- **THEN** the weekly digest generation step SHALL execute after "Generate daily summaries" and before "Check for changes"

#### Scenario: Digest files committed
- **WHEN** the weekly digest generation produces new or updated files
- **THEN** the files SHALL be included in the automated commit alongside other data changes
