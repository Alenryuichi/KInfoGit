## 1. Data Layer — Types Extension

- [ ] 1.1 Extend `scripts/spec-tracker/types.ts`: add `FrameworkDelta` (starsDelta, npmDelta), `WeeklyDiff` (topGainer, newDiscovered, exitedDiscovered), extend `SpecSnapshot` with optional `deltas`, `weeklyDiff`, `insights` fields
- [ ] 1.2 Extend `website/lib/spec-tracker.ts`: mirror the new types (FrameworkDelta, WeeklyDiff, extended SpecSnapshot)

## 2. Delta Calculation

- [ ] 2.1 Create `scripts/spec-tracker/delta.ts`: `computeDeltas(current, previous)` → per-framework starsDelta + npmDelta; `computeWeeklyDiff(current, previous)` → topGainer + newDiscovered + exitedDiscovered
- [ ] 2.2 Update `scripts/spec-tracker/fetch-spec-data.ts`: after assembling snapshot, read yesterday's history file, call computeDeltas + computeWeeklyDiff, attach results to snapshot before writing

## 3. AI Trend Insights

- [ ] 3.1 Create `scripts/spec-tracker/insights.ts`: `generateInsights(snapshot)` → call DeepSeek API with delta data + releases, return insights string or null. Prompt SHALL request 2-3 paragraphs of Chinese trend analysis with specific numbers.
- [ ] 3.2 Update `scripts/spec-tracker/fetch-spec-data.ts`: call generateInsights after delta calculation, attach to snapshot. Use Promise.allSettled for fault tolerance.

## 4. Website Components

- [ ] 4.1 Update `website/components/spec-tracker/SpecHeroCards.tsx`: accept deltas prop, show green ▲ / red ▼ delta next to stars count when non-null and non-zero
- [ ] 4.2 Create `website/components/spec-tracker/TrendInsights.tsx`: render AI-generated insights text with paragraph formatting, styled as a highlight card
- [ ] 4.3 Create `website/components/spec-tracker/WeeklyDiff.tsx`: show top gainer + new/exited discovered projects
- [ ] 4.4 Update `website/components/spec-tracker/FrameworkTable.tsx`: show npm delta indicator in the npm/wk cell

## 5. Page Integration

- [ ] 5.1 Update `website/pages/code/specs.tsx`: pass deltas to SpecHeroCards, add TrendInsights section below Hero Cards, add WeeklyDiff section, conditional rendering for all new sections

## 6. Verification

- [ ] 6.1 Run `npx tsx scripts/spec-tracker/fetch-spec-data.ts` and verify latest.json contains deltas + weeklyDiff + insights
- [ ] 6.2 Run `cd website && npm run type-check` with no errors
- [ ] 6.3 Verify page renders correctly with new sections
