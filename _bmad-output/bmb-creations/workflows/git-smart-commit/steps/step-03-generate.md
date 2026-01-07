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

Read `{sidecarFile}` and extract learned preferences:

- `preferred_types`: Ordered list of most-used commit types
- `preferred_scopes`: Ordered list of most-used scopes
- `language`: Preferred language for commit messages (default: `en`)
- `type_counts`: Statistics for type usage
- `scope_counts`: Statistics for scope usage

Apply preferences:
- Use `language` for subject line language
- Consider `preferred_scopes` when mapping paths to scopes
- Fall back to defaults if sidecar is empty or missing fields

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

### 3) Generate optional body (AI-friendly context)

For **complex changes** (≥3 files OR refactor/feat type), generate a body that explains:

- **Why** the change was made (not just what)
- **Impact** or benefit of the change
- **Key details** that aren't obvious from the diff

**Body generation rules:**
- Wrap at 72 characters per line
- Use bullet points for multiple points
- Keep it concise (2-5 lines max)
- Skip body for trivial changes (single file docs/chore)

**Body template:**
```
<1-2 sentence summary of why this change matters>

- <key point 1>
- <key point 2 if needed>
```

**Example with body:**
```
refactor(bmad): redesign sidecar with rolling window and statistics

Replace append-only design with rolling window (max 20 commits) to prevent
infinite file growth. Add aggregated type/scope statistics for preference
learning.

- Reduces sidecar file size by 92% (1206 → 98 lines)
- Enables automatic preference updates based on usage frequency
```

### 4) Build `commit_plan`

Each entry:

- `subject`: The subject line (`type(scope): description`)
- `body`: Optional body text (null for simple commits)
- `paths`
- `group_id`

### 5) Display plan (informational)

Print:

- total commits planned
- each commit subject + body preview (if any) + file count

### 6. Present MENU OPTIONS

Display: "**Proceeding to multi-commit execution...**"

#### Menu Handling Logic:

- Immediately load, read entire file, then execute `{nextStepFile}`

#### EXECUTION RULES:

- YOLO: no user selection/edit/regenerate

## CRITICAL STEP COMPLETION NOTE

ONLY when `commit_plan` is produced, will you then load and read fully `{nextStepFile}` to execute commits.
