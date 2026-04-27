# spec-momentum Specification

## Purpose
TBD - created by archiving change spec-tracker-insights. Update Purpose after archive.
## Requirements
### Requirement: Stars delta calculation
The system SHALL compute the stars difference for each framework by comparing the current snapshot's github.stars with the previous day's snapshot. The delta SHALL be stored as `starsDelta` (integer, positive = growth, negative = decline) per framework.

#### Scenario: Previous snapshot exists
- **WHEN** a history file for yesterday's date exists
- **THEN** each framework's `starsDelta` SHALL equal `today.stars - yesterday.stars`

#### Scenario: No previous snapshot
- **WHEN** no history file for yesterday exists
- **THEN** `starsDelta` SHALL be null for all frameworks

#### Scenario: Framework missing from previous snapshot
- **WHEN** a framework exists today but not in yesterday's snapshot
- **THEN** `starsDelta` SHALL be null for that framework

### Requirement: npm downloads delta calculation
The system SHALL compute the npm weekly downloads difference for each framework by comparing current and previous snapshots. The delta SHALL be stored as `npmDelta` (integer) per framework.

#### Scenario: Both snapshots have npm data
- **WHEN** both today and yesterday have npm.weeklyDownloads for a framework
- **THEN** `npmDelta` SHALL equal `today.weeklyDownloads - yesterday.weeklyDownloads`

#### Scenario: Missing npm data
- **WHEN** either snapshot lacks npm data for a framework
- **THEN** `npmDelta` SHALL be null

### Requirement: Weekly diff summary
The system SHALL compute a weekly diff object containing: the framework with the largest stars delta (`topGainer`), new discovered projects not in yesterday's list (`newDiscovered`), and projects that disappeared (`exitedDiscovered`).

#### Scenario: Top gainer identification
- **WHEN** deltas are computed
- **THEN** `topGainer` SHALL be the framework id with the highest positive `starsDelta`

#### Scenario: New discovered projects
- **WHEN** a project appears in today's discovered list but not yesterday's
- **THEN** it SHALL appear in `newDiscovered`

### Requirement: AI trend insights generation
The system SHALL call the DeepSeek API with delta data and recent release info to generate a Chinese-language trend analysis string (2-3 paragraphs). The analysis SHALL reference specific numbers and comparisons.

#### Scenario: Successful AI generation
- **WHEN** DeepSeek API returns a valid response
- **THEN** `insights` SHALL contain the generated analysis text

#### Scenario: API failure
- **WHEN** DeepSeek API fails or DEEPSEEK_API_KEY is not set
- **THEN** `insights` SHALL be null and the pipeline SHALL continue without error

#### Scenario: Prompt content
- **WHEN** building the prompt
- **THEN** it SHALL include: each framework's stars + delta, npm downloads + delta, latest release tags, and discovered projects list

### Requirement: Extended snapshot schema
The SpecSnapshot type SHALL be extended with optional fields: `deltas` (per-framework starsDelta and npmDelta), `weeklyDiff` (topGainer, newDiscovered, exitedDiscovered), and `insights` (string or null).

#### Scenario: Backward compatibility
- **WHEN** the website reads a snapshot without deltas/insights fields
- **THEN** it SHALL treat them as null/empty without errors

