---
title: "Agent Teams 实战方法论：从 Anthropic 16 个并行 Claude 编写 C 编译器学到的 7 个核心模式"
date: "2026-02-27"
tags: ["ai-agent", "automation", "parallel-computing", "anthropic", "workflow"]
category: "AI Engineering"
readTime: "12 min read"
featured: true
image: "/blog/agent-teams-practice.jpg"
excerpt: "Anthropic 用 16 个并行 Claude 实例编写了 10 万行 C 编译器。本文提炼出 7 个可立即实践的核心模式，帮你从'配对编程'升级到'自主团队'。"
---

# Agent Teams 实战方法论：从 Anthropic 实践学到的 7 个核心模式

> 在 AI 深度参与软件开发的时代，你的角色正在从"驾驶员"转变为"环境设计师"。

---

## 引言：一个疯狂的项目

2026 年 2 月，Anthropic 研究员 Nicholas Carlini 完成了一个看似不可能的任务：

**让 16 个 Claude 实例并行工作，从零编写一个 Rust 版 C 编译器，最终成功编译 Linux 6.9 内核。**

项目数据：
- **代码量**: 100,000 行 Rust 代码
- **成本**: ~$20,000 (近 2,000 次 Claude Code 会话)
- **时间**: 2 周
- **成果**: 可编译 Linux 6.9 (x86/ARM/RISC-V)，GCC torture test 99% 通过率

这个项目的价值不在于"16 个 Agent 写编译器"这个噱头，而在于**如何设计一个让 Agent 自主工作的系统**。

本文提炼出 7 个核心模式，你可以立即应用到自己的 Agent 项目中。

---

## 核心思想：从"配对编程"到"自主团队"

### 传统模式：人类主导

```
人类定义任务 → Agent 执行几分钟 → 人类给反馈 → 循环
```

**限制**：
- Agent 做完一个任务就停下来等你指令
- 人类需要持续在线监督
- 无法利用并行优势

### Agent Teams 模式：环境主导

```
人类设计环境 → Agent 团队自主推进数小时/数天 → 人类检查结果
```

**关键转变**：你的角色从"驾驶员"变成"环境设计师"

---

## 模式 1：自导向循环（Self-Direction Loop）

### 问题

Agent 执行完任务后不会自动继续，需要人类不断给新指令。

### 解决方案

创建无限循环 + 任务队列，让 Agent 自动 pick 下一个任务。

### 简化实现

```bash
#!/bin/bash
while true; do
  # 1. 读取当前任务列表
  # 2. 选择一个未锁定的任务
  # 3. 运行 Agent
  # 4. Agent 完成后自动进入下一轮
done
```

### 你的实践

1. **用 shell 脚本运行 Claude Code**
2. **任务列表用文本文件或 Git 管理**
3. **Agent 完成一个任务后自动 pick 下一个**

### 关键设计

Agent Prompt 应该包含：
- 问题描述和目标
- 任务拆分方法
- 进度追踪要求
- "持续工作直到完美"的指令

> "On this last point, Claude has no choice. The loop runs forever."

---

## 模式 2：测试驱动 Agent 进展

### 核心洞察

> **测试不是给人看的，是给 Agent 看的。**

### 传统测试 vs Agent 友好测试

**传统测试输出**：
```
Running test suite...
test_add ... FAILED
test_subtract ... PASSED
test_multiply ... PASSED
...
[1000 lines of output]
```

**Agent 友好测试输出**：
```
通过 99/100，失败：test_add
ERROR: test_add - expected 2, got 3
详情见：logs/test_add.log
```

### 最佳实践

| 实践 | 说明 |
|------|------|
| **错误单行格式** | `ERROR: 测试名 - 原因` (便于 grep) |
| **日志写文件** | 不污染 stdout，Agent 按需读取 |
| **预计算汇总** | "通过 99/100"，避免 Agent 重复计算 |
| **快速模式** | `--fast` 跑 10% 样本，5 分钟出结果 |

### 你的实践

```bash
# 测试脚本示例
if [ $FAILED -gt 0 ]; then
  echo "ERROR: $FAILED tests failed. See logs/ for details."
  # 详细日志写入文件，不打印到 stdout
fi
```

---

## 模式 3：任务锁定机制（Task Locking）

### 问题

多个 Agent 并行时，可能同时做同一件事，互相覆盖工作。

### 解决方案

用文件系统或 Git 实现简单的任务锁定。

### 目录结构

```
tasks/
├── todo/
│   ├── fix_parser.txt
│   └── add_codegen.txt
├── in_progress/
│   └── fix_parser.txt.agent1  # Agent1 锁定了这个任务
└── done/
    └── setup_project.txt
```

### Agent 工作流程

```bash
# 1. 找一个未锁定的任务
TASK=$(ls tasks/todo/ | head -1)

# 2. 锁定任务（移动文件）
mv tasks/todo/$TASK tasks/in_progress/$TASK.agent1

# 3. 开始工作
# ... Agent 执行任务 ...

# 4. 完成任务
mv tasks/in_progress/$TASK.agent1 tasks/done/$TASK
```

### 你的实践

- 用文件系统或 Git 分支做任务锁定
- 每个任务一个文本文件，记录任务描述
- Agent 通过移动文件来"claim"任务
- Git 同步防止冲突

---

## 模式 4：并行化策略

### 场景 A：多测试用例（简单）

每个 Agent 修一个 failing test，天然并行，无冲突。

### 场景 B：单一巨型任务（困难）

**问题**：所有 Agent 卡在同一个 bug 上，互相覆盖。

**Anthropic 的解决方案**：用"神谕"拆分任务

```
1. 准备一个"已知正确"的参照物（如 GCC 编译器）
2. 随机拆分任务（80% 文件用 GCC，20% 用你的编译器）
3. 如果编译成功 → 问题在 20% 里
4. 如果编译失败 → 问题在 80% 里
5. 二分法缩小范围，每个 Agent 修不同文件
```

### 你的实践

以调试为例：

```bash
# 用已知正确的版本作为"神谕"
GOLDEN_VERSION="v1.0"
CURRENT_VERSION="HEAD"

# 随机选择 50% 的测试用例用 GOLDEN 跑
# 另外 50% 用 CURRENT 跑
# 如果 GOLDEN 通过但 CURRENT 失败 → 问题在 CURRENT 的那 50%
```

---

## 模式 5：多 Agent 角色分工

### 单 Agent 模式 vs 多 Agent 模式

**单 Agent**：一个 Claude 做所有事（开发、测试、文档）

**多 Agent**：专门化角色，各司其职

### 角色定义

| 角色 | 职责 | 触发条件 |
|------|------|----------|
| **开发者** | 实现功能、修 bug | 默认角色 |
| **审查者** | 代码 review、提改进建议 | 每个 PR 后 |
| **测试员** | 写测试、跑 CI | 新功能完成后 |
| **文档员** | 更新 README、注释 | 代码变更后 |
| **优化师** | 性能优化、重构 | 功能稳定后 |

### 你的实践

```bash
# 不同角色的 Prompt 示例
# 开发者
"You are a developer. Implement the feature described in tasks/developer.txt"

# 审查者
"You are a code reviewer. Review the changes in src/ and suggest improvements."

# 测试员
"You are a QA engineer. Write tests for the new feature in src/feature.js"
```

**关键点**：
- 用不同的 prompt 定义角色
- 角色之间通过文件/文档通信
- 不需要"管理 Agent"，让角色自己决定何时行动

---

## 模式 6：上下文管理

### 问题

Agent 的上下文窗口有限，测试输出过多会"污染"上下文。

### 解决方案

| 问题 | 解决方案 |
|------|----------|
| **上下文污染** | 日志写入文件，不打印到 stdout |
| **信息过载** | 只打印关键汇总（如"通过 99/100"） |
| **错误定位困难** | 错误单行格式：`ERROR: 测试名 - 原因` |
| **进度丢失** | 定期让 Agent 写 `progress.md` 总结 |

### 你的实践

```bash
# 好的做法
echo "Build: 99/100 passed. Failed: test_add"
echo "ERROR: test_add - expected 2, got 3" >> logs/errors.log

# 不好的做法
echo "Running test_add..."
echo "  Input: 1 + 1"
echo "  Expected: 2"
echo "  Got: 3"
echo "  Stack trace: ..."
echo "  ..."  # 1000 行输出
```

---

## 模式 7：避免时间盲区

### 问题

Agent 无法感知时间，会花几小时跑测试而不推进。

### 解决方案

1. **不频繁打印进度** (避免污染上下文)
2. **提供 `--fast` 模式** 跑子样本
3. **设计测试让 Agent 能快速判断回归**

### 快速模式实现

```bash
# 默认跑 100% 测试
./run_tests.sh

# 快速模式跑 10% 样本
./run_tests.sh --fast  # 10% 随机样本

# 样本对每个 Agent 确定，跨 VM 随机
# 这样 Agent 仍能识别回归，但速度快 10 倍
```

### 你的实践

- 为耗时操作提供"快速模式"
- 用随机采样覆盖所有文件
- 让 Agent 自己选择模式（默认快速）

---

## 最小可行实现（MVP）

如果你今晚就想试试，这样做：

### 1. 创建项目结构

```bash
mkdir my-agent-team
cd my-agent-team
mkdir -p tasks/{todo,in_progress,done}
mkdir agent_logs
```

### 2. 写任务列表

```bash
# tasks/todo/setup.txt
任务：初始化项目
- 创建 package.json
- 安装依赖
- 写 Hello World

# tasks/todo/add_feature.txt
任务：添加 XX 功能
- 实现 A
- 实现 B
- 写测试
```

### 3. 运行脚本

```bash
#!/bin/bash
while true; do
  # 找一个未锁定的任务
  TASK=$(ls tasks/todo/ | head -1)
  if [ -z "$TASK" ]; then
    echo "所有任务完成！"
    break
  fi
  
  # 锁定任务
  mv tasks/todo/$TASK tasks/in_progress/$TASK.agent1
  
  # 运行 Agent
  claude -p "任务：$(cat tasks/in_progress/$TASK.agent1)"
  
  # 完成任务
  mv tasks/in_progress/$TASK.agent1 tasks/done/$TASK
done
```

### 4. 观察与改进

- 什么情况下 Agent 会卡住？
- 任务拆分是否合理？
- 测试输出是否清晰？

---

## 关键注意事项

### 1. 成本控制

| 策略 | 说明 |
|------|------|
| 快速模式 | 跑子样本，减少 API 调用 |
| 模型选择 | 小任务用便宜模型，大任务用 Opus |
| 任务拆分 | 小任务更容易控制成本 |

### 2. 避免无限循环

- 设置最大迭代次数
- 检测重复失败的任务
- 让 Agent 自己判断"是否卡住"

### 3. 错误恢复

- 保留所有 Agent 日志
- 用 Git 管理代码版本
- 出问题时回滚到上一个可用版本

---

## 项目局限性

Anthropic 的 C 编译器项目虽然成功，但也有局限：

- ❌ 缺少 16 位 x86 编译器（调用 GCC）
- ❌ 没有自己的汇编器和链接器
- ❌ 生成代码效率低（不如 GCC -O0）
- ❌ Rust 代码质量中等

> "The resulting compiler has nearly reached the limits of Opus's abilities."

这说明**Agent Teams 不是万能的**，它适合：
- ✅ 多测试用例并行修复
- ✅ 多子项目并行编译
- ⚠️ 单一巨型任务需要特殊并行化策略

---

## 结语：你的角色转变

Agent Teams 展示了一种新的可能性：

> **"不要教 Agent 怎么做，要设计让 Agent 能做对的环境。"**

**关键 Takeaways**：

1. **自导向循环** - 让 Agent 自动 pick 下一个任务
2. **测试驱动** - 测试是给 Agent 看的，不是给人看的
3. **任务锁定** - 用简单机制防止冲突
4. **并行化策略** - 用"神谕"拆分单一巨型任务
5. **角色分工** - 专门化角色提升效率
6. **上下文管理** - 日志写文件，错误单行格式
7. **避免时间盲区** - 提供快速模式

**下一步行动**：

1. 选一个小项目（如写个 CLI 工具）
2. 拆分成 5-10 个小任务
3. 搭建任务锁定系统
4. 运行 2-3 个 Agent 实例
5. 记录问题并改进

在 AI 时代，写好每一个 prompt，设计好每一个环境，就是在为未来的自己铺路。

---

## 参考资料

- [Building a C compiler with a team of parallel Claudes](https://www.anthropic.com/engineering/building-c-compiler) - Anthropic Engineering Blog
- [Claude Code](https://claude.ai/code) - Anthropic
- [Conventional Commits](https://www.conventionalcommits.org/) - 规范化 Commit 格式

---

**关于作者**: 反欺诈技术专家 & 全栈开发者，关注 AI Agent 在工程实践中的应用。

**欢迎讨论**: 你有使用 Agent Teams 的经验吗？在评论区分享你的实践！
