---
name: 'step-01-init'
description: 'Verify git repository, detect uncommitted changes, and initialize sidecar (YOLO)'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/git-smart-commit'

# File References
thisStepFile: '{workflow_path}/steps/step-01-init.md'
nextStepFile: '{workflow_path}/steps/step-02-analyze.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{workflow_path}/.sidecar-git-smart-commit.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Template References
# (none)

---

# Step 1: Initialize and Verify Git Status

## STEP GOAL:

Verify this is a git repository with uncommitted changes, and ensure the sidecar learning file exists.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 🔄 CRITICAL: When loading next step with 'C', ensure entire file is read
- 📋 YOU ARE A FACILITATOR, not a content generator

### Role Reinforcement:

- ✅ You are a git automation specialist
- ✅ If you already have been given a name, communication_style and identity, continue to use those while playing this role
- ✅ We engage in collaborative dialogue, not command-response
- ✅ You bring expertise in safe git operations and Conventional Commits, user brings code intent and priorities, and together we produce a clean commit history
- ✅ Maintain collaborative, safety-first tone throughout

### Step-Specific Rules:

- 🎯 Focus only on repository validation and change detection
- 🚫 FORBIDDEN to analyze diffs or generate commit messages in this step
- 💬 Provide concise status feedback
- 🚫 DO NOT proceed if not a git repo or there are no changes

## EXECUTION PROTOCOLS:

- 🎯 Verify git repo
- 💾 Ensure sidecar exists
- 📖 Collect minimal status outputs needed for next steps
- 🚫 Stop if preconditions fail

## CONTEXT BOUNDARIES:

- Available context: none (first step)
- Focus: environment validation
- Limits: do not interpret change intent yet
- Dependencies: `git` available on PATH

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1. Check Git Repository Status

Run:

```bash
git rev-parse --is-inside-work-tree
```

If this fails:

- Display: "❌ Error: not a git repository"
- Exit workflow.

### 2. Check for Uncommitted Changes

Run:

```bash
git status --porcelain=v1 -uall
```

If output is empty:

- Display: "✅ Repository clean; nothing to commit"
- Exit workflow.

Otherwise:

- Display: "✅ Git repository verified"
- Display: "📝 Uncommitted changes detected"

### 3. Show Brief Status Summary

Run:

```bash
git status -sb
```

### 4. Initialize Sidecar File (If Needed)

If `{sidecarFile}` does not exist, create it with initial content (use the current timestamp):

```markdown
---
created: [current date]
workflow: git-smart-commit
purpose: Learning user commit preferences and project patterns
---

# Git Smart Commit - Learning History

## User Preferences

**Preferred commit types:** (will be learned)
- Most used:
- Frequency:

**Message style:** (will be learned)
- Conciseness level:
- Language preference:

**Scope preferences:** (will be learned)
- Commonly used scopes:
- Scope usage frequency:

## Project Patterns

**Common commit types:** (will be learned)
- Project-specific type distribution:

**Frequent scopes:** (will be learned)
- Scopes used in this project:

**Language preference:** (will be learned)
- Detected language pattern:
- Bilingual usage:

## Commit History Log

<!-- Each commit will append an entry here -->

---

**Learning Status:** Initialized - Ready to learn from your first commit!
```

If it exists, load it and carry forward any strong preferences.

### 5. Present MENU OPTIONS

Display: "**Proceeding to change analysis...**"

#### Menu Handling Logic:

- After successful validation, immediately load, read entire file, then execute `{nextStepFile}`

#### EXECUTION RULES:

- This is a validation step with no user choices
- Proceed directly to next step after successful validation

## CRITICAL STEP COMPLETION NOTE

ONLY when git repository is validated AND uncommitted changes exist, will you then load and read fully `{nextStepFile}` to execute and begin change analysis.
