#!/bin/bash

# Git Worktree Manager
# Handles creating, listing, switching, and cleaning up Git worktrees
# KISS principle: Simple, interactive, opinionated

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get repo root
GIT_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_DIR="$GIT_ROOT/.worktrees"

# Get default branch (auto-detect from remote or fallback to main)
get_default_branch() {
  local default_branch
  # Try to get from remote HEAD
  default_branch=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@')
  if [[ -z "$default_branch" ]]; then
    # Fallback: check if main or master exists
    if git rev-parse --verify main &>/dev/null; then
      default_branch="main"
    elif git rev-parse --verify master &>/dev/null; then
      default_branch="master"
    else
      default_branch="main"  # Ultimate fallback
    fi
  fi
  echo "$default_branch"
}

# Validate branch name (security: prevent command injection)
validate_branch_name() {
  local name="$1"
  # Only allow alphanumeric, hyphen, underscore, forward slash
  if [[ ! "$name" =~ ^[a-zA-Z0-9_/-]+$ ]]; then
    echo -e "${RED}Error: Invalid branch name '$name'${NC}"
    echo "Branch names can only contain: letters, numbers, hyphens, underscores, and forward slashes"
    return 1
  fi
  # Prevent names starting with hyphen (could be interpreted as option)
  if [[ "$name" == -* ]]; then
    echo -e "${RED}Error: Branch name cannot start with a hyphen${NC}"
    return 1
  fi
  return 0
}

# Check if branch exists (local or remote)
branch_exists() {
  local branch="$1"
  git rev-parse --verify "$branch" &>/dev/null || \
  git rev-parse --verify "origin/$branch" &>/dev/null
}

# Check if worktree has uncommitted changes
has_uncommitted_changes() {
  local worktree_path="$1"
  local status
  status=$(git -C "$worktree_path" status --porcelain 2>/dev/null)
  [[ -n "$status" ]]
}

# Ensure .worktrees is in .gitignore
ensure_gitignore() {
  if ! grep -q "^\.worktrees$" "$GIT_ROOT/.gitignore" 2>/dev/null; then
    echo ".worktrees" >> "$GIT_ROOT/.gitignore"
  fi
}

# Copy .env files from main repo to worktree
copy_env_files() {
  local worktree_path="$1"

  echo -e "${BLUE}Copying environment files...${NC}"

  # Find all .env* files in root (excluding .env.example which should be in git)
  local env_files=()
  for f in "$GIT_ROOT"/.env*; do
    if [[ -f "$f" ]]; then
      local basename=$(basename "$f")
      # Skip .env.example (that's typically committed to git)
      if [[ "$basename" != ".env.example" ]]; then
        env_files+=("$basename")
      fi
    fi
  done

  if [[ ${#env_files[@]} -eq 0 ]]; then
    echo -e "  ${YELLOW}ℹ️  No .env files found in main repository${NC}"
    return
  fi

  local copied=0
  for env_file in "${env_files[@]}"; do
    local source="$GIT_ROOT/$env_file"
    local dest="$worktree_path/$env_file"

    if [[ -f "$dest" ]]; then
      echo -e "  ${YELLOW}⚠️  $env_file already exists, backing up to ${env_file}.backup${NC}"
      cp "$dest" "${dest}.backup"
    fi

    cp "$source" "$dest"
    echo -e "  ${GREEN}✓ Copied $env_file${NC}"
    copied=$((copied + 1))
  done

  echo -e "  ${GREEN}✓ Copied $copied environment file(s)${NC}"
}

# Create a new worktree
create_worktree() {
  local branch_name="$1"
  local default_branch
  default_branch=$(get_default_branch)
  local from_branch="${2:-$default_branch}"

  if [[ -z "$branch_name" ]]; then
    echo -e "${RED}Error: Branch name required${NC}"
    exit 1
  fi

  # [FIX #2] Validate branch name to prevent command injection
  if ! validate_branch_name "$branch_name"; then
    exit 1
  fi

  # [FIX #3] Check if base branch exists before proceeding
  if ! branch_exists "$from_branch"; then
    echo -e "${RED}Error: Base branch '$from_branch' does not exist${NC}"
    echo "Available branches:"
    git branch -a --format='%(refname:short)' | head -20
    exit 1
  fi

  local worktree_path="$WORKTREE_DIR/$branch_name"

  # Check if worktree already exists
  if [[ -d "$worktree_path" ]]; then
    echo -e "${YELLOW}Worktree already exists at: $worktree_path${NC}"
    echo -e "Switch to it instead? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
      switch_worktree "$branch_name"
    fi
    return
  fi

  # [FIX #6] Check if branch name already exists
  if git rev-parse --verify "$branch_name" &>/dev/null; then
    echo -e "${YELLOW}Warning: Branch '$branch_name' already exists${NC}"
    echo "Options:"
    echo "  1. Use existing branch (won't create new branch)"
    echo "  2. Cancel and choose a different name"
    echo -e "Use existing branch? (y/n)"
    read -r response
    if [[ "$response" != "y" ]]; then
      echo -e "${YELLOW}Cancelled${NC}"
      return
    fi
    # Use existing branch instead of creating new one
    local use_existing_branch=true
  fi

  echo -e "${BLUE}Creating worktree: $branch_name${NC}"
  echo "  From: $from_branch"
  echo "  Path: $worktree_path"
  echo ""
  echo "Proceed? (y/n)"
  read -r response

  if [[ "$response" != "y" ]]; then
    echo -e "${YELLOW}Cancelled${NC}"
    return
  fi

  # Update base branch
  echo -e "${BLUE}Updating $from_branch...${NC}"
  git checkout "$from_branch"
  git pull origin "$from_branch" || true

  # Create worktree
  mkdir -p "$WORKTREE_DIR"
  ensure_gitignore

  echo -e "${BLUE}Creating worktree...${NC}"
  if [[ "${use_existing_branch:-false}" == "true" ]]; then
    # Use existing branch
    git worktree add "$worktree_path" "$branch_name"
  else
    # Create new branch
    git worktree add -b "$branch_name" "$worktree_path" "$from_branch"
  fi

  # Copy environment files
  copy_env_files "$worktree_path"

  echo -e "${GREEN}✓ Worktree created successfully!${NC}"
  echo ""
  echo "To switch to this worktree:"
  echo -e "${BLUE}cd $worktree_path${NC}"
  echo ""
}

# List all worktrees
list_worktrees() {
  echo -e "${BLUE}Available worktrees:${NC}"
  echo ""

  if [[ ! -d "$WORKTREE_DIR" ]]; then
    echo -e "${YELLOW}No worktrees found${NC}"
    return
  fi

  local count=0
  for worktree_path in "$WORKTREE_DIR"/*; do
    if [[ -d "$worktree_path" && -e "$worktree_path/.git" ]]; then
      count=$((count + 1))
      local worktree_name=$(basename "$worktree_path")
      local branch=$(git -C "$worktree_path" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

      if [[ "$PWD" == "$worktree_path" ]]; then
        echo -e "${GREEN}✓ $worktree_name${NC} (current) → branch: $branch"
      else
        echo -e "  $worktree_name → branch: $branch"
      fi
    fi
  done

  if [[ $count -eq 0 ]]; then
    echo -e "${YELLOW}No worktrees found${NC}"
  else
    echo ""
    echo -e "${BLUE}Total: $count worktree(s)${NC}"
  fi

  echo ""
  echo -e "${BLUE}Main repository:${NC}"
  local main_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  echo "  Branch: $main_branch"
  echo "  Path: $GIT_ROOT"
}

# Switch to a worktree
# [FIX #1] Note: cd in a script doesn't affect the parent shell.
# This function outputs the path for the user to cd manually or use with eval.
switch_worktree() {
  local worktree_name="$1"

  if [[ -z "$worktree_name" ]]; then
    list_worktrees
    echo -e "${BLUE}Switch to which worktree? (enter name)${NC}"
    read -r worktree_name
  fi

  local worktree_path="$WORKTREE_DIR/$worktree_name"

  if [[ ! -d "$worktree_path" ]]; then
    echo -e "${RED}Error: Worktree not found: $worktree_name${NC}"
    echo ""
    list_worktrees
    exit 1
  fi

  echo -e "${GREEN}✓ Worktree found: $worktree_name${NC}"
  echo ""
  echo -e "${BLUE}To switch to this worktree, run:${NC}"
  echo ""
  echo -e "  cd $worktree_path"
  echo ""
  echo -e "${YELLOW}Tip: Copy the command above or use:${NC}"
  echo -e "  cd \$(bash $0 path $worktree_name)"
}

# Copy env files to an existing worktree (or current directory if in a worktree)
copy_env_to_worktree() {
  local worktree_name="$1"
  local worktree_path

  if [[ -z "$worktree_name" ]]; then
    # Check if we're currently in a worktree
    local current_dir=$(pwd)
    if [[ "$current_dir" == "$WORKTREE_DIR"/* ]]; then
      worktree_path="$current_dir"
      worktree_name=$(basename "$worktree_path")
      echo -e "${BLUE}Detected current worktree: $worktree_name${NC}"
    else
      echo -e "${YELLOW}Usage: worktree-manager.sh copy-env [worktree-name]${NC}"
      echo "Or run from within a worktree to copy to current directory"
      list_worktrees
      return 1
    fi
  else
    worktree_path="$WORKTREE_DIR/$worktree_name"

    if [[ ! -d "$worktree_path" ]]; then
      echo -e "${RED}Error: Worktree not found: $worktree_name${NC}"
      list_worktrees
      return 1
    fi
  fi

  copy_env_files "$worktree_path"
  echo ""
}

# Clean up completed worktrees
# [FIX #5] Check for uncommitted changes before removing
cleanup_worktrees() {
  if [[ ! -d "$WORKTREE_DIR" ]]; then
    echo -e "${YELLOW}No worktrees to clean up${NC}"
    return
  fi

  echo -e "${BLUE}Checking for completed worktrees...${NC}"
  echo ""

  local found=0
  local to_remove=()
  local with_changes=()

  for worktree_path in "$WORKTREE_DIR"/*; do
    if [[ -d "$worktree_path" && -e "$worktree_path/.git" ]]; then
      local worktree_name=$(basename "$worktree_path")

      # Skip if current worktree
      if [[ "$PWD" == "$worktree_path" ]]; then
        echo -e "${YELLOW}(skip) $worktree_name - currently active${NC}"
        continue
      fi

      found=$((found + 1))

      # [FIX #5] Check for uncommitted changes
      if has_uncommitted_changes "$worktree_path"; then
        with_changes+=("$worktree_path")
        echo -e "${RED}⚠ $worktree_name - HAS UNCOMMITTED CHANGES${NC}"
      else
        to_remove+=("$worktree_path")
        echo -e "${YELLOW}• $worktree_name${NC}"
      fi
    fi
  done

  if [[ $found -eq 0 ]]; then
    echo -e "${GREEN}No inactive worktrees to clean up${NC}"
    return
  fi

  # Warn about worktrees with uncommitted changes
  if [[ ${#with_changes[@]} -gt 0 ]]; then
    echo ""
    echo -e "${RED}⚠️  WARNING: ${#with_changes[@]} worktree(s) have uncommitted changes!${NC}"
    echo -e "${RED}   These will NOT be removed to prevent data loss.${NC}"
    echo ""
  fi

  if [[ ${#to_remove[@]} -eq 0 ]]; then
    echo -e "${YELLOW}No safe worktrees to remove (all have uncommitted changes)${NC}"
    echo ""
    echo "To force cleanup of worktrees with changes, commit or stash your work first."
    return
  fi

  echo ""
  echo -e "Remove ${#to_remove[@]} clean worktree(s)? (y/n)"
  read -r response

  if [[ "$response" != "y" ]]; then
    echo -e "${YELLOW}Cleanup cancelled${NC}"
    return
  fi

  echo -e "${BLUE}Cleaning up worktrees...${NC}"
  for worktree_path in "${to_remove[@]}"; do
    local worktree_name=$(basename "$worktree_path")
    git worktree remove "$worktree_path" 2>/dev/null || true
    echo -e "${GREEN}✓ Removed: $worktree_name${NC}"
  done

  # Clean up empty directory if nothing left
  if [[ -z "$(ls -A "$WORKTREE_DIR" 2>/dev/null)" ]]; then
    rmdir "$WORKTREE_DIR" 2>/dev/null || true
  fi

  echo -e "${GREEN}Cleanup complete!${NC}"
}

# Get worktree path (for scripting/cd usage)
get_worktree_path() {
  local worktree_name="$1"
  if [[ -z "$worktree_name" ]]; then
    echo "Error: worktree name required" >&2
    exit 1
  fi
  local worktree_path="$WORKTREE_DIR/$worktree_name"
  if [[ ! -d "$worktree_path" ]]; then
    echo "Error: worktree not found: $worktree_name" >&2
    exit 1
  fi
  # Output only the path (for use with cd $(...))
  echo "$worktree_path"
}

# Main command handler
main() {
  local command="${1:-list}"

  case "$command" in
    create)
      create_worktree "$2" "$3"
      ;;
    list|ls)
      list_worktrees
      ;;
    switch|go)
      switch_worktree "$2"
      ;;
    path)
      get_worktree_path "$2"
      ;;
    copy-env|env)
      copy_env_to_worktree "$2"
      ;;
    cleanup|clean)
      cleanup_worktrees
      ;;
    help)
      show_help
      ;;
    *)
      echo -e "${RED}Unknown command: $command${NC}"
      echo ""
      show_help
      exit 1
      ;;
  esac
}

show_help() {
  local default_branch
  default_branch=$(get_default_branch)

  cat << EOF
Git Worktree Manager

Usage: worktree-manager.sh <command> [options]

Commands:
  create <branch-name> [from-branch]  Create new worktree (copies .env files automatically)
                                      (from-branch defaults to '$default_branch')
  list | ls                           List all worktrees
  switch | go [name]                  Show path to worktree (scripts can't change parent dir)
  path <name>                         Get worktree path (for scripting: cd \$(... path name))
  copy-env | env [name]               Copy .env files from main repo to worktree
                                      (if name omitted, uses current worktree)
  cleanup | clean                     Clean up inactive worktrees (protects uncommitted work)
  help                                Show this help message

Environment Files:
  - Automatically copies .env, .env.local, .env.test, etc. on create
  - Skips .env.example (should be in git)
  - Creates .backup files if destination already exists
  - Use 'copy-env' to refresh env files after main repo changes

Safety Features:
  - Branch name validation (prevents command injection)
  - Base branch existence check before create
  - Uncommitted changes protection during cleanup
  - Auto-detection of default branch (main/master)

Examples:
  worktree-manager.sh create feature-login
  worktree-manager.sh create feature-auth develop
  worktree-manager.sh switch feature-login
  cd \$(worktree-manager.sh path feature-login)  # Actually change directory
  worktree-manager.sh copy-env feature-login
  worktree-manager.sh copy-env                   # copies to current worktree
  worktree-manager.sh cleanup
  worktree-manager.sh list

EOF
}

# Run
main "$@"
