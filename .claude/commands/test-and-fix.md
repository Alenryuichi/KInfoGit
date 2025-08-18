---
allowed-tools: Bash(xcodebuild:*), Bash(go:*), Bash(git:*), Bash(cd:*)
argument-hint: [repository-path]
description: 运行测试，如果有失败自动尝试修复
---

## Repository Path

Target repository: `$ARGUMENTS` (默认为当前工作目录)

## Context

- Repository type detection: !`cd $ARGUMENTS 2>/dev/null || true; if [ -f "*.xcodeproj" ] || [ -f "Package.swift" ]; then echo "iOS/Swift"; elif [ -f "go.mod" ]; then echo "Go"; else echo "Unknown"; fi`
- Current status: !`cd $ARGUMENTS 2>/dev/null || true; git status --short`

## Your task

请运行指定仓库（$ARGUMENTS，默认为当前目录）的测试套件。如果有测试失败，分析失败原因并尝试修复。

根据项目类型执行：
- **iOS 项目**: 使用 `xcodebuild test` 或 `swift test`
- **Go 项目**: 使用 `go test ./...` 
- **其他项目**: 自动检测测试命令（npm test, pytest 等）

修复流程：
1. 切换到指定仓库目录
2. 运行测试套件
3. 如果有失败，分析错误日志
4. 尝试修复代码或配置
5. 重新运行测试验证修复结果