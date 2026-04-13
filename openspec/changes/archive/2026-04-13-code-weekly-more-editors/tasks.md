## 1. Config Updates (core — no code changes needed)

- [x] 1.1 Add `npmPackage: '@tencent-ai/codebuddy-code'` to CodeBuddy's `sources` in `scripts/code-weekly/config.ts`
- [x] 1.2 Add `githubRepo: 'bytedance/trae-agent'` to Trae's `sources` in `scripts/code-weekly/config.ts`
- [x] 1.3 Verify both sources work: run `npm view @tencent-ai/codebuddy-code dist-tags.latest` and check `https://api.github.com/repos/bytedance/trae-agent/releases?per_page=1`

## 2. Changelog Page Source (stretch goal)

- [x] 2.1 Add `changelogUrl?: string` to `EditorConfig.sources` interface in `scripts/code-weekly/config.ts`
- [x] 2.2 Create `scripts/code-weekly/sources/changelog-page.ts` with `fetchChangelogEntries()` function that iterates editors with `changelogUrl` set
- [x] 2.3 Implement HTML text extraction: fetch the page, strip tags, identify version headers and dates using regex patterns
- [x] 2.4 Implement date parsing for common formats (YYYY-MM-DD, Month DD YYYY, etc.) and 7-day filtering
- [x] 2.5 Add `changelogUrl` to Trae config entry pointing to `https://www.trae.ai/changelog` or `https://docs.trae.ai/ide/changelog`
- [x] 2.6 Integrate `fetchChangelogEntries()` into the main weekly pipeline (call alongside other sources)

## 3. Verification

- [x] 3.1 Run `npm run type-check` to confirm no TypeScript errors
- [x] 3.2 Run a local weekly pipeline execution and verify CodeBuddy shows npm version data and Trae shows GitHub release data
- [x] 3.3 If stretch goal implemented: verify changelog-page source returns entries for Trae's changelog URL
