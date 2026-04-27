# spec-insights-ui Specification

## Purpose
TBD - created by archiving change spec-tracker-insights. Update Purpose after archive.
## Requirements
### Requirement: Hero Cards delta display
The SpecHeroCards component SHALL display a delta indicator next to the stars count when `starsDelta` is available and non-zero. Positive delta SHALL show green ▲ with the number; negative SHALL show red ▼.

#### Scenario: Positive delta
- **WHEN** a framework has starsDelta > 0
- **THEN** the Hero Card SHALL display a green "▲{delta}" next to the stars count

#### Scenario: Zero or null delta
- **WHEN** starsDelta is 0 or null
- **THEN** no delta indicator SHALL be shown

### Requirement: Trend Insights section
The page SHALL display a Trend Insights section below Hero Cards when `insights` is non-null. The section SHALL render the AI-generated analysis text with proper paragraph formatting.

#### Scenario: Insights available
- **WHEN** snapshot.insights is a non-empty string
- **THEN** the Trend Insights section SHALL render with heading "Trend Insights" and the analysis text

#### Scenario: No insights
- **WHEN** snapshot.insights is null or empty
- **THEN** the Trend Insights section SHALL be hidden

### Requirement: Weekly Diff section
The page SHALL display a Weekly Diff section showing: top gainer framework with its delta, newly discovered projects, and exited projects.

#### Scenario: Top gainer display
- **WHEN** weeklyDiff.topGainer exists
- **THEN** the section SHALL show "最大涨幅: {framework} +{delta}★"

#### Scenario: New discoveries display
- **WHEN** weeklyDiff.newDiscovered has entries
- **THEN** the section SHALL list them with "本周新进" label

#### Scenario: Empty diff
- **WHEN** weeklyDiff is null or all sub-fields are empty
- **THEN** the Weekly Diff section SHALL be hidden

### Requirement: npm delta in table
The FrameworkTable SHALL display npm download delta as a small colored indicator when available. Positive shows green, negative shows red.

#### Scenario: Delta in table cell
- **WHEN** a framework has npmDelta non-null and non-zero
- **THEN** the npm/wk cell SHALL append a small delta indicator

