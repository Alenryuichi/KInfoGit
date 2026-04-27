## ADDED Requirements

### Requirement: Stars list page at /stars/
The system SHALL render a page at `/stars/` that lists all dates with starred repos, sorted newest first.

#### Scenario: Dates with stars exist
- **WHEN** a user visits `/stars/`
- **THEN** the page SHALL display each date as a clickable link to `/stars/[date]/`, showing the date formatted in human-readable form and the number of stars for that day

#### Scenario: No star data exists
- **WHEN** no JSON files exist in `profile-data/github-stars/`
- **THEN** the page SHALL display a "No stars yet" empty state message

### Requirement: Stars detail page at /stars/[date]/
The system SHALL render a page at `/stars/[date]/` showing all starred repos for that date as cards.

#### Scenario: View daily stars
- **WHEN** a user visits `/stars/2026-04-12/`
- **THEN** the page SHALL display each starred repo as a card containing: repo name (linked to GitHub), programming language badge, stargazers count, who starred it (`starredBy`), DeepSeek-generated highlights, and worth-reading rationale

#### Scenario: Navigate between dates
- **WHEN** a user is on a stars detail page
- **THEN** the page SHALL provide prev/next date navigation links (same pattern as ai-daily)

#### Scenario: Repo without AI commentary
- **WHEN** a starred repo has empty `highlights` and `worthReading`
- **THEN** the card SHALL display the repo description only, without empty AI commentary sections

### Requirement: Data loading via getStaticProps/getStaticPaths
The pages SHALL load data at build time using `getStaticProps` and `getStaticPaths`, reading from `profile-data/github-stars/` JSON files through a `website/lib/github-stars.ts` data layer.

#### Scenario: Static generation
- **WHEN** `next build` runs
- **THEN** the system SHALL pre-render `/stars/` and one `/stars/[date]/` page for each JSON file in the data directory

### Requirement: Visual style consistency
The pages SHALL use the same dark theme (black background, white text, Tailwind CSS) as the existing ai-daily pages.

#### Scenario: Style matches site
- **WHEN** viewing stars pages
- **THEN** the layout, spacing, typography, and color palette SHALL be consistent with `ai-daily` pages
