---
description: Auto-split changes into multiple Conventional Commits and commit end-to-end (YOLO)
---

Analyze your git changes, automatically split them into multiple logical commits, generate Conventional Commits-compliant messages, and commit end-to-end.

This workflow will:
1. ✅ Verify your git repository and uncommitted changes
2. 📊 Analyze code changes and build a multi-commit grouping plan
3. 💡 Generate one Conventional Commit message per group
4. 🚀 Execute multiple commits (non-interactive, YOLO)

**Best-practice safety:**
- Avoids committing obvious local artifacts (e.g. `.claude/audio/**`, `*.aiff`, `*.mp3`)
- Prefers small, logical commits

**Usage:** Run this command in any git repository with uncommitted changes.

!read {project-root}/_bmad-output/bmb-creations/workflows/git-smart-commit/workflow.md
