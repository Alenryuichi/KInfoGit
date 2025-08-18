---
allowed-tools: Bash
argument-hint: [repository-path]
description: 分析当前分支改动，生成智能 PR 标题和描述并创建 PR
---

## Repository Path

Target repository: `$ARGUMENTS` (默认为当前工作目录)

## Context

- Current git status: !`git -C "$ARGUMENTS" status 2>/dev/null || git status`
- Current branch: !`git -C "$ARGUMENTS" branch --show-current 2>/dev/null || git branch --show-current`
- Remote tracking: !`git -C "$ARGUMENTS" branch -vv 2>/dev/null || git branch -vv`
- Changes since base branch: !`git -C "$ARGUMENTS" diff master...HEAD --stat 2>/dev/null || git diff master...HEAD --stat`
- Commit history for this branch: !`git -C "$ARGUMENTS" log master..HEAD --oneline 2>/dev/null || git log master..HEAD --oneline`
- Recent commits with details: !`git -C "$ARGUMENTS" log master..HEAD --pretty=format:"%h %s%n%b" -5 2>/dev/null || git log master..HEAD --pretty=format:"%h %s%n%b" -5`

## Your task

请分析指定仓库（$ARGUMENTS，默认为当前目录）的当前分支改动，生成合适的 PR 标题和描述，并创建 Pull Request。

步骤：
1. 切换到指定的仓库目录（如果提供了参数）
2. 分析当前分支相对于 master 分支的所有变更
3. 根据提交历史和代码差异生成：
   - 清晰的 PR 标题（遵循约定式提交格式）
   - 结构化的 PR 描述，包含：
     - ## Summary（变更摘要）
     - ## Changes（具体改动列表）  
     - ## Test Plan（测试计划）
     - ## Notes（注意事项，如果有）
4. 检查远程分支状态，必要时推送当前分支
5. 使用 `gh pr create` 创建 PR

注意：
- 如果当前分支已经有对应的 PR，提示用户
- 确保分析所有相关的提交和文件变更
- PR 描述要具体且有实用价值
- 适配 BetaLine iOS 和 BoulderScienceGo 后端项目的特点