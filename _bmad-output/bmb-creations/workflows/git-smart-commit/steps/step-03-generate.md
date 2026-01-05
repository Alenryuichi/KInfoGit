---
name: 'step-03-generate'
description: 'Generate Conventional Commits messages per group and build commit_plan (YOLO)'

# Path Definitions
workflow_path: '{project-root}/_bmad-output/bmb-creations/workflows/git-smart-commit'

# File References
thisStepFile: '{workflow_path}/steps/step-03-generate.md'
nextStepFile: '{workflow_path}/steps/step-05-execute.md'
workflowFile: '{workflow_path}/workflow.md'
sidecarFile: '{workflow_path}/.sidecar-git-smart-commit.md'

# Task References
advancedElicitationTask: '{project-root}/_bmad/core/workflows/advanced-elicitation/workflow.xml'
partyModeWorkflow: '{project-root}/_bmad/core/workflows/party-mode/workflow.md'

# Template References
# (none)

---

# Step 3: Generate Commit Plan (Multi-Commit, YOLO)

## STEP GOAL:

Generate an ordered `commit_plan`: one Conventional Commit message per `commit_group`, then proceed directly to execution.

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
- ✅ You bring expertise in Conventional Commits and change intent summarization, user brings domain context, and together you produce accurate messages
- ✅ Maintain collaborative, safety-first tone throughout

### Step-Specific Rules:

- 🎯 Focus only on message generation and plan construction
- 🚫 FORBIDDEN to execute git commit in this step
- ✅ Enforce Conventional Commits strictly: `type(scope): subject`
- ✅ Subject: imperative, lowercase first letter, no period, ≤ 50 chars

## EXECUTION PROTOCOLS:

- 🎯 Read sidecar preferences (if any)
- 💾 Generate deterministic messages per group
- 📖 Output the plan for transparency
- 🚫 Do not stage or commit

## CONTEXT BOUNDARIES:

- Available context: `commit_groups` from step 2
- Focus: message + plan creation
- Limits: no execution
- Dependencies: sidecar may influence language/types/scopes

## Sequence of Instructions (Do not deviate, skip, or optimize)

### 1) Load sidecar preferences (if any)

Read `{sidecarFile}`. Apply any strong preference (language/scopes/types). Default: English subject lines.

### 2) Choose type/scope/subject per group

- **Type mapping (default):**
  - deletions/cleanup/tooling/config → `chore`
  - new workflow capability → `feat`
  - bug fix only → `fix`
  - docs only → `docs`

- **Scope mapping (default):**
  - `.claude/**` → `claude`
  - `_bmad/**` → `bmad`
  - `_bmad-output/**` → `bmad`
  - otherwise → `repo`

### 3) Build `commit_plan`

Each entry:

- `message`
- `paths`
- `group_id`

### 4) Display plan (informational)

Print:

- total commits planned
- each commit message + file count

### 5. Present MENU OPTIONS

Display: "**Proceeding to multi-commit execution...**"

#### Menu Handling Logic:

- Immediately load, read entire file, then execute `{nextStepFile}`

#### EXECUTION RULES:

- YOLO: no user selection/edit/regenerate

## CRITICAL STEP COMPLETION NOTE

ONLY when `commit_plan` is produced, will you then load and read fully `{nextStepFile}` to execute commits.
