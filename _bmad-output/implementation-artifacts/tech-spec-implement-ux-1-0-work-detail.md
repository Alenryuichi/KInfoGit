---
title: 'Implement UX 1.0: Work & Project Detail'
slug: 'implement-ux-1-0-work-detail'
created: '2026-01-08'
status: 'completed'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js (Pages Router)', 'Tailwind CSS', 'Framer Motion', 'Mermaid.js', 'MDX']
files_to_modify: ['website/pages/work.tsx', 'website/pages/work/[id].tsx', 'website/lib/data.ts', 'website/types/project.ts', 'profile-data/projects/*.md', 'website/components/ProjectHeader.tsx', 'website/components/StickyTOC.tsx', 'website/components/TechStack.tsx', 'website/components/MermaidDiagram.tsx']
code_patterns: ['Static Generation (SSG)', 'Headless UI components', 'Bento Grid Layout', 'MDX Content']
test_patterns: ['Component Tests', 'Data Validation Tests']
---

# Tech-Spec: Implement UX 1.0: Work & Project Detail

**Created:** 2026-01-08

## Overview

### Problem Statement

The current Work page and Project Detail pages are generic and do not reflect the "Engineering Professionalism" required to effectively target HR (speed) and Technical Interviewers (depth). They lack the visual hierarchy and interactive depth needed to showcase system architecture capabilities.

### Solution

Implement the "Hybrid Professional" UX design. Refactor the Work page into a Bento Grid with Spotlight effects. Transform the Project Detail page into an interactive "Engineering Document" with structured metadata, sticky TOC, and technical deep-dive sections.

### Scope

**In Scope:**
- **Work Page (`pages/work.tsx`)**: Refactor to Bento Grid layout with responsive columns.
- **Spotlight Card**: Integrate `components/SpotlightCard.tsx` into the grid.
- **Project Detail (`pages/work/[id].tsx`)**: Refactor to 2-column "Engineering Doc" layout.
- **Data Schema**: Extend MDX frontmatter in `profile-data/projects/*.md` (impact, tags, layout).
- **New Components**: `ProjectHeader`, `StickyTOC`, `TechStack`, `MermaidDiagram`.
- **Data Logic**: Update `lib/data.ts` and `types/project.ts` to parse new fields.

**Out of Scope:**
- Homepage optimization.
- Blog section.
- Complex custom interactive diagrams (using Mermaid.js for V1).
- Mobile-specific custom gestures.

## Context for Development

### Codebase Patterns

- **Framework**: Next.js (Pages Router) + Tailwind CSS.
- **Data Fetching**: `getStaticProps` reads from `profile-data/projects.json` (legacy) and `profile-data/projects/*.md` (new). Logic resides in `website/lib/data.ts` and `website/lib/projects.ts` (needs consolidation).
- **Components**: Functional components with Tailwind classes. `SpotlightCard` exists but needs integration.
- **Routing**: `website/pages/work/[id].tsx` handles dynamic project routes.

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `website/pages/work.tsx` | Main entry point to be refactored to Bento Grid. |
| `website/pages/work/[id].tsx` | Project detail page to be refactored to Engineering Doc layout. |
| `website/components/SpotlightCard.tsx` | Existing component to be utilized for project cards. |
| `website/lib/data.ts` | Data fetching logic (legacy). |
| `website/lib/projects.ts` | Newer data fetching logic (needs checking). |
| `website/types/project.ts` | Type definitions to be updated. |
| `profile-data/projects/*.md` | Source data files to be updated with extended frontmatter. |

### Technical Decisions

- **Diagramming**: Selected Mermaid.js for architecture diagrams to maintain "Infrastructure as Code" philosophy and compatibility with MDX, ensuring easy maintenance without a CMS.
- **Bento Grid**: Will use CSS Grid with `grid-template-columns` and `col-span` utility classes controlled by MDX frontmatter (`layout` field).
- **Data Source**: Will prioritize `profile-data/projects/*.md` as the source of truth for detailed content, while keeping `projects.json` for lightweight list data if needed, or merging them.

## Implementation Plan

### Tasks

#### 1. Foundation: Data Schema & Utilities

- [x] Task 1: Update Project Type Definition
  - File: `website/types/project.ts`
  - Action: Add new fields: `impact` (string), `layout` (string: 'featured' | 'normal' | 'compact'), `techStackDetail` (object array).
  - Notes: Ensure backward compatibility or update existing data validation.

- [x] Task 2: Extend MDX Parsing Logic
  - File: `website/lib/data.ts` (or `website/lib/projects.ts`)
  - Action: Update `getProjectById` to parse the new frontmatter fields from MDX files.
  - Notes: Ensure `gray-matter` config captures the new fields.

- [x] Task 3: Migrate/Update Data Files
  - File: `profile-data/projects/*.md`
  - Action: Add `impact`, `tags`, and `layout` fields to the frontmatter of all existing project MDX files.
  - Notes: Use `layout: featured` for top projects, `layout: normal` for others.

#### 2. Components: Building Blocks

- [x] Task 4: Create MermaidDiagram Component
  - File: `website/components/MermaidDiagram.tsx`
  - Action: Create a component that renders Mermaid.js diagrams.
  - Notes: Use `mermaid.initialize` in `useEffect`. Handle hydration issues (client-side only rendering).

- [x] Task 5: Create StickyTOC Component
  - File: `website/components/StickyTOC.tsx`
  - Action: Create a Table of Contents component that parses headings and highlights the active section on scroll.
  - Notes: Use `IntersectionObserver`.

- [x] Task 6: Create ProjectHeader Component
  - File: `website/components/ProjectHeader.tsx`
  - Action: Create a reusable header component for the detail page displaying title, tags, impact, and period.
  - Notes: Style with large typography and "Engineering Doc" aesthetic.

#### 3. Page Refactoring: Work Page (Bento Grid)

- [x] Task 7: Refactor Work Page Layout
  - File: `website/pages/work.tsx`
  - Action: Replace the existing list layout with a CSS Grid layout.
  - Notes: Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.

- [x] Task 8: Implement Bento Items with Spotlight
  - File: `website/pages/work.tsx`
  - Action: Map projects to grid items. Use `SpotlightCard` as the container. Apply `col-span-2` class based on `project.layout` field.
  - Notes: Ensure hover effects work correctly within the grid.

#### 4. Page Refactoring: Project Detail (Engineering Doc)

- [x] Task 9: Refactor Project Detail Layout
  - File: `website/pages/work/[id].tsx`
  - Action: Implement the 2-column layout (Left: Content, Right: TOC/Meta or Content/Sidebar).
  - Notes: Ensure responsive behavior (stack on mobile).

- [x] Task 10: Integrate MDX Components
  - File: `website/pages/work/[id].tsx`
  - Action: Update `MarkdownRenderer` to support the new `MermaidDiagram` component.
  - Notes: Pass custom components to the MDX provider/renderer.

### Acceptance Criteria

#### Work Page (Bento Grid)
- [x] AC 1: Given I am on the Work page, when I view the grid, then I see projects arranged in a responsive grid layout.
- [x] AC 2: Given a project has `layout: featured`, when rendered, then it spans 2 columns (on desktop).
- [x] AC 3: Given I hover over a project card, when I move my mouse, then I see the spotlight effect following my cursor.
- [x] AC 4: Given I look at a project card, when inspected, then I see the "Impact" badge (e.g., "3M+ Revenue") if the data exists.

#### Project Detail Page
- [x] AC 5: Given I am on a project detail page, when I scroll down, then the TOC on the right (or left) sticks to the viewport and highlights the current section.
- [x] AC 6: Given the project has a Mermaid diagram definition in MDX, when the page loads, then I see a rendered SVG diagram.
- [x] AC 7: Given I am on mobile, when I view the detail page, then the layout collapses to a single column, and the TOC is hidden or moves to the top.

## Additional Context

### Dependencies

- **mermaid**: `npm install mermaid`
- **framer-motion**: (Already installed)

### Testing Strategy

- **Manual Verification**: Check `http://localhost:3000/work` for grid responsiveness and spotlight effects.
- **Content Verification**: Check `http://localhost:3000/work/anti-fraud-governance` to ensure the Mermaid diagram renders and the TOC works.

### Notes

- **Mermaid Hydration**: Mermaid diagrams might cause hydration mismatches if not handled carefully (render only on client).
- **TOC Performance**: Ensure `IntersectionObserver` doesn't cause jank on scroll.

## Review Notes

- **Adversarial review completed**: 2026-01-07
- **Findings**: 15 total, 4 fixed (Critical/High priority), 11 acknowledged/skipped (Medium/Low or incomplete features)
- **Resolution approach**: Auto-fix

### Fixed Issues:
- F1: Removed `'use client'` directive (incompatible with Pages Router)
- F2: Moved mermaid.initialize to module scope (prevents re-initialization)
- F5: Added defensive handling for `String(children)` in MarkdownRenderer

### Acknowledged (not fixed):
- F7: `techStackDetail` is an optional future feature, not blocking MVP
- F9-F11: Medium priority UI polish items for future iteration
- F13-F15: Low priority improvements (error boundaries, tests for new components)