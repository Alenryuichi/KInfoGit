## Context

Code Weekly tracks AI code editors by aggregating data from multiple source types: GitHub Releases, RSS feeds, npm registry, Tavily search, and Bailian search. Trae, CodeBuddy, and OpenCode are already in the `EDITORS` array but rely almost entirely on search queries, which produce noisy, unreliable results compared to structured sources.

The existing source modules (`github-releases.ts`, `rss-feeds.ts`, `npm-registry.ts`) follow a consistent pattern: export an async function that returns typed results filtered to the last 7 days. They iterate over all editors that have the relevant config field set — so adding a new field to an editor's config is all that's needed to start fetching from that source.

## Goals / Non-Goals

**Goals:**
- Add `npmPackage: '@tencent-ai/codebuddy-code'` to CodeBuddy config (verified on npm at v2.85.0)
- Add `githubRepo: 'bytedance/trae-agent'` to Trae config (open-sourced agent with tagged releases)
- Confirm OpenCode config is already adequate (it is)
- **Stretch**: Add a `changelog-page` source type for editors that publish changelogs on doc sites (Trae IDE changelog, etc.)

**Non-Goals:**
- Full HTML DOM parsing (keep it lightweight like the RSS parser)
- Handling JavaScript-rendered changelog pages (if the page requires JS, fall back to search)
- Adding new editors beyond those already in config
- Refactoring existing source modules

## Decisions

### 1. Config-only changes deliver most of the value

**Decision**: The primary change is adding `npmPackage` to CodeBuddy and `githubRepo` to Trae. These are single-line config additions that immediately activate existing source fetchers.

**Rationale**: The `npm-registry.ts` and `github-releases.ts` modules already iterate over all editors with the relevant field. No code changes needed for these additions.

### 2. Changelog-page source as a stretch goal

**Decision**: The `changelog-page` source is a stretch goal. It adds a `changelogUrl` optional field to `EditorConfig.sources` and a new `changelog-page.ts` source module.

**Rationale**: The npm/GitHub additions deliver most of the value. The changelog-page source adds coverage for Trae's IDE changelog (`https://www.trae.ai/changelog`) and potentially other editors. But it's fragile — page structure can change — and search queries already exist as fallback.

### 3. Lightweight HTML text extraction over DOM parser

**Decision**: If implementing the changelog-page source, use regex/string-based extraction similar to the existing RSS XML parser, not a full DOM parser.

**Rationale**: The RSS source already proves this pattern works. Adding a DOM parser dependency is overkill. Changelog pages typically have simple, repetitive structures (version headers + bullet lists).

## Risks / Trade-offs

- **[Fragile scraping]** → Changelog page HTML structure may change → Mitigation: search query fallback already exists; changelog-page source is additive enrichment.
- **[JS-rendered pages]** → Some doc sites use client-side rendering → Mitigation: detect empty content and log warning; this is why it's a stretch goal.
- **[npm package name accuracy]** → `@tencent-ai/codebuddy-code` verified on npm (v2.85.0 as of 2026-04-13). Low risk of rename.
- **[Trae agent ≠ Trae IDE]** → The GitHub repo tracks the agent component, not the full IDE → Mitigation: Tavily/Bailian queries still cover IDE-level announcements.
