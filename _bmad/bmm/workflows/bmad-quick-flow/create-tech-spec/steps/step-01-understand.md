---
name: 'step-01-understand'
description: 'Analyze the requirement delta between current state and what user wants to build'

workflow_path: '{project-root}/_bmad/bmm/workflows/bmad-quick-flow/create-tech-spec'
nextStepFile: '{workflow_path}/steps/step-02-investigate.md'
skipToStepFile: '{workflow_path}/steps/step-03-generate.md'
templateFile: '{workflow_path}/tech-spec-template.md'
wipFile: '{implementation_artifacts}/tech-spec-wip.md'
---

# Step 1: Analyze Requirement Delta

**Progress: Step 1 of 4** - Next: Deep Investigation

## RULES:

- MUST NOT skip steps.
- MUST NOT optimize sequence.
- MUST follow exact instructions.
- MUST NOT look ahead to future steps.
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

## CONTEXT:

- Variables from `workflow.md` are available in memory.
- Focus: Define the technical requirement delta and scope.
- Investigation: Perform surface-level code scans ONLY to verify the delta. Reserve deep dives into implementation consequences for Step 2.
- Objective: Establish a verifiable delta between current state and target state.

## SEQUENCE OF INSTRUCTIONS

### 0. Check for Work in Progress

a) **Before anything else, check if `{wipFile}` exists:**

b) **IF WIP FILE EXISTS:**

1. Read the frontmatter and extract: `title`, `slug`, `stepsCompleted`
2. Calculate progress: `lastStep = max(stepsCompleted)`
3. Present to user:

```
Hey {user_name}! Found a tech-spec in progress:

**{title}** - Step {lastStep} of 4 complete

Is this what you're here to continue?

[y] Yes, pick up where I left off
[n] No, archive it and start something new
```

4. **HALT and wait for user selection.**

a) **Menu Handling:**

- **[y] Continue existing:**
  - Jump directly to the appropriate step based on `stepsCompleted`:
    - `[1]` → Load `{nextStepFile}` (Step 2)
    - `[1, 2]` → Load `{skipToStepFile}` (Step 3)
    - `[1, 2, 3]` → Load `{workflow_path}/steps/step-04-review.md` (Step 4)
- **[n] Archive and start fresh:**
  - Rename `{wipFile}` to `{implementation_artifacts}/tech-spec-{slug}-archived-{date}.md`

### 1. Greet and Ask for Initial Request

a) **Greet the user briefly:**

Hey alenryuichi! Let's get that CI/CD pipeline set up.

I understand you want to:
- Configure GitHub Actions for your Next.js static site (`output: export`).
- Deploy to GitHub Pages on push to `master`.
- Handle build, artifacts, and `basePath`.

I'll do a quick scan of your project config to confirm the specifics.

### 2. Quick Orient Scan

a) **Before asking detailed questions, do a rapid scan to understand the landscape:**

b) **Check for existing context docs:**

- Check `{output_folder}` and `{planning_artifacts}`for planning documents (PRD, architecture, epics, research)
- Check for `**/project-context.md` - if it exists, skim for patterns and conventions
- Check for any existing stories or specs related to user's request

c) **If user mentioned specific code/features, do a quick scan:**

- Search for relevant files/classes/functions they mentioned
- Skim the structure (don't deep-dive yet - that's Step 2)
- Note: tech stack, obvious patterns, file locations

d) **Build mental model:**

- What's the likely landscape for this feature?
- What's the likely scope based on what you found?
- What questions do you NOW have, informed by the code?

**This scan should take < 30 seconds. Just enough to ask smart questions.**

### 3. Ask Informed Questions

a) **Now ask clarifying questions - but make them INFORMED by what you found:**

Instead of generic questions like "What's the scope?", ask specific ones like:
- "`AuthService` handles validation in the controller — should the new field follow that pattern or move it to a dedicated validator?"
- "`NavigationSidebar` component uses local state for the 'collapsed' toggle — should we stick with that or move it to the global store?"
- "The epics doc mentions X - is this related?"

**Adapt to {user_skill_level}.** Technical users want technical questions. Non-technical users need translation.

b) **If no existing code is found:**

- Ask about intended architecture, patterns, constraints
- Ask what similar systems they'd like to emulate

### 4. Capture Core Understanding

a) **From the conversation, extract and confirm:**

- **Title**: A clear, concise name for this work
- **Slug**: URL-safe version of title (lowercase, hyphens, no spaces)
- **Problem Statement**: What problem are we solving?
- **Solution**: High-level approach (1-2 sentences)
- **In Scope**: What's included
- **Out of Scope**: What's explicitly NOT included

b) **Ask the user to confirm the captured understanding before proceeding.**

### 5. Initialize WIP File

a) **Create the tech-spec WIP file:**

1. Copy template from `{templateFile}`
2. Write to `{wipFile}`
3. Update frontmatter with captured values:
   ```yaml
   ---
   title: '{title}'
   slug: '{slug}'
   created: '{date}'
   status: 'in-progress'
   stepsCompleted: [1]
   tech_stack: []
   files_to_modify: []
   code_patterns: []
   test_patterns: []
   ---
   ```
4. Fill in Overview section with Problem Statement, Solution, and Scope
5. Fill in Context for Development section with any technical preferences or constraints gathered during informed discovery.
6. Write the file

Created: `_bmad-output/implementation-artifacts/tech-spec-wip.md`

**Captured:**

- **Title**: CI/CD Pipeline for GitHub Pages
- **Problem**: Automate manual build/deploy process.
- **Scope**: GitHub Actions workflow for Next.js (Export), Node setup, Artifact upload, Pages deployment.

I've confirmed your `next.config.js` correctly handles the `/KInfoGit` basePath for production.

**[a] Advanced Elicitation** - dig deeper (not needed here)
**[c] Continue** - proceed to detailed investigation
**[p] Party Mode** - bring in other experts

#### Menu Handling:

- **[a]**: Load and execute `{advanced_elicitation}`, then return here and redisplay menu
- **[c]**: Load and execute `{nextStepFile}` (Map Technical Constraints)
- **[p]**: Load and execute `{party_mode_exec}`, then return here and redisplay menu

---

## REQUIRED OUTPUTS:

- MUST initialize WIP file with captured metadata.

## VERIFICATION CHECKLIST:

- [ ] WIP check performed FIRST before any greeting.
- [ ] `{wipFile}` created with correct frontmatter, Overview, Context for Development, and `stepsCompleted: [1]`.
- [ ] User selected [c] to continue.
