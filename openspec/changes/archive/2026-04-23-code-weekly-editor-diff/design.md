## Context

The Code weekly detail page already renders rich `EditorCard` components for each of 10 editors (Cursor / Windsurf / Trae / Augment for IDE, Claude Code / Gemini CLI / OpenCode / Aider / Copilot / CodeBuddy for CLI). That's fine for deep-reading any one editor. The gap is **scan-level cross-comparison** — "which three are active this week, which are in patch mode, which went silent?" currently requires moving your eyes across 10 cards.

This change adds a **compact matrix view above the existing cards**. Keeping both views is intentional: the matrix answers "which to click into", the cards answer "what did that editor do". Removing the cards would lose depth; adding the matrix keeps both.

## Key Decisions

### 1. One additional view, not a replacement

The existing `EditorCard` grid is preserved. The diff matrix is inserted **above** the existing `IDE` / `CLI` grouped cards. If the reader doesn't care about comparison, they can ignore the matrix and use the cards as before.

No redesign of `EditorCard`. No removal of anything.

### 2. Activity level — three signals, simple composition

For each editor's current-week row we compute a 5-step activity score from three signals:

- `highlights.length` — the primary input (0 = silent, 1-2 = minor, 3-4 = active, 5+ = heavy)
- `version` non-empty — evidence of a concrete release tag
- `aiSummary` is not the stub `"本周暂无重大更新"` — evidence that something happened

Mapped to visual `●` dots (0-5) using a fixed table:

```
highlights 0, no version, stub aiSummary → 0 dots (—)
highlights 0-1, any → 1 dot
highlights 2-3 → 2-3 dots
highlights 4 → 4 dots
highlights 5+ → 5 dots
```

Version presence bumps by +1 dot (capped at 5). Stub aiSummary clamps to 0 regardless of highlights (defensive for future data).

**Why not LLM-scored activity**: the matrix is a glance widget, not a scoring system. Deterministic reproducibility matters more than precision. An editor with 3 substantive highlights and an editor with 3 minor highlights both land at 3 dots — that's fine because the matrix is for "who to look at", not "who did more important work".

### 3. Theme tags — keyword match only

For each highlight + aiSummary string in the editor's row, match against a keyword dictionary (CN + EN):

```ts
const THEME_KEYWORDS: Record<Theme, string[]> = {
  release:     ['release', 'launch', 'announce', '发布', '推出', '宣布'],
  feature:     ['feature', 'new', 'add', 'introduce', '新增', '引入', '新功能'],
  fix:         ['fix', 'bug', 'patch', 'issue', '修复', '问题', '错误'],
  perf:        ['performance', 'speed', 'memory', 'cpu', '性能', '速度'],
  policy:      ['policy', 'privacy', 'training', 'data', '政策', '隐私', '训练'],
  integration: ['integration', 'support', 'provider', 'mcp', '集成', '支持'],
}
```

Each theme that fires at least once becomes a chip in the row's Themes column. Multiple themes per row is the common case (e.g. Cursor: `feature` + `integration`).

**Why not LLM classification**: keyword matching is deterministic, build-time, free, and reproducible. Keyword misses are acceptable at the glance-view level — the existing `EditorCard` preserves the full text for deep reads.

### 4. WoW delta — five kinds, based on highlights count

With the current week's row + last week's row (if it exists):

```
highlightsThisWeek >= 2 && highlightsLastWeek == 0  →  ✨ first-time activity
highlightsThisWeek == 0 && highlightsLastWeek >= 2  →  ⚠ silent this week
highlightsThisWeek - highlightsLastWeek >= 2        →  ↑ accelerating
highlightsThisWeek - highlightsLastWeek <= -2       →  ↓ slowing
otherwise                                           →  → steady
```

If `previous` is null (first week in the dataset or a gap), display `—` with no coloring.

Why +/−2 threshold: observed variance in 2026-W15 → W16 is typically 0-2 highlights. A 2+ step change is the minimum that's **almost certainly not noise**. Lower threshold would show constant drift; higher would hide real changes.

### 5. Matrix layout — grouped by category

Two visual blocks, same as existing cards:
- **IDE**: Cursor, Windsurf, Trae, Augment (in current week's order)
- **CLI / Plugin**: Claude Code, Gemini CLI, OpenCode, Aider, Copilot, CodeBuddy

Within each block, sorted by activity score DESC. Ties broken by name.

Each row is four columns on desktop (`grid-cols-12`):
- col 1-3: name + version/category glyph
- col 4-5: activity dots
- col 6-9: theme chips (wrap to 2 lines if many)
- col 10-12: WoW delta label

Mobile: stack vertically inside each row (name on top, then activity + themes + WoW inline).

### 6. No new data product

Everything needed is already in `profile-data/code-weekly/YYYY-WXX.json`. The matrix data is **computed at build time in getStaticProps**, passed as a prop to the page, and rendered by the new component. No new JSON to persist.

### 7. Backward compatibility

- Old weeks (where only the current week exists, no previous) → WoW column shows `—`. Matrix still works.
- If future editor JSON drops any field (`version` / `aiSummary`), the signal composition treats missing as absent — no crash.
- The current `EditorCard` grid beneath is unchanged.

## Non-Goals

- **No LLM-driven activity scoring**. Keyword match and count-based composition only.
- **No editor ranking or "winner" callout**. The matrix shows differences; it doesn't tell the reader which editor is "best". That's an editorial judgement for the Weekly digest text.
- **No multi-week trend (month-over-month)**. Only ±1 week delta. The dataset is only 2 weeks old at writing; month-over-month is premature.
- **No theme filtering / tag click to filter**. The matrix is read-only. Filtering would require stateful UI that doesn't match the rest of the static-export page style.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Theme keyword list drifts out of sync with how summaries are written | Visible in one file (`code-weekly.ts`). Add a keyword when a theme consistently misses. |
| Activity composition misranks an editor with 1 substantive highlight above one with 3 minor ones | Fine — matrix is for "which to click", not for precision ranking. |
| Single-editor additions to the dataset in the future | Matrix iterates the current week's editors; missing editors in `previous` just show WoW = `—`. |

## Alternatives Considered

1. **Remove existing EditorCard grid, replace with matrix** — rejected. Lose depth view for no benefit; hostile to first-time readers who haven't seen the data before.
2. **Make matrix collapsible / tabbed against EditorCard grid** — rejected. Page is a static SSG export, we don't want client-side tab state for this simple use case. Two blocks stacked is cleaner.
3. **LLM-generated "weekly comparison paragraph"** — rejected. The Weekly summary text at top of page already does this narratively. The matrix is meant to let the reader do their own comparison.
