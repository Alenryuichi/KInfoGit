## Why

An adversarial code review revealed that the Claude Code rules system (.claude/rules/ + CLAUDE.md) has 9 issues: rules contradict reality, content is duplicated between CLAUDE.md and rule files, scoping is wrong, key project details are missing, and settings files have stale/dangerous entries. These issues cause Claude to generate inconsistent code and operate with incorrect assumptions.

## What Changes

- **Rewrite CLAUDE.md**: Remove duplicated rule content, keep only high-level pointers to .claude/rules/
- **Fix code-style.md**: Add `paths` to scope it to TypeScript files only (not JSON/Markdown)
- **Fix components.md**: Align with reality (reflect actual `export default` pattern until refactor-component-exports is applied)
- **Fix nextjs.md**: Add missing details (CJS format, `trailingSlash: true`, `experimental.mdxRs`, ban `'use client'`)
- **Fix blog-content.md**: Allow Chinese slugs in naming convention
- **Rewrite playwright-macos.md**: Replace vague generic info with project-specific actionable content, or remove if no real project-specific issues exist
- **Clean settings.local.json**: Remove stale audio permissions, `Bash(rm:*)`, stale `agentvibes` disabled server

## Capabilities

### New Capabilities
- `rules-accuracy`: Ensure all .claude/rules/ files accurately describe the project's actual patterns, conventions, and constraints

### Modified Capabilities

## Impact

- **Files modified**: CLAUDE.md, 5 files in .claude/rules/, .claude/settings.local.json
- **No code changes**: This only affects Claude Code configuration, not application code
- **Risk**: Zero — rules changes don't affect builds, tests, or runtime
