## ADDED Requirements

### Requirement: Trend line chart renders score trajectories for top models
The system SHALL render an SVG line chart showing benchmark scores over time for the top 5 models (by latest ranking). Each model line MUST use the color from the `OrgColors` system. The X-axis SHALL display dates and the Y-axis SHALL display scores in the benchmark's native unit (Elo for Arena, % for others).

#### Scenario: Trend chart renders with multiple data points
- **WHEN** historical data contains 3+ daily snapshots for the "arena-coding" benchmark
- **THEN** the TrendLineChart component renders an SVG with one `<path>` per top-5 model, X-axis date labels, Y-axis score labels, and a legend identifying each model by color and name

#### Scenario: Trend chart animates on mount
- **WHEN** the trend chart enters the viewport
- **THEN** each line path animates from left to right using framer-motion `pathLength` animation over 0.8s with staggered delays per line

#### Scenario: Trend chart is responsive
- **WHEN** the viewport width changes (mobile vs desktop)
- **THEN** the SVG scales proportionally via `viewBox` attribute, maintaining legibility of labels and lines at `sm` (640px) and `md` (768px) breakpoints

### Requirement: Rank bump chart shows position changes over time
The system SHALL render a bump chart (SVG) showing rank positions of the top 10 models over time. The Y-axis SHALL display rank (1 at top, 10 at bottom). Lines MUST connect each model's rank across snapshots. Each line MUST use the `OrgColors` color for the model's org.

#### Scenario: Bump chart renders rank trajectories
- **WHEN** historical data contains 2+ snapshots for "swe-bench" benchmark
- **THEN** the RankBumpChart renders with one line per top-10 model, Y-axis showing ranks 1-10 (inverted, 1 at top), and model labels at the rightmost data point

#### Scenario: Models appearing or disappearing across snapshots
- **WHEN** a model appears in the top 10 only in some snapshots (not all)
- **THEN** the line for that model starts/ends at the first/last snapshot where it appears, with no line segments drawn for missing snapshots

### Requirement: Trend view integrates into BenchmarkSection toggle
The `BenchmarkSection` component SHALL support a third view mode "Trend" in addition to "Chart" and "Table". The toggle bar MUST show three buttons: Chart | Trend | Table.

#### Scenario: User switches to Trend view
- **WHEN** a user clicks the "Trend" button in a benchmark section's view toggle
- **THEN** the section displays the TrendLineChart for that benchmark, replacing the current bar chart or table view with a crossfade animation

#### Scenario: Trend toggle hidden when insufficient data
- **WHEN** historical data for a benchmark has fewer than 2 snapshots
- **THEN** the "Trend" button SHALL NOT appear in the toggle bar, and the section behaves identically to the current 2-way toggle (Chart | Table)

### Requirement: Chart renders correctly on dark theme
All chart SVG elements (axes, labels, grid lines, background) MUST be styled for the dark theme: background transparent (inherits `bg-black`), axis lines in `gray-600` (`#4B5563`), label text in `gray-400` (`#9CA3AF`), grid lines in `white/[0.04]`.

#### Scenario: Visual consistency with existing page
- **WHEN** the trend chart renders on the benchmarks page
- **THEN** all text uses the same font family as the page (inherits Tailwind defaults), colors match the gray-400/500/600 palette used elsewhere, and the chart container uses the same `rounded-xl border border-white/[0.06] bg-white/[0.02]` card style

### Requirement: Chart legend identifies models
Each trend chart MUST include a legend showing model names with their corresponding line colors. The legend SHALL be placed below the chart.

#### Scenario: Legend renders for all visible models
- **WHEN** a trend line chart shows 5 models
- **THEN** a legend below the chart displays 5 entries, each with a colored dot/line-swatch and the model name in `text-xs text-gray-400`
