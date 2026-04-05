## ADDED Requirements

### Requirement: Rules reflect actual codebase patterns
Every rule in `.claude/rules/` SHALL describe the project's current actual patterns, not aspirational or ideal patterns that differ from reality.

#### Scenario: Component export rule matches reality
- **WHEN** Claude reads `components.md`
- **THEN** the export convention described SHALL match what >90% of existing component files actually use

#### Scenario: Blog naming rule matches reality
- **WHEN** Claude reads `blog-content.md`
- **THEN** the file naming convention SHALL accommodate both English and Chinese slugs as found in the actual blog directory

### Requirement: CLAUDE.md has no duplicated rule content
CLAUDE.md SHALL NOT repeat detailed conventions that are already specified in `.claude/rules/` files. CLAUDE.md MAY reference rule files by name or contain one-line summaries.

#### Scenario: SSG convention appears once
- **WHEN** the SSG-only constraint is documented
- **THEN** the detailed rule (output: 'export', no API Routes, no SSR) SHALL appear only in `nextjs.md`, not repeated verbatim in CLAUDE.md

#### Scenario: Component convention appears once
- **WHEN** component conventions are documented
- **THEN** the detailed rules (function components, Props interface, Tailwind) SHALL appear only in `components.md`, not repeated in CLAUDE.md

### Requirement: Rule files have appropriate path scoping
Rule files that contain language-specific or framework-specific conventions SHALL include a `paths` frontmatter to limit their scope to relevant files.

#### Scenario: Code style scoped to TypeScript
- **WHEN** `code-style.md` is loaded
- **THEN** it SHALL have `paths` including `website/**/*.ts` and `website/**/*.tsx`, and SHALL NOT apply to `.json` or `.md` files

### Requirement: Next.js rule includes critical config details
The `nextjs.md` rule SHALL document project-specific Next.js configuration that affects code generation.

#### Scenario: trailingSlash documented
- **WHEN** Claude generates `<Link>` components or route references
- **THEN** `nextjs.md` SHALL document that `trailingSlash: true` is configured

#### Scenario: CJS format documented
- **WHEN** Claude needs to modify `next.config.js`
- **THEN** `nextjs.md` SHALL document that the config uses CommonJS (`require()`) format

#### Scenario: 'use client' ban documented
- **WHEN** Claude creates a new component
- **THEN** `nextjs.md` SHALL instruct not to add `'use client'` (Pages Router does not use it)

### Requirement: Settings files contain only current valid entries
`.claude/settings.local.json` SHALL NOT contain permissions or references to deleted features or tools.

#### Scenario: No audio references after cleanup
- **WHEN** `.claude/audio/` directory has been deleted
- **THEN** `settings.local.json` SHALL NOT contain any audio-related Bash permissions

#### Scenario: No dangerous wildcard permissions
- **WHEN** a temporary destructive permission (e.g., `Bash(rm:*)`) was granted during a cleanup session
- **THEN** it SHALL be removed after the session ends

### Requirement: Vague rules are removed
Rule files that contain only generic information available through web search, with no project-specific actionable content, SHALL be removed.

#### Scenario: playwright-macos.md evaluation
- **WHEN** `playwright-macos.md` contains only generic macOS Playwright path information
- **THEN** it SHALL be deleted, and any references to it in CLAUDE.md SHALL be updated
