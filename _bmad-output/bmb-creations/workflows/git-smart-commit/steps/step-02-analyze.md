---
name: 'step-02-analyze'
description: 'Analyze working tree changes and build commit_groups (no messages yet)'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/git-smart-commit'

# File References
thisStepFile: '{workflow_path}/steps/step-02-analyze.md'
nextStepFile: '{workflow_path}/steps/step-03-generate.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{workflow_path}/.sidecar-git-smart-commit.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Template References
# (none)

---

# Step 2: Analyze Changes (Auto-Split Planning)

## STEP GOAL:

Analyze git changes and produce a deterministic `commit_groups` plan (multiple commits), without generating commit messages yet.

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
- ✅ You bring expertise in change intent analysis and safe git operations, user brings domain context, and together you split changes into the smallest meaningful commits
- ✅ Maintain collaborative, safety-first tone throughout

### Step-Specific Rules:

- 🎯 Focus only on grouping/planning; do not generate commit messages here
- 🚫 FORBIDDEN to run any `git commit` in this step
- 💬 Keep groups small and logically coherent
- 🚫 Exclude obvious local artifacts from any group (`.claude/audio/**`, `*.aiff`, `*.mp3`)

## EXECUTION PROTOCOLS:

- 🎯 Collect full change data
- 💾 Classify paths and build ordered groups
- 📖 Output an explainable plan
- 🚫 Do not stage or commit

## CONTEXT BOUNDARIES:

- Available context: git status summary from step 1
- Focus: change classification + grouping plan
- Limits: no commit messages, no execution
- Dependencies: requires uncommitted changes

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1) Collect full change data

Run:

- `git status --porcelain=v1 -uall`
- `git diff --name-status HEAD`
- `git diff HEAD`

### 2) Identify affected files and classify

Classify each path:

- **claude**: `.claude/**`
- **bmad-core**: `_bmad/**`
- **bmad-output**: `_bmad-output/**`
- **website**: `website/**`
- **profile-data**: `profile-data/**`
- **misc**: everything else

Also record change kind (A/M/D/R).

### 3) Build commit grouping plan (NO messages)

Create an ordered `commit_groups` list using curated grouping:

1. Cleanup legacy claude items (deletions)
2. Update claude config
3. Add/Update BMAD installation & workflows
4. Add/Update curated BMAD outputs (tracking + workflow artifacts only)
5. Everything else (curated)

For each group store:

- `group_id`
- `scope_hint`
- `paths`
- `notes`

### 4) Output analysis summary

Print:

- Total files changed
- Excluded files list
- Ordered `commit_groups` with file lists

### 5. Present MENU OPTIONS

Display: "**Proceeding to commit plan generation...**"

#### Menu Handling Logic:

- Immediately load, read entire file, then execute `{nextStepFile}`

#### EXECUTION RULES:

- This is a YOLO planning step with no user choices

## CRITICAL STEP COMPLETION NOTE

ONLY when `commit_groups` is produced, will you then load and read fully `{nextStepFile}` to execute and build the final `commit_plan`.
