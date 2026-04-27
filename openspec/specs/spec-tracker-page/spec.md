# spec-tracker-page Specification

## Purpose
TBD - created by archiving change spec-tracker. Update Purpose after archive.
## Requirements
### Requirement: Specs page route
The system SHALL serve a page at `/code/specs/` with title "Spec Development Tracker" and description "AI Coding Spec 框架生态追踪". The page SHALL use `getStaticProps` to load data from `profile-data/specs/`.

#### Scenario: Page renders with data
- **WHEN** a user navigates to `/code/specs/`
- **THEN** the page SHALL display spec framework data with a back link to `/code/`

#### Scenario: No data available
- **WHEN** `latest.json` does not exist
- **THEN** the page SHALL display a placeholder message "暂无数据，请稍后再来。"

### Requirement: Hero Cards section
The system SHALL display the top 4 frameworks by GitHub stars as Hero Cards at the top of the page. Each card SHALL show: framework name, stars count, latest version, and a fill bar representing relative stars.

#### Scenario: Hero card display
- **WHEN** the page loads with framework data
- **THEN** 4 Hero Cards SHALL be visible in a 2×2 (mobile) or 4×1 (desktop) grid, sorted by stars descending

### Requirement: Stars trend chart
The system SHALL display a multi-line SVG chart showing GitHub stars over time for frameworks with history data. The chart SHALL use the same visual pattern as OrgTrendChart (right-side labels, top-3 emphasis, overlap resolution).

#### Scenario: Sufficient history
- **WHEN** at least 3 days of history data exist
- **THEN** the Stars trend chart SHALL render with one line per framework

#### Scenario: Insufficient history
- **WHEN** fewer than 3 days of history exist
- **THEN** the Stars trend chart section SHALL be hidden

### Requirement: npm downloads chart
The system SHALL display a horizontal bar chart showing weekly npm download counts for frameworks with npm data. The chart SHALL reuse the HorizontalBarChart visual style.

#### Scenario: Download data display
- **WHEN** frameworks have npm download data
- **THEN** bars SHALL be sorted by download count descending, showing package name and count

#### Scenario: No npm data
- **WHEN** no frameworks have npm data
- **THEN** the npm downloads section SHALL be hidden

### Requirement: Framework comparison table
The system SHALL display a sortable table comparing all 8 tracked frameworks with columns: Name, Stars, npm/wk, Category, Latest Version, Last Update.

#### Scenario: Table rendering
- **WHEN** the page loads
- **THEN** all 8 frameworks SHALL appear in the table, sorted by stars descending by default

#### Scenario: Missing data cells
- **WHEN** a framework has no GitHub repo (e.g., Kiro)
- **THEN** the Stars column SHALL show "—" and category SHALL display correctly

### Requirement: Recent Activity section
The system SHALL display the most recent changelog entries (releases, version updates) for each framework, grouped by framework.

#### Scenario: Activity display
- **WHEN** frameworks have changelog data
- **THEN** each framework SHALL show up to 2 most recent entries with version, date, and highlights

#### Scenario: No changelog
- **WHEN** a framework has no changelog data
- **THEN** that framework SHALL be omitted from the Recent Activity section

### Requirement: Emerging Specs section
The system SHALL display automatically discovered new spec projects in a dedicated "Emerging" section at the bottom of the page.

#### Scenario: Discovered projects display
- **WHEN** the discovery mechanism found new projects
- **THEN** the Emerging section SHALL show each project with: name, stars, description, GitHub URL, and "discovered on" date

#### Scenario: No discoveries
- **WHEN** no new projects were discovered
- **THEN** the Emerging section SHALL be hidden

### Requirement: SSG data loading
The system SHALL provide `getLatestSpecs()` and `getSpecTrend()` functions in `website/lib/spec-tracker.ts` to read snapshot data for `getStaticProps`.

#### Scenario: Latest specs loading
- **WHEN** `getLatestSpecs()` is called
- **THEN** it SHALL read and parse `profile-data/specs/latest.json` and return a typed `SpecSnapshot` or null

#### Scenario: Trend data loading
- **WHEN** `getSpecTrend()` is called
- **THEN** it SHALL read all history files, extract per-framework stars over time, and return `StarsTrendSeries[]` sorted by latest stars descending

