## 1. Data Layer — Historical Benchmark Aggregation

- [x] 1.1 Define `BenchmarkTimeSeries` and `TimeSeriesPoint` TypeScript interfaces in `website/lib/code-weekly.ts`
- [x] 1.2 Implement `getBenchmarkHistory()` function that reads all `profile-data/benchmarks/history/*.json` files, extracts top-10 models per benchmark, limits to last 90 days, and returns `BenchmarkTimeSeries[]`
- [x] 1.3 Handle edge cases: empty/missing history directory, malformed JSON files (skip with no error), single-file graceful return
- [x] 1.4 Write unit tests for `getBenchmarkHistory()` covering: multiple files, empty dir, malformed file, 90-day cutoff, top-10 extraction

## 2. Page Integration — Pass History Data via SSG

- [x] 2.1 Update `BenchmarksPageProps` interface in `benchmarks.tsx` to include `history: BenchmarkTimeSeries[]`
- [x] 2.2 Call `getBenchmarkHistory()` in `getStaticProps` and serialize into page props (JSON roundtrip for undefined removal)
- [x] 2.3 Pass relevant `BenchmarkTimeSeries` to each `BenchmarkSection` component by matching `benchmarkId`

## 3. Trend Line Chart Component

- [x] 3.1 Create `website/components/code-weekly/charts/TrendLineChart.tsx` — SVG line chart component accepting `BenchmarkTimeSeries` data and rendering top-5 model score lines
- [x] 3.2 Implement SVG coordinate mapping: `viewBox`-based responsive scaling, X-axis (dates) and Y-axis (scores) with proper domain calculation
- [x] 3.3 Render axis labels (date ticks on X, score ticks on Y) styled for dark theme (gray-400 text, gray-600 axis lines, white/4% grid)
- [x] 3.4 Draw model lines as `<motion.path>` with framer-motion `pathLength` animation (0.8s duration, staggered per line)
- [x] 3.5 Add legend below chart: colored dot + model name per line, using `OrgColors` palette, `text-xs text-gray-400`
- [x] 3.6 Handle edge cases: models appearing/disappearing across snapshots (line segments only where data exists)

## 4. Rank Bump Chart Component

- [x] 4.1 Create `website/components/code-weekly/charts/RankBumpChart.tsx` — SVG bump chart showing rank positions (1 at top, 10 at bottom) for top-10 models over time
- [x] 4.2 Implement rank-position coordinate mapping with inverted Y-axis, model labels at rightmost data point
- [x] 4.3 Style consistently with TrendLineChart: dark theme colors, responsive viewBox, framer-motion path animation
- [x] 4.4 Handle models entering/leaving top 10: start/end lines at first/last snapshot appearance

## 5. BenchmarkSection Toggle Extension

- [x] 5.1 Extend `BenchmarkSection` props to accept optional `historyData: BenchmarkTimeSeries | null`
- [x] 5.2 Update view toggle from 2-way (Chart | Table) to 3-way (Chart | Trend | Table) when `historyData` has 2+ data points
- [x] 5.3 Render `TrendLineChart` (or `RankBumpChart` for arena-coding) in the Trend view with AnimatePresence crossfade matching existing transitions
- [x] 5.4 Conditionally hide "Trend" button when `historyData` is null or has < 2 points

## 6. Styling & Responsiveness

- [x] 6.1 Ensure chart containers use the existing card style: `rounded-xl border border-white/[0.06] bg-white/[0.02]`
- [x] 6.2 Test SVG scaling at mobile (375px), `sm` (640px), and `md` (768px) breakpoints — labels must remain legible
- [x] 6.3 Verify color consistency with `OrgColors` system across all chart types

## 7. Testing & Validation

- [x] 7.1 Add component tests for `TrendLineChart` — renders correct number of paths, legend entries, axis labels
- [x] 7.2 Add component tests for `RankBumpChart` — renders correct rank lines, handles missing models
- [x] 7.3 Add integration test: `BenchmarkSection` with 3-way toggle renders correct view per mode
- [x] 7.4 Run `npm run type-check` and `npm run lint` — no new errors
- [x] 7.5 Run `just build` — verify static export succeeds with history data in page props
