## ADDED Requirements

### Requirement: AI Daily list page shows recent dates
The `/ai-daily/` page SHALL display a list of available daily digests, ordered by date descending, showing date and item count for each. Clicking a date SHALL navigate to `/ai-daily/{date}/`.

#### Scenario: Multiple days available
- **WHEN** user visits `/ai-daily/` and 7 daily JSON files exist
- **THEN** the page shows all 7 dates as a list, most recent first, each linking to its detail page

#### Scenario: No data yet
- **WHEN** user visits `/ai-daily/` and no JSON files exist
- **THEN** the page shows an empty state message

### Requirement: AI Daily detail page renders one day's digest
The `/ai-daily/[date]/` page SHALL render all news items for the given date, grouped by section (Headlines & Launches, Research & Innovation, Engineering & Resources), in TLDR-style layout.

#### Scenario: Full daily digest
- **WHEN** user visits `/ai-daily/2026-04-10/`
- **THEN** the page displays the date as heading, followed by three sections each with their news items

### Requirement: News item display format
Each news item SHALL display as: bold clickable title (links to original URL), 2-4 line summary in gray, and source tags with optional metadata (e.g., "HN · 342 points") in smaller text below.

#### Scenario: Item with single source
- **WHEN** an item has source `{ name: "arXiv" }` and no score metadata
- **THEN** the source line shows "arXiv"

#### Scenario: Item with multiple sources
- **WHEN** an item appeared on both HN (342 points) and Reddit
- **THEN** the source line shows "HN · 342 points · Reddit"

### Requirement: Section headers with dividers
Each section SHALL have an uppercase title (e.g., "HEADLINES & LAUNCHES") with a thin bottom border, matching the site's existing heading style.

#### Scenario: Three sections rendered
- **WHEN** the JSON contains items in all three sections
- **THEN** three section headers appear with their items listed below each

#### Scenario: Empty section omitted
- **WHEN** a section has zero items for the day
- **THEN** that section header is not rendered

### Requirement: Date navigation
The detail page SHALL include date navigation: previous/next arrows and a horizontal date selector showing nearby dates. Dates without data SHALL be skipped.

#### Scenario: Navigate to previous day
- **WHEN** user clicks the previous arrow on the April 10 page
- **THEN** they navigate to the most recent prior date that has data

### Requirement: Footer stats line
The detail page SHALL display a footer line showing total item count, source count, and score threshold (e.g., "12 items · 4 sources · AI score ≥ 6.0").

#### Scenario: Footer displays correctly
- **WHEN** the page renders with 12 items from 4 unique sources
- **THEN** the footer shows "12 items · 4 sources · AI score ≥ 6.0"

### Requirement: Static generation via getStaticProps/getStaticPaths
Both the list and detail pages SHALL use `getStaticProps` and `getStaticPaths` to pre-render at build time from JSON files in `profile-data/ai-daily/`.

#### Scenario: Build generates all date pages
- **WHEN** `npm run build` runs with 5 JSON files in `profile-data/ai-daily/`
- **THEN** 5 detail pages and 1 list page are statically generated
