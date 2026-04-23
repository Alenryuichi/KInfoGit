## ADDED Requirements

### Requirement: Build-time editor diff matrix computation

The system SHALL provide `computeEditorDiffMatrix(current: EditorUpdate[], previous?: EditorUpdate[]): EditorDiffMatrix` in `website/lib/code-weekly.ts`. The function SHALL produce, for each editor in the current week's data, a pre-computed `EditorDiffRow` containing:

- `name`, `category`, `version` (passthrough from EditorUpdate)
- `activityDots`: integer 0-5 composed from highlights count, version presence, and whether `aiSummary` is the stub `"本周暂无重大更新"`
- `themes`: array of `EditorTheme` values (`release` / `feature` / `fix` / `perf` / `policy` / `integration`) from keyword matching on highlights + aiSummary
- `wow`: `EditorWowDelta` value (`first` / `silent` / `accelerating` / `slowing` / `steady` / `unknown`) derived from comparing current highlights count vs previous

Rows SHALL be grouped into `ide` and `cli` buckets in the returned `EditorDiffMatrix`, with each bucket sorted by `activityDots` descending then by `name` ascending.

#### Scenario: Heavy-update week gets full activity dots

- **WHEN** an editor has 5 highlights, a non-empty `version`, and a non-stub `aiSummary`
- **THEN** `computeActivityDots` returns `5`

#### Scenario: Silent week gets zero dots

- **WHEN** an editor has 0 highlights and `aiSummary === "本周暂无重大更新"`
- **THEN** `computeActivityDots` returns `0`

#### Scenario: Stub aiSummary clamps activity to zero regardless of highlights

- **WHEN** an editor has 4 highlights but `aiSummary === "本周暂无重大更新"`
- **THEN** `computeActivityDots` returns `0` (defensive: inconsistent data should lean toward silent)

#### Scenario: Version bump adds a dot

- **WHEN** an editor has 2 highlights and a non-empty `version`
- **THEN** `computeActivityDots` returns `3` (base 2 + 1 for version)

#### Scenario: Missing previous week marks WoW as unknown

- **WHEN** `computeEditorDiffMatrix` is called with `previous` undefined or not containing the current editor's name
- **THEN** the row's `wow` is `unknown`

#### Scenario: First-time activity is recognized

- **WHEN** the editor has 3 highlights this week and 0 last week
- **THEN** the row's `wow` is `first`

#### Scenario: Silent transition is recognized

- **WHEN** the editor has 0 highlights this week and 3 last week
- **THEN** the row's `wow` is `silent`

#### Scenario: Accelerating requires a 2+ increase

- **WHEN** the editor has 5 highlights this week and 2 last week (delta +3)
- **THEN** the row's `wow` is `accelerating`

#### Scenario: Small changes are steady, not drift-noise

- **WHEN** the editor has 3 highlights this week and 2 last week (delta +1)
- **THEN** the row's `wow` is `steady`

### Requirement: Theme classification via keyword matching

The module SHALL classify each editor's themes by matching a hardcoded CN+EN keyword dictionary against concatenated `highlights` and `aiSummary` text. Each `EditorTheme` that matches at least once SHALL appear in the row's `themes` array. Themes SHALL be returned in stable dictionary-declaration order.

#### Scenario: Multi-theme editor gets multiple chips

- **WHEN** an editor's aiSummary contains both `"发布"` and `"集成"`
- **THEN** the row's `themes` contains both `release` and `integration`

#### Scenario: Pure bug-fix week gets only fix theme

- **WHEN** an editor's highlights only contain fix-related keywords (e.g. `"修复"`, `"bug"`, `"patch"`)
- **THEN** the row's `themes` is exactly `['fix']`

### Requirement: Render editor diff matrix on /code/[week]

The page `website/pages/code/[week].tsx` SHALL compute the matrix in `getStaticProps` by loading the adjacent previous week via `getAdjacentWeeks` + `getCodeWeekByWeek`, and SHALL render an `EditorDiffMatrix` component above the existing `EditorCard` grid. The section SHALL have its own heading (e.g. `Week-over-Week Overview`). The existing `EditorCard` grid SHALL be preserved unchanged.

#### Scenario: Week with previous data renders full matrix

- **WHEN** a user navigates to `/code/2026-W16/` and week 2026-W15 also exists
- **THEN** the page renders the diff matrix section with activity dots, theme chips, and WoW labels for every editor, above the original `EditorCard` grid

#### Scenario: Earliest week renders matrix without WoW labels

- **WHEN** a user navigates to the earliest week in the dataset (no previous week exists)
- **THEN** the matrix still renders activity dots and theme chips; the WoW column shows `—` for every row

#### Scenario: Empty editor list hides matrix gracefully

- **WHEN** a week's `editors` array is empty
- **THEN** the matrix component renders a neutral "No editor activity this week." message instead of an empty table
