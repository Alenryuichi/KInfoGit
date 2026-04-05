## 1. Fix Rule Files

- [ ] 1.1 Rewrite `code-style.md`: add `paths: ["website/**/*.ts", "website/**/*.tsx"]` frontmatter
- [ ] 1.2 Rewrite `components.md`: change "use named export" to reflect actual `export default` pattern; keep "no inline style" as aspirational but note current codebase uses inline styles
- [ ] 1.3 Rewrite `nextjs.md`: add `trailingSlash: true`, CJS `require()` format, `experimental.mdxRs`, ban on `'use client'` directive
- [ ] 1.4 Rewrite `blog-content.md`: update naming convention to allow Chinese slugs (e.g., `YYYY-MM-DD-中文标题.md`)
- [ ] 1.5 Delete `playwright-macos.md` (too vague, no project-specific content)

## 2. Deduplicate CLAUDE.md

- [ ] 2.1 Slim down "关键约定" section: replace detailed bullets with one-line summaries + pointers to rule files
- [ ] 2.2 Remove "易踩的坑" reference to deleted `playwright-macos.md`
- [ ] 2.3 Verify CLAUDE.md is under 60 lines after changes

## 3. Clean settings.local.json

- [ ] 3.1 Remove stale audio permissions (`Bash(wc -l ... .aiff)`, `Bash(ls ... .aiff)`)
- [ ] 3.2 Remove dangerous `Bash(rm:*)` permission
- [ ] 3.3 Remove `Bash(git rm:*)` (cleanup-session-only)
- [ ] 3.4 Remove stale grep permissions for component export counting
- [ ] 3.5 Remove `agentvibes` from `disabledMcpjsonServers` (no longer installed)

## 4. Verification

- [ ] 4.1 Confirm all rule files have valid YAML frontmatter (if paths present)
- [ ] 4.2 Confirm CLAUDE.md has no content duplicated in rule files
- [ ] 4.3 Confirm settings.local.json is valid JSON with only necessary permissions
