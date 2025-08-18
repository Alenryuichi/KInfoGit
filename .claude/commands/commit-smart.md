---
allowed-tools: Bash
argument-hint: [repository-path]
description: 分析改动，生成合适的 commit message 并提交
---

## Repository Path

Target repository: `$ARGUMENTS` (默认为当前工作目录)

## Context

- Current git status: !`git -C "$ARGUMENTS" status 2>/dev/null || git status`
- Current git diff (staged and unstaged changes): !`git -C "$ARGUMENTS" diff HEAD 2>/dev/null || git diff HEAD`
- Current branch: !`git -C "$ARGUMENTS" branch --show-current 2>/dev/null || git branch --show-current`
- Recent commits: !`git -C "$ARGUMENTS" log --oneline -10 2>/dev/null || git log --oneline -10`

## Your task

请分析指定仓库（$ARGUMENTS，默认为当前目录）的代码改动，生成符合项目规范的 commit message 并提交。

步骤：
1. 切换到指定的仓库目录（如果提供了参数）
2. 分析上述变更的性质和影响范围
3. 根据约定式提交规范生成清晰的 commit message
4. 执行 git add 和 git commit

确保 commit message 准确反映变更内容和目的。