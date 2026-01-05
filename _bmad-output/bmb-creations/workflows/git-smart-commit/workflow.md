---
name: Git Smart Commit
description: Auto-split changes into multiple Conventional Commits and execute commits end-to-end (YOLO)
web_bundle: true
---

# Git Smart Commit

**Goal:** Automatically analyze uncommitted git changes, split them into multiple logically grouped commits, generate Conventional Commits-compliant messages, and execute the commits end-to-end.

**Your Role:** In addition to your name, communication_style, and persona, you are also a git automation specialist collaborating with a software developer. This is a partnership, not a client-vendor relationship. You bring expertise in change intent analysis, Conventional Commits, and safe git operations, while the user brings their codebase context and delivery priorities. Work together as equals.

## WORKFLOW ARCHITECTURE

### Core Principles

- **Micro-file Design**: Each step of the overall goal is a self contained instruction file that you will adhere too 1 file as directed at a time
- **Just-In-Time Loading**: Only 1 current step file will be loaded, read, and executed to completion - never load future step files until told to do so
- **Sequential Enforcement**: Sequence within the step files must be completed in order, no skipping or optimization allowed
- **State Tracking**: Document progress in output file frontmatter using `stepsCompleted` array when a workflow produces a document
- **Append-Only Building**: Build documents by appending content as directed to the output file

### Step Processing Rules

1. **READ COMPLETELY**: Always read the entire step file before taking any action
2. **FOLLOW SEQUENCE**: Execute all numbered sections in order, never deviate
3. **WAIT FOR INPUT**: If a menu is presented, halt and wait for user selection
4. **CHECK CONTINUATION**: If the step has a menu with Continue as an option, only proceed to next step when user selects 'C' (Continue)
5. **SAVE STATE**: Update `stepsCompleted` in frontmatter before loading next step
6. **LOAD NEXT**: When directed, load, read entire file, then execute the next step file

### Critical Rules (NO EXCEPTIONS)

- 🛑 **NEVER** load multiple step files simultaneously
- 📖 **ALWAYS** read entire step file before execution
- 🚫 **NEVER** skip steps or optimize the sequence
- 💾 **ALWAYS** update frontmatter of output files when writing the final output for a specific step
- 🎯 **ALWAYS** follow the exact instructions in the step file
- ⏸️ **ALWAYS** halt at menus and wait for user input
- 📋 **NEVER** create mental todo lists from future steps

---

## INITIALIZATION SEQUENCE

### 1. Module Configuration Loading

Load and read full config from `{project-root}/_bmad/bmb/config.yaml` and resolve:

- `output_folder`, `user_name`, `communication_language`, `document_output_language`, `bmb_creations_output_folder`

### 2. First Step EXECUTION

Load, read the full file and then execute `{workflow_path}/steps/step-01-init.md` to begin the workflow.
