---
allowed-tools: Bash(git:*), Bash(cd:*)
argument-hint: [repository-path]
description: 对当前修改进行代码审查，给出改进建议
---

## Repository Path

Target repository: `$ARGUMENTS` (默认为当前工作目录)

## Context

- Current git status: !`cd $ARGUMENTS 2>/dev/null || true; git status`
- Current git diff (staged and unstaged changes): !`cd $ARGUMENTS 2>/dev/null || true; git diff HEAD`
- Repository info: !`cd $ARGUMENTS 2>/dev/null || true; git log --oneline -3`

## Your task

请对指定仓库（$ARGUMENTS，默认为当前目录）的代码修改进行详细的代码审查。检查上述 git diff 查看所有变更，分析代码质量、最佳实践、潜在问题和改进建议。

重点关注：
1. 代码风格和约定
2. 安全性问题
3. 性能影响
4. 测试覆盖
5. 文档更新需求

针对不同仓库类型给出专业建议：
- iOS (Swift): SwiftUI + Combine + SwiftData 最佳实践
- Go 后端: Gin + GORM + 安全性检查
- 通用: Git 提交质量、代码组织