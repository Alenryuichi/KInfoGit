---
name: 'step-05-execute'
description: 'Execute multiple git commits based on commit_plan (YOLO auto-split)'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/git-smart-commit'

# File References
thisStepFile: '{workflow_path}/steps/step-05-execute.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{workflow_path}/.sidecar-git-smart-commit.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Template References
# (none)

---

# Step 5: Execute Multi-Commit (Auto-Split, YOLO)

## STEP GOAL:

Execute multiple `git add` + `git commit` operations using the `commit_plan` generated in step 3.

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
- ✅ You bring expertise in safe side-effect execution, user brings acceptance of automation risk, and together you keep history clean and safe
- ✅ Maintain collaborative, safety-first tone throughout

### Step-Specific Rules:

- 🎯 Focus only on safe, deterministic execution of the already-built `commit_plan`
- 🚫 FORBIDDEN to re-group changes in this step
- ✅ Do not stage excluded local artifacts:
  - `.claude/audio/**`
  - `*.aiff`, `*.mp3`
- ✅ If a group has no stageable changes, skip it
- 🚫 If any `git commit` fails, stop and exit (do not continue committing)

## EXECUTION PROTOCOLS:

- 🎯 Preflight: verify repo + non-clean status
- 💾 Ensure staging area clean before starting
- 📖 Execute commits strictly in plan order
- 🚫 Fail-fast on errors

## CONTEXT BOUNDARIES:

- Available context: `commit_plan` from step 3
- Focus: staging + committing + logging
- Limits: no message changes, no regrouping
- Dependencies: working tree changes exist

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1) Preflight

Run:

- `git rev-parse --is-inside-work-tree`
- `git status --porcelain=v1 -uall`

If clean, exit.

### 2) Ensure clean staging area

Run:

- `git reset`

### 3) Execute commits in order

For each entry in `commit_plan`:

1. Stage only that group’s paths:
   - Filter out excluded patterns from the path list
   - `git add -- <paths...>`

2. Verify something is staged:
   - `git diff --cached --name-only`
   - If empty → `git reset` and skip this commit.

3. Commit:
   - If `body` is null or empty:
     - `git commit -m "<subject>"`
   - If `body` exists:
     - `git commit -m "<subject>" -m "<body>"`
   - If commit fails → stop and exit.

4. Record:
   - `git rev-parse --short HEAD`

5. Reset staging for next group:
   - `git reset`

### 4) Summary

After all groups:

- `git log -n <N> --oneline`
- `git status -sb`

### 5) Update Sidecar (Rolling Window + Statistics)

Update `{sidecarFile}` with new data:

#### A. Update Statistics

For each created commit, parse the message `type(scope): subject` and increment:
- `type_counts.{type}` += 1
- `scope_counts.{scope}` += 1

#### B. Update Preferred Lists

Re-sort `preferred_types` and `preferred_scopes` by frequency (highest first, top 3).

#### C. Add to Recent Commits (Rolling Window)

For each created commit, prepend to `recent_commits`:
```yaml
- hash: {short_hash}
  message: "{subject}"  # Subject line only, not body
  date: {current_date}
```

#### D. Enforce Rolling Window Limit

If `recent_commits` length > `max_recent_commits` (default 20):
- Trim oldest entries to keep only the most recent 20

#### E. Update Metadata

Set `last_updated` to current date.

### 6) Completion

Print:

- total commits created
- any skipped groups
- reminder to `git push` when ready

## CRITICAL STEP COMPLETION NOTE

This is the final step. The workflow completes when all planned commits have been attempted and a summary has been printed.
