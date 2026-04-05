## 1. Fix Rule Files

- [x] 1.1 Rewrite `code-style.md`: add `paths: ["website/**/*.ts", "website/**/*.tsx"]` frontmatter
- [x] 1.2 Rewrite `components.md`: change "use named export" to reflect actual `export default` pattern; keep "no inline style" as aspirational but note current codebase uses inline styles
- [x] 1.3 Rewrite `nextjs.md`: add `trailingSlash: true`, CJS `require()` format, `experimental.mdxRs`, ban on `'use client'` directive
- [x] 1.4 Rewrite `blog-content.md`: update naming convention to allow Chinese slugs (e.g., `YYYY-MM-DD-中文标题.md`)
- [x] 1.5 Delete `playwright-macos.md` (too vague, no project-specific content)

## 2. Deduplicate CLAUDE.md

- [x] 2.1 Slim down "关键约定" section: replace detailed bullets with one-line summaries + pointers to rule files
- [x] 2.2 Remove "易踩的坑" reference to deleted `playwright-macos.md`
- [x] 2.3 Verify CLAUDE.md is under 60 lines after changes

## 3. Clean settings.local.json

- [x] 3.1 Remove stale audio permissions (`Bash(wc -l ... .aiff)`, `Bash(ls ... .aiff)`)
- [x] 3.2 Remove dangerous `Bash(rm:*)` permission
- [x] 3.3 Remove `Bash(git rm:*)` (cleanup-session-only)
- [x] 3.4 Remove stale grep permissions for component export counting
- [x] 3.5 Remove `agentvibes` from `disabledMcpjsonServers` (no longer installed)

## 4. Verification

- [x] 4.1 Confirm all rule files have valid YAML frontmatter (if paths present)
- [x] 4.2 Confirm CLAUDE.md has no content duplicated in rule files
- [x] 4.3 Confirm settings.local.json is valid JSON with only necessary permissions
