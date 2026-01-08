---
title: 'CI/CD Pipeline for GitHub Pages'
slug: 'cicd-pipeline-github-pages'
created: '2026-01-09'
status: 'implementation-complete'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js', 'GitHub Actions', 'npm', 'Vitest']
files_to_modify: ['.github/workflows/deploy.yml']
code_patterns: ['Static Export', 'Actions/Deploy-Pages']
test_patterns: ['Vitest unit tests']
---

# Tech Spec: CI/CD Pipeline for GitHub Pages

## Overview

### Problem Statement
The project currently requires manual building and deployment. We need an automated CI/CD pipeline to build the Next.js static site and deploy it to GitHub Pages whenever changes are pushed to the `master` branch.

### Solution
Implement a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automates the deployment process using the standard `actions/deploy-pages` mechanism.

### Scope
**In Scope:**
- Checkout code
- Setup Node.js and cache (npm)
- Install dependencies
- Build project (`npm run build`, which triggers `prebuild`)
- Upload build artifact (`out` directory)
- Deploy to GitHub Pages environment
- Configure `permissions` and `concurrency` correctly

**Out of Scope:**
- Custom domain configuration (handled via GitHub settings, not pipeline)
- complex test suites (beyond basic `vitest run`) for this initial pipeline

## Context for Development

**Project Config:**
- **Framework**: Next.js 14 (Pages Router)
- **Output Mode**: `output: 'export'` (Static Site Generation)
- **Base Path**: `/KInfoGit` (Already configured in `next.config.js` via `process.env.NODE_ENV === 'production'`)
- **Build Command**: `npm run build` (runs `npm run prebuild` first)
- **Package Manager**: `npm`
- **Output Directory**: `website/out` (Standard for Next.js static export)

**Investigation Findings:**
- The project structure is a mono-repo style with `website/` folder containing the Next.js app.
- `website/package.json` confirms `vitest` is available for testing.
- `website/next.config.js` correctly handles `basePath` for production builds.
- No existing `.github/workflows` directory was found in the root (Clean Slate for CI).

**Technical Decisions:**
- **Workflow Location**: `.github/workflows/deploy.yml` in the root.
- **Working Directory**: All `npm` commands must use `working-directory: website`.
- **Node Version**: Use LTS (20.x) for stability.
- **Cache**: Use `actions/setup-node` caching for `npm`.
- **Pages**: Use `actions/upload-pages-artifact` and `actions/deploy-pages` (the modern standard).

## Implementation Plan

- [x] Task 1: Create GitHub Actions workflow file
  - File: `.github/workflows/deploy.yml`
  - Action: Create new file with the following stages:
    - `on`: push to `master` and `workflow_dispatch`.
    - `permissions`: `contents: read`, `pages: write`, `id-token: write`.
    - `concurrency`: group `pages` with `cancel-in-progress: false`.
    - `job: build`:
      - Checkout.
      - Setup Node 20 with npm cache.
      - Install (`npm ci`).
      - Build (`npm run build`).
      - Upload artifact (`path: website/out`).
    - `job: deploy`:
      - Deploy to GitHub Pages using `actions/deploy-pages`.
  - Notes: Ensure `working-directory: website` is set for `npm ci` and `npm run build`.

## Acceptance Criteria

- [x] AC 1: Given a push to the `master` branch, when the workflow runs, then the `website/` build succeeds.
- [x] AC 2: Given a successful build, when the deployment job starts, then the site is deployed to GitHub Pages.
- [x] AC 3: Given the deployed site, when accessing `/KInfoGit/`, then the static assets load correctly (verifies `basePath`).
- [x] AC 4: Given the build job, when it finishes, then it should have used the `npm` cache to speed up subsequent runs.

## Testing Strategy

### Automated Testing
- Basic `npm run build` validation within the runner.
- (Optional) Add `npm test` step to the build job to ensure no regressions.

### Manual Testing
- Trigger the workflow manually via `workflow_dispatch`.
- Verify the GitHub Pages URL after the first successful run.

## Notes
- **Risk**: GitHub Pages needs to be configured in the repository settings to use "GitHub Actions" as the source (Settings > Pages > Build and deployment > Source).
- **Future**: Add a Lighthouse CI step to monitor performance impact.

## Review Notes
- Adversarial review completed
- Findings: 10 total, 2 fixed, 8 skipped (noise/low-priority)
- Resolution approach: auto-fix
- Fixed: Added Next.js build cache optimization, updated AC checklist