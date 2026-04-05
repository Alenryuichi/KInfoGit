## Why

All 26 React components in `website/components/` use `export default`, and 7 have a meaningless `'use client'` directive (this is a Pages Router project). The `.claude/rules/components.md` specifies named exports, creating a 100% mismatch between rules and reality. New AI-generated code follows the rule while all existing code contradicts it—causing permanent style inconsistency across the codebase.

## What Changes

- Convert all 26 component files from `export default function Xxx` / `export default Xxx` to `export function Xxx`
- Remove `'use client'` directives from 7 components (Blog, Contact, ContactModal, FloatingLines, Footer, GitHubActivity, Header)
- Update all import sites in `pages/` and `components/` from `import Xxx from '...'` to `import { Xxx } from '...'`
- Update 4 test files (About.test.tsx, BlogCard.test.tsx, Hero.test.tsx, Skills.test.tsx) with corrected imports

## Capabilities

### New Capabilities
- `named-exports`: Standardize all component exports to named exports and remove unused directives

### Modified Capabilities

## Impact

- **Components**: All 26 files in `website/components/` modified (export statement + optional `'use client'` removal)
- **Pages**: All files in `website/pages/` that import components need import syntax updates
- **Tests**: 4 test files need import syntax updates
- **No runtime behavior change**: Named exports vs default exports produce identical runtime behavior; `'use client'` was already a no-op in Pages Router
