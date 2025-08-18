---
allowed-tools: Bash(pwd:*), Bash(git:*), Bash(ls:*), Bash(cd:*), Bash(echo:*)
argument-hint: [test-param]
description: 测试命令 - 显示当前项目状态和环境信息，支持参数测试
---

## Parameter Testing

Test parameter received: `$ARGUMENTS`

- Parameter validation: !`echo "Received parameter: $ARGUMENTS"`
- Current working directory: !`pwd`

## Context (Current Directory)

- Git status: !`git status --short`
- Project structure: !`ls -la`
- Recent commits: !`git log --oneline -5`

## Context (Target Directory - if parameter is a path)

- Target directory check: !`ls -la "$ARGUMENTS" 2>/dev/null || echo "Parameter is not a valid directory path"`

## Your task

你好！这是一个测试命令，用于验证参数传递机制的有效性。

**参数测试功能**：
- 接收参数：`$ARGUMENTS`
- 验证参数类型（无参数/目录/文件/字符串）
- 如果参数是目录路径，切换到该目录并显示信息
- 如果参数是普通文本，显示参数内容和长度

**使用示例**：
- `/hello` - 默认模式，显示当前目录信息
- `/hello ./BetaLine` - 测试目录参数
- `/hello test-string` - 测试字符串参数
- `/hello /path/to/file.txt` - 测试文件路径参数

基于上述信息，用简洁的方式展示项目状态和参数测试结果。