## Context

The `.claude/rules/` system was created during a cleanup session. An adversarial review found that rules describe aspirational conventions rather than actual project patterns. CLAUDE.md duplicates content from rule files. `code-style.md` lacks path scoping, applying TypeScript rules to JSON and Markdown. `settings.local.json` carries stale permissions from a deleted AgentVibes installation.

## Goals / Non-Goals

**Goals:**
- Every rule file accurately describes what the codebase actually does today
- CLAUDE.md is a concise entry point with zero duplication of rules content
- All rule files have appropriate path scoping
- settings.local.json contains only necessary, current permissions

**Non-Goals:**
- Changing application code (that's the refactor-component-exports change)
- Adding new rules for areas not yet covered
- Restructuring the .claude/ directory layout

## Decisions

1. **Rules reflect reality, not ideals**: components.md will say `export default` is the current pattern (until refactor-component-exports lands, after which it should be updated). Rationale: rules that contradict 100% of existing code cause AI to generate inconsistent new code.

2. **CLAUDE.md deduplication strategy**: Keep the "关键约定" section as one-line summaries pointing to rules, remove the detailed bullet points that duplicate rule file content. Rationale: single source of truth prevents drift.

3. **code-style.md scoping**: Add `paths: ["website/**/*.ts", "website/**/*.tsx"]` rather than leaving it global. Rationale: "use single quotes" is wrong for JSON; indentation rules are irrelevant for Markdown content.

4. **playwright-macos.md**: Remove the file entirely rather than keep vague generic content. Re-add via "progressive accumulation" when a real project-specific issue is encountered. Rationale: empty information is worse than no information — it signals a problem is solved when it isn't.

5. **settings.local.json cleanup**: Remove audio permissions, `rm:*`, grep permissions, and `agentvibes` from disabled servers. Keep only daily-use permissions. This is a local file not tracked by git.

## Risks / Trade-offs

- **[Rule accuracy after refactor-component-exports]** → components.md must be updated again after the export refactor lands. Accept this as sequenced work.
- **[Removing playwright-macos.md]** → Loses the signal that macOS Playwright has issues. → The CLAUDE.md "易踩的坑" section still references it; update that reference too.
