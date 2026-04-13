## ADDED Requirements

### Requirement: Changelog page fetcher returns structured entries

The `changelog-page` source module SHALL fetch an HTML changelog page from the URL specified in `EditorConfig.sources.changelogUrl`, extract entries published within the last 7 days, and return structured data with version, date, and summary for each entry.

#### Scenario: Editor has changelogUrl configured and page returns recent entries
- **WHEN** an editor has `changelogUrl` set and the page contains entries from the last 7 days
- **THEN** the source returns an array of `ChangelogEntry` objects with `editor`, `version`, `publishedAt`, `summary`, and `url` fields

#### Scenario: Editor has changelogUrl configured but no recent entries
- **WHEN** an editor has `changelogUrl` set but the page contains no entries from the last 7 days
- **THEN** the source returns an empty array for that editor (no error)

#### Scenario: Changelog page fetch fails
- **WHEN** the HTTP request to `changelogUrl` fails or returns non-200
- **THEN** the source logs a warning and returns an empty array for that editor (does not throw)

#### Scenario: Page content is empty or unparseable
- **WHEN** the fetched page has no recognizable changelog structure (e.g., JS-rendered with no static content)
- **THEN** the source logs a warning and returns an empty array for that editor

### Requirement: EditorConfig supports changelogUrl field

The `EditorConfig.sources` interface SHALL include an optional `changelogUrl` field of type `string`. This field specifies the URL of an HTML changelog page to scrape.

#### Scenario: Editor configured with changelogUrl
- **WHEN** an editor entry in `EDITORS` has `sources.changelogUrl` set to a valid URL
- **THEN** the changelog-page source module includes that editor in its fetch list

#### Scenario: Editor without changelogUrl is skipped
- **WHEN** an editor entry does not have `sources.changelogUrl` set
- **THEN** the changelog-page source module skips that editor

### Requirement: Date parsing handles common changelog formats

The changelog-page source SHALL parse dates in at least these formats: `YYYY-MM-DD`, `Month DD, YYYY`, `DD Month YYYY`, and `YYYY/MM/DD`. Entries with unparseable dates SHALL be skipped with a warning.

#### Scenario: ISO date format
- **WHEN** a changelog entry header contains a date like `2026-04-10`
- **THEN** the date is parsed correctly and used for 7-day filtering

#### Scenario: Unrecognized date format
- **WHEN** a changelog entry header contains a date that doesn't match any supported format
- **THEN** that entry is skipped and a warning is logged
