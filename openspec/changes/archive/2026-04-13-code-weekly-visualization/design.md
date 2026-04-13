## Context

The Code Weekly benchmarks page (`/code/benchmarks/`) currently renders a single point-in-time view: horizontal bar charts + tables for Arena Coding, SWE-bench, Aider, and LiveCodeBench. Data is loaded from `profile-data/benchmarks/latest.json` via `getStaticProps`.

A daily automation already saves snapshots to `profile-data/benchmarks/history/YYYY-MM-DD.json`, and weekly Code Weekly JSONs at `profile-data/code-weekly/YYYY-WNN.json` also embed benchmark data. Currently only 1 history file exists (2026-04-13), but the collection will grow daily.

The site is a **Next.js Pages Router SSG static export** deployed to GitHub Pages. All data must be baked in at build time. The dark theme uses `bg-black` with `text-white` and gray-400/500/600 accents. `framer-motion` is the animation library. Mobile-responsive layouts use Tailwind's `sm:` / `md:` breakpoints.

## Goals / Non-Goals

**Goals:**
- Show benchmark score trends over time via line charts (score on Y-axis, date on X-axis)
- Show historical ranking changes via a bump/rank chart (rank on Y-axis, date on X-axis)
- Reuse existing OrgColors palette for model/org identification
- Integrate seamlessly into the existing benchmarks page with a view toggle extension
- Degrade gracefully when < 2 data points exist (hide trend view)
- Keep bundle size minimal — no new charting library

**Non-Goals:**
- Interactive tooltip/hover data inspection (future enhancement)
- User-selectable date ranges or model filtering (future enhancement)
- Real-time / SSR data — everything is static
- Comparison across different benchmark categories
- Sparkline charts in the HeroCards (separate future change)

## Decisions

### 1. Pure SVG + framer-motion over recharts/d3

**Decision**: Build trend charts as custom SVG components animated with framer-motion.

**Rationale**: The charts are relatively simple (5-10 lines, ~30 data points max). recharts would add ~45KB gzipped to the bundle for minimal benefit. framer-motion is already installed and provides `motion.path` with `pathLength` animation — perfect for animated line drawing.

**Alternatives considered**:
- **recharts**: Mature, but heavy dependency for simple line charts on a personal site
- **d3**: Too low-level; we'd essentially be building custom SVG anyway
- **Chart.js / canvas**: Doesn't work well with SSG (canvas rendering needs client JS), harder to style for dark theme

### 2. View toggle extension (chart → chart/trend/table)

**Decision**: Extend `BenchmarkSection`'s existing 2-way toggle (Chart | Table) to a 3-way toggle (Chart | Trend | Table). The Trend view renders the new `TrendLineChart` component.

**Rationale**: Keeps the UI pattern familiar. Users already understand the toggle. Adding "Trend" as a middle option naturally extends the interaction.

**Alternative**: A separate `/code/benchmarks/trends/` page. Rejected because it fragments the experience — users want to see current standings AND trends in context.

### 3. Build-time aggregation in `lib/code-weekly.ts`

**Decision**: Add a `getBenchmarkHistory()` function that reads all `profile-data/benchmarks/history/*.json` files, extracts top-N models per benchmark, and returns a time-series structure. Called from `getStaticProps` in `benchmarks.tsx`.

**Rationale**: Keeps data loading co-located with existing benchmark functions. The history directory pattern (date-stamped JSONs) makes chronological ordering trivial.

**Data structure**:
```typescript
interface BenchmarkTimeSeries {
  benchmarkId: string          // 'arena-coding' | 'swe-bench' | 'aider' | 'livecodebench'
  points: Array<{
    date: string               // 'YYYY-MM-DD'
    models: Array<{
      model: string
      value: number            // score (Elo, %, etc.)
      rank: number
      org: string
    }>
  }>
}
```

### 4. Top-5 model focus for trend charts

**Decision**: Show only the top 5 models (by latest ranking) in trend line charts to avoid visual clutter.

**Rationale**: With 20+ models, the chart becomes unreadable. Top 5 captures the competitive picture. The bump chart can show top 10 since rank lines are more spread out.

### 5. Responsive SVG with viewBox

**Decision**: Use `viewBox` attribute on SVG elements with `width="100%"` for responsive scaling. Chart height fixed at sensible defaults (200px for line charts, 300px for bump charts).

**Rationale**: ViewBox-based scaling works perfectly with Tailwind's responsive containers without media queries on the SVG internals.

## Risks / Trade-offs

- **[Limited data initially]** → With only 1 snapshot, trend charts are meaningless. **Mitigation**: Conditionally hide the "Trend" toggle when `points.length < 2`. Show a subtle "Trends available after more data is collected" message.

- **[Model name inconsistency across snapshots]** → A model might appear as "Claude Opus 4.5" in one snapshot and "Claude Opus 4.5 20251101" in another. **Mitigation**: Use exact string matching initially. Consider a normalization map in a future iteration if this becomes a real problem.

- **[Growing data size in page props]** → With 365 daily snapshots × 4 benchmarks × 10 models, the JSON embedded in HTML could grow. **Mitigation**: Limit to last 90 days of data. Only include top-N models. Keep data sparse (only model/value/rank per point).

- **[SVG performance with many data points]** → SVG line rendering is fast for <100 points per line. **Mitigation**: With 90 days max and 5 lines, we have ~450 points total — well within performant range.

## Open Questions

1. Should the bump chart use actual rank numbers (1-20) or relative rank (re-ranked among displayed models only)?
2. Should we show a legend below the chart, or are colored model labels sufficient?
3. When historical data grows, should we add period selectors (7d / 30d / 90d)?
