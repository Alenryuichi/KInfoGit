## ADDED Requirements

### Requirement: People configuration file
The system SHALL use a JSON configuration file at `profile-data/people.json` as the canonical registry of tracked people. Each entry SHALL contain at minimum an `id` (string, used as URL slug) and a `name` (string, display name). Optional fields include `bio` (string), `github` (string, GitHub username), `bluesky` (string, Bluesky handle), and `avatar` (string, URL to avatar image).

#### Scenario: Valid people.json structure
- **WHEN** the build system reads `profile-data/people.json`
- **THEN** it parses a JSON array of objects, each with at least `id` and `name` fields

#### Scenario: Person with all fields
- **WHEN** a person entry has `id`, `name`, `bio`, `github`, `bluesky`, and `avatar` fields
- **THEN** all fields are available for use in page generation and activity aggregation

#### Scenario: Person with minimal fields
- **WHEN** a person entry has only `id` and `name` (no github, bluesky, bio, or avatar)
- **THEN** the entry is valid but the person will have no platform-linked activity and no avatar

#### Scenario: Unique person IDs
- **WHEN** the build system reads `people.json`
- **THEN** every `id` value SHALL be unique across all entries; duplicate IDs are a build error

### Requirement: Build-time activity aggregation script
The system SHALL include a build-time script (`scripts/generate-people-data.ts`) that aggregates per-person activity data from existing daily feed files. The script SHALL read `profile-data/people.json` and scan `profile-data/github-stars/*.json` and `profile-data/bluesky-posts/*.json` to collect each person's activity from the last 30 days.

#### Scenario: Aggregating GitHub stars for a person
- **WHEN** a person has `github: "karpathy"` in people.json
- **THEN** the script collects all `StarredRepo` items where `starredBy === "karpathy"` from all daily github-stars JSON files within the last 30 days

#### Scenario: Aggregating Bluesky posts for a person
- **WHEN** a person has `bluesky: "karpathy.bsky.social"` in people.json
- **THEN** the script collects all `BlueskyPost` items where `author.handle === "karpathy.bsky.social"` from all daily bluesky-posts JSON files within the last 30 days

#### Scenario: Person with no platform handles
- **WHEN** a person has neither `github` nor `bluesky` in their entry
- **THEN** the script generates an output file with empty activity arrays and zero counts

### Requirement: Per-person activity output files
The script SHALL write one JSON file per person to `profile-data/people-activity/{id}.json`. Each file SHALL contain the person's aggregated stars, posts, daily activity counts (for sparklines), and an AI-generated interest summary.

#### Scenario: Output file structure
- **WHEN** the script completes for a person with id "karpathy"
- **THEN** it writes `profile-data/people-activity/karpathy.json` containing:
  - `id`: the person's canonical id
  - `stars`: array of their StarredRepo items (last 30 days)
  - `posts`: array of their BlueskyPost items (last 30 days)
  - `dailyCounts`: array of 30 numbers (activity count per day, oldest first)
  - `interestSummary`: string with AI-generated summary (or empty string)

#### Scenario: Output directory creation
- **WHEN** the `profile-data/people-activity/` directory does not exist
- **THEN** the script creates it before writing output files

### Requirement: Activity sparkline data generation
The script SHALL compute a 30-element array of daily activity counts for each person. Each element represents the total number of GitHub stars plus Bluesky posts attributed to that person on a given day, ordered from 30 days ago to today.

#### Scenario: Person with intermittent activity
- **WHEN** a person starred 3 repos on day -5 and posted 2 Bluesky posts on day -3
- **THEN** the `dailyCounts` array has `3` at index 25, `2` at index 27, and `0` for all other indices (assuming 30-day window ending today)

#### Scenario: Person with no activity
- **WHEN** a person has no stars or posts in the last 30 days
- **THEN** the `dailyCounts` array contains 30 zeros

### Requirement: AI-generated interest summary
The script SHALL call the DeepSeek API to generate a 1-2 sentence "recent interests" summary for each person who has activity in the last 30 days. The summary SHALL describe the themes and topics the person has been starring or posting about.

#### Scenario: Generating summary for active person
- **WHEN** a person has 10 GitHub stars covering ML frameworks and 5 Bluesky posts about LLM training
- **THEN** the DeepSeek API is called with context about their recent activity and the resulting summary is stored in the `interestSummary` field

#### Scenario: Skipping summary for inactive person
- **WHEN** a person has no activity in the last 30 days
- **THEN** the script sets `interestSummary` to an empty string without calling the DeepSeek API

#### Scenario: DeepSeek API unavailable
- **WHEN** the `DEEPSEEK_API_KEY` environment variable is not set or the API returns an error
- **THEN** the script sets `interestSummary` to an empty string and continues without failing the build

### Requirement: Data layer for people pages
The system SHALL include a data layer module (`website/lib/people.ts`) that reads `profile-data/people.json` and per-person activity files for use in `getStaticProps` and `getStaticPaths`.

#### Scenario: Getting all people for index page
- **WHEN** `getAllPeople()` is called
- **THEN** it returns an array of person objects from `people.json`, each augmented with a summary activity count (total stars + posts in last 30 days)

#### Scenario: Getting person by handle for detail page
- **WHEN** `getPersonByHandle("karpathy")` is called
- **THEN** it returns the person entry from `people.json` merged with the full activity data from `profile-data/people-activity/karpathy.json`

#### Scenario: Person not found
- **WHEN** `getPersonByHandle("nonexistent")` is called
- **THEN** it returns `null`

#### Scenario: Getting all person IDs for static paths
- **WHEN** `getAllPersonIds()` is called
- **THEN** it returns an array of all `id` values from `people.json`, suitable for use in `getStaticPaths`

### Requirement: Build pipeline integration
The `generate-people-data` script SHALL be integrated into the build pipeline so it runs after `fetch-stars` and `fetch-bluesky` but before `next build`.

#### Scenario: Build pipeline order
- **WHEN** `just build` is executed
- **THEN** the pipeline runs in order: fetch-stars → fetch-bluesky → generate-people-data → generate-covers → next build

#### Scenario: Script failure does not block build
- **WHEN** the `generate-people-data` script fails (e.g., missing people.json)
- **THEN** the build logs a warning but continues; people pages will show empty states rather than failing the entire build

### Requirement: Handle-to-person-ID lookup map
The data layer SHALL provide a function to build a lookup map from platform handles (GitHub usernames and Bluesky handles) to person IDs, for use in linking author names on daily feed pages.

#### Scenario: GitHub username lookup
- **WHEN** `getHandleToPersonMap()` is called and people.json contains `{ "id": "karpathy", "github": "karpathy" }`
- **THEN** the returned map includes `{ "github:karpathy": "karpathy" }`

#### Scenario: Bluesky handle lookup
- **WHEN** `getHandleToPersonMap()` is called and people.json contains `{ "id": "karpathy", "bluesky": "karpathy.bsky.social" }`
- **THEN** the returned map includes `{ "bluesky:karpathy.bsky.social": "karpathy" }`
