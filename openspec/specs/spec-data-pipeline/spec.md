# spec-data-pipeline Specification

## Purpose
TBD - created by archiving change spec-tracker. Update Purpose after archive.
## Requirements
### Requirement: Spec framework configuration
The system SHALL maintain a typed configuration of tracked spec frameworks in `scripts/spec-tracker/config.ts`. Each framework entry SHALL include: id (kebab-case), name (display), category (`toolkit` | `agent-framework` | `ide` | `platform` | `rules`), and optional sources (githubRepo, npmPackage, changelogUrl, website).

#### Scenario: Fixed tracking list
- **WHEN** the pipeline runs
- **THEN** it SHALL attempt data collection for all 8 configured frameworks: Spec-Kit, BMAD, OpenSpec, GSD-2, Kiro, Tessl, Rulebook-AI, awesome-cursorrules

#### Scenario: Missing source graceful handling
- **WHEN** a framework has no githubRepo configured (e.g., Kiro)
- **THEN** the pipeline SHALL skip GitHub stats collection for that framework without error

### Requirement: GitHub stats collection
The system SHALL fetch GitHub repository stats for each framework with a configured `githubRepo`. Stats SHALL include: stars, forks, open_issues, pushed_at (last push date), latest release (tag + publishedAt), weekly commit count, and contributor count.

#### Scenario: Successful GitHub fetch
- **WHEN** the GitHub API returns 200 for a repo
- **THEN** the pipeline SHALL extract stars, forks, open_issues, latest release info, and store in the snapshot

#### Scenario: Commit activity 202 retry
- **WHEN** `/repos/{owner}/{repo}/stats/commit_activity` returns 202
- **THEN** the pipeline SHALL wait 3 seconds and retry once

#### Scenario: GitHub API failure
- **WHEN** the GitHub API returns an error for a repo
- **THEN** the pipeline SHALL log a warning and continue with remaining frameworks

### Requirement: npm downloads collection
The system SHALL fetch weekly download counts from the npm downloads API for each framework with a configured `npmPackage`. The system SHALL also fetch the latest version and publish date from the npm registry.

#### Scenario: Successful npm fetch
- **WHEN** `https://api.npmjs.org/downloads/point/last-week/{pkg}` returns 200
- **THEN** the pipeline SHALL store the weekly download count in the snapshot

#### Scenario: npm package not found
- **WHEN** the npm API returns 404 for a package
- **THEN** the pipeline SHALL log a warning and set npm data to null for that framework

### Requirement: Discovery of emerging projects
The system SHALL search for new spec-driven development projects via GitHub Search API and npm search. Discovery SHALL run as part of each daily pipeline execution.

#### Scenario: GitHub discovery search
- **WHEN** the pipeline runs discovery
- **THEN** it SHALL search GitHub with query terms including "spec-driven", "ai-coding-spec", "agent-specification", filtered to stars>50, pushed within 90 days, and TypeScript/JavaScript language

#### Scenario: Deduplication against fixed list
- **WHEN** a discovered project matches a repo already in the fixed tracking list
- **THEN** it SHALL be excluded from the discovered results

#### Scenario: Discovery results cap
- **WHEN** discovery returns more than 10 new projects
- **THEN** it SHALL keep only the top 10 sorted by stars descending

### Requirement: Daily snapshot output
The system SHALL write a JSON snapshot to `profile-data/specs/latest.json` and `profile-data/specs/history/YYYY-MM-DD.json` on each run. The snapshot SHALL contain: updatedAt (ISO string), frameworks (array of SpecFramework), and discovered (array of DiscoveredProject).

#### Scenario: Snapshot file structure
- **WHEN** the pipeline completes successfully
- **THEN** `latest.json` SHALL contain the full snapshot, and a dated copy SHALL exist in `history/`

#### Scenario: History accumulation
- **WHEN** the pipeline runs on a new date
- **THEN** a new history file SHALL be created without overwriting previous dates

### Requirement: GitHub Action workflow
The system SHALL have an independent GitHub Action at `.github/workflows/fetch-specs.yml` that runs daily at UTC 05:23, executes the pipeline, and commits any changes to profile-data/specs/.

#### Scenario: Scheduled execution
- **WHEN** the cron schedule `23 5 * * *` fires
- **THEN** the action SHALL run `npx tsx scripts/spec-tracker/fetch-spec-data.ts` and commit output files

#### Scenario: Manual trigger
- **WHEN** a user triggers the workflow manually via workflow_dispatch
- **THEN** the pipeline SHALL run immediately

