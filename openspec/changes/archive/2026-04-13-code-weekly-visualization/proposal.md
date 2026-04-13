## Why

The benchmarks page currently shows only a point-in-time snapshot — horizontal bar charts of the latest scores. Users cannot see how models are improving (or declining) over time, which benchmark leaders are gaining/losing ground, or how the competitive landscape is shifting week-over-week. Adding trend and historical ranking visualizations turns static leaderboard data into an insightful narrative of the AI coding model race.

## What Changes

- **Weekly trend line charts**: For each benchmark category (Arena Coding, SWE-bench, Aider, LiveCodeBench), add a line chart showing top models' score trajectories over the last N weeks/days. Each model is a colored line (reusing the existing `OrgColors` palette). X-axis = date, Y-axis = score.
- **Historical ranking bump chart**: A "bump chart" (rank-over-time) visualization showing how top models' rank positions shift across snapshots. Great for quickly seeing who is rising/falling.
- **Build-time data aggregation**: A new SSG data pipeline that reads all `profile-data/benchmarks/history/*.json` files (daily snapshots) and optionally `profile-data/code-weekly/*.json` (weekly snapshots with embedded benchmarks) to produce a unified time-series dataset passed via `getStaticProps`.
- **Trend view toggle**: Extend the existing chart/table toggle in `BenchmarkSection` to include a third "Trend" view mode, keeping the UI pattern consistent.
- **Pure SVG/framer-motion charts**: No new charting library dependency. Trend charts will be built with SVG + framer-motion (already a dependency) for animated path drawing, keeping the bundle lean for this static site.

## Capabilities

### New Capabilities
- `benchmark-trend-charts`: Line chart components for visualizing benchmark score trends over time (SVG + framer-motion)
- `benchmark-history-data`: Build-time data aggregation pipeline that collects historical benchmark snapshots into a time-series structure for SSG consumption

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Code**: New components in `website/components/code-weekly/charts/` (TrendLineChart, RankBumpChart). Extended `BenchmarkSection` with trend view toggle. New data functions in `website/lib/code-weekly.ts` for historical aggregation.
- **Data**: Relies on `profile-data/benchmarks/history/*.json` accumulating daily snapshots over time. The feature degrades gracefully — with only 1 snapshot, trend charts simply won't render.
- **Dependencies**: No new npm dependencies. Uses SVG + existing framer-motion.
- **Pages**: Changes to `website/pages/code/benchmarks.tsx` to pass historical data via `getStaticProps` and render trend views.
- **Bundle size**: Minimal impact — SVG paths + a few new components, no heavy charting library.
