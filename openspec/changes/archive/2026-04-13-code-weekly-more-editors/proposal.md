## Why

Trae, CodeBuddy, and OpenCode are already tracked in Code Weekly but rely almost
entirely on web-search queries (Tavily / Bailian). This makes their weekly
digests lower quality than editors like Cursor (RSS) or Aider (GitHub Releases)
that have structured data sources. Each of these editors now has at least one
structured source we aren't using — adding them will produce more accurate
version numbers, release dates, and changelogs.

## What Changes

- **CodeBuddy**: Add `npmPackage: '@tencent-ai/codebuddy-code'` — verified on
  npm at v2.85.0. This gives us exact version + publish date every week, same as
  Claude Code. Also has release notes at `https://www.codebuddy.cn/docs/cli/release-notes`.
- **Trae**: Add `githubRepo: 'bytedance/trae-agent'` to track the open-sourced
  agent component (has tagged releases). The IDE itself has no RSS feed or npm
  package, but has a changelog page at `https://www.trae.ai/changelog` and
  `https://docs.trae.ai/ide/changelog`. A community tracker exists at
  `github.com/amacsmith/trae-changed` that scrapes the changelog every 15 min.
- **OpenCode**: Already has `githubRepo: 'opencode-ai/opencode'` with releases
  (latest v0.0.55). No changes needed. Included for completeness.
- **Stretch goal — changelog page source**: Add a `changelogUrl` source type
  that fetches an HTML changelog page and extracts recent entries. This would
  benefit Trae's IDE changelog and potentially other editors that publish
  changelogs on their website but lack RSS feeds.

## Capabilities

### New Capabilities

- `changelog-page-source`: A new data source type that fetches an HTML changelog
  page, extracts recent entries (via date filtering), and returns structured
  data. This is a stretch goal — the npm/GitHub additions deliver most of the
  value without it.

### Modified Capabilities

_(none — this is additive config changes plus one optional new source)_

## Impact

- **Config** (`scripts/code-weekly/config.ts`): CodeBuddy gains `npmPackage`,
  Trae gains `githubRepo`. Optionally add `changelogUrl` field to the
  `EditorConfig.sources` interface for the stretch goal. No removals or breaking
  changes.
- **Sources** (`scripts/code-weekly/sources/`): If the changelog-page-source
  capability is pursued, a new `changelog-page.ts` source file is added. The
  existing `github-releases.ts` and `npm-registry.ts` sources require no
  changes — they already iterate over all editors with the relevant config fields.
- **Dependencies**: No new dependencies for the config-only changes. The
  changelog-page source would use the existing `fetch` API plus lightweight
  HTML-to-text extraction (similar to the RSS parser's XML approach).
- **Risk**: Minimal. Adding config fields to existing editors is fully backwards
  compatible. The existing source fetchers already handle these field types.
  Changelog page scraping (stretch goal) is inherently fragile if page structure
  changes, but the search query fallback already exists.
