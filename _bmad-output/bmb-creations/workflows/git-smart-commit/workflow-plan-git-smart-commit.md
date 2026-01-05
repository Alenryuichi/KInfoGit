---
stepsCompleted: [1, 2, 3, 4, 5, 6]
---

# Workflow Creation Plan: git-smart-commit

## Initial Project Context

- **Module:** bmm (BMAD Methodology - 软件开发方法论)
- **Target Location:** /Users/kylinmiao/Documents/project/KInfoGit/_bmad-output/bmb-creations/workflows/git-smart-commit
- **Created:** 2026-01-05

## 工作流目标

这个工作流将解决以下问题:
- 自动分析代码变更并生成高质量的 commit 消息
- 确保 commit 消息符合团队规范(Conventional Commits)
- 避免写出模糊或无意义的 commit 消息

## 使用者

- 个人开发者

## 工作流类型

智能 Git Commit 工作流

---

## 详细需求 (YOLO模式)

### 1. 工作流目的和范围
- **主要产出:** 自动生成并执行 git commit (包括 git add 和 git commit)
- **支持语言:** 中英文 commit 消息
- **使用场景:** 日常开发的每次 commit,支持多文件复杂变更

### 2. 工作流类型分类
- **类型:** Action Workflow (执行动作型) + Interactive Workflow (交互型)
- **流程:** 分析变更(自动) → 生成消息(自动) → 用户确认/编辑(交互) → 执行 commit(自动)

### 3. 工作流步骤结构
- **结构类型:** 线性流程,支持在确认环节循环
- **步骤:**
  1. 初始化 - 检查 git 状态
  2. 分析变更 - 读取 diff,识别变更类型
  3. 生成消息 - 使用 Conventional Commits 格式生成 3-5 个建议
  4. 用户确认 - 展示建议,允许选择/编辑/重新生成
  5. 执行 commit - 执行 git add + commit

### 4. 用户交互风格
- **互动级别:** 低互动 - 自动分析和生成,只在最终确认时需要用户输入
- **决策点:** 用户选择建议消息或自定义编辑

### 5. 指令风格
- **混合模式:** Intent-Based(意图导向) + Prescriptive(规定性)
  - 代码分析: Intent-Based (灵活判断)
  - Commit 格式: Prescriptive (严格遵循 Conventional Commits)

### 6. 输入需求
- **必需:**
  - 工作目录是 git 仓库
  - 有未提交的变更(staged 或 unstaged)
- **可选:**
  - 参考历史 commit 风格
  - 自定义 commit 模板

### 7. 输出规范
- **主要输出:**
  - 符合 Conventional Commits 的 commit 消息
  - 执行的 git commit 命令结果
- **中间输出:**
  - 变更分析摘要
  - commit 消息建议列表

### 8. 成功标准
- ✅ 生成的 commit 消息准确描述变更
- ✅ 符合 Conventional Commits 规范
- ✅ commit 成功执行
- ✅ 用户对生成的消息满意

---

## Tools Configuration (YOLO Auto-Configured)

### Core BMAD Tools
- **Party-Mode**: ❌ 不包含 - git commit 不需要多角色创意
- **Advanced Elicitation**: ❌ 不包含 - 流程相对简单直接
- **Brainstorming**: ❌ 不包含 - 不需要创意头脑风暴

### LLM Features
- **Web-Browsing**: ❌ 不包含 - 本地 git 操作
- **File I/O**: ✅ 包含 - 读取 git diff、分析代码变更、写入 commit 消息
- **Sub-Agents**: ❌ 不包含 - 流程足够简单
- **Sub-Processes**: ❌ 不包含 - 不需要并行处理

### Memory Systems
- **Sidecar File**: ✅ 包含
  - **Purpose**: 学习并记住用户的 commit 消息风格偏好
  - **Use Cases**:
    - 记住项目特定的 commit 规范
    - 学习用户喜欢的消息格式和表达方式
    - 追踪历史 commit 模式以提供更一致的建议

### External Integrations
- **Git Operations**: ✅ 使用 Bash 工具执行 git 命令
  - `git status`
  - `git diff`
  - `git add`
  - `git commit`
  - `git log` (参考历史风格)

### Installation Requirements
- **无需额外安装** - 所有功能使用内置工具
- **前置条件**: 系统已安装 git

---

## Workflow Structure Design (YOLO Auto-Designed)

### Step Structure (5-Step Linear with Loop)

**Step 01: step-01-init.md - 初始化检查**
- Goal: 检查 git 仓库状态,验证有未提交变更
- Input: 当前工作目录
- Output: Git 状态摘要
- Interaction: 自动执行

**Step 02: step-02-analyze.md - 分析变更**
- Goal: 读取 git diff,识别变更类型(feat/fix/docs/refactor/style/test/chore)
- Input: Git diff 数据
- Output: 变更分析报告(变更类型、影响文件、关键修改)
- Interaction: 自动执行

**Step 03: step-03-generate.md - 生成 Commit 消息**
- Goal: 基于 Conventional Commits 规范生成 3-5 个建议
- Input: 变更分析报告 + Sidecar 历史偏好
- Output: Commit 消息候选列表
- Interaction: 自动执行

**Step 04: step-04-confirm.md - 用户确认**
- Goal: 展示建议,让用户选择/编辑/重新生成
- Input: Commit 消息候选列表
- Output: 最终确认的 commit 消息
- Interaction: **关键交互点**
  - Menu Options:
    - `[1-5]` - 选择建议消息
    - `[E]` - 自定义编辑消息
    - `[R]` - 重新生成(返回 step-03)
    - `[C]` - 取消操作
- Loop Support: 支持返回 Step 03 重新生成

**Step 05: step-05-execute.md - 执行 Commit**
- Goal: 执行 git add + git commit
- Input: 最终 commit 消息
- Output: Commit 结果 + 更新 Sidecar 学习文件
- Interaction: 自动执行

### Continuation Support Decision
- **不包含 step-01b-continue.md**
- Reason: Git commit 是快速操作,通常单次会话完成(几分钟内)
- Alternative: 如果中断,用户可以重新运行工作流

### Interaction Patterns

**Autonomy Level:** 高度自动化,仅在关键决策点需要用户输入

**User Input Points:**
- Step 04 (Confirm): 唯一用户交互点

**Menu Integration:**
- 不集成 Advanced Elicitation 或 Party Mode (流程简单直接)

### Data Flow

```
Git Status Check (Step 01)
    ↓ 验证通过
Git Diff Analysis (Step 02) → 变更分析报告
    ↓
Generate Suggestions (Step 03) ← Sidecar 历史
    ↓
User Confirms (Step 04)
    ↓ 不满意        ↓ 满意
   (循环回 Step 03)  Execute Commit (Step 05)
                        ↓
                   更新 Sidecar 学习
```

**State Tracking:**
- 不使用 `stepsCompleted` (无文档输出)
- 使用 Sidecar 文件追踪用户 commit 风格偏好

### File Structure

```
git-smart-commit/
├── workflow.md                    # 主工作流配置
├── steps/
│   ├── step-01-init.md           # 初始化检查
│   ├── step-02-analyze.md        # 变更分析
│   ├── step-03-generate.md       # 生成建议
│   ├── step-04-confirm.md        # 用户确认(交互)
│   └── step-05-execute.md        # 执行 commit
└── .sidecar-git-smart-commit.md  # 学习记录文件
```

**No Templates Needed:** Conventional Commits 规范已明确

### Role and Persona

**AI Role:**
- Git Commit 专家 - 熟悉 Conventional Commits 规范
- 代码分析师 - 准确理解代码变更意图
- 协作助手 - 友好、高效、尊重用户选择

**Communication Style:**
- 简洁直接
- 技术准确
- 中文友好(支持中英双语)

**Tone:**
- 专业但不僵硬
- 提供建议但不强制
- 快速响应,减少等待

### Validation and Error Handling

**Validation Points:**
- Step 01: 验证是否是 git 仓库
- Step 01: 验证是否有未提交变更(staged 或 unstaged)
- Step 03: 验证生成的消息符合 Conventional Commits 格式
- Step 05: 验证 commit 执行成功

**Error Handling:**
- **非 Git 仓库:** 友好提示并退出工作流
- **无变更:** 提示没有需要 commit 的内容
- **Commit 失败:** 显示 git 错误信息,提供解决建议
- **用户取消:** 清晰退出,不执行任何 git 操作

### Special Features

**Conditional Logic:**
- Step 04: 根据用户选择路由
  - 选择建议(1-5) → Step 05
  - 自定义编辑(E) → Step 05 (使用编辑后的消息)
  - 重新生成(R) → 循环回 Step 03
  - 取消(C) → 退出工作流

**Sidecar Learning System:**
- 记录用户选择的 commit 类型偏好(feat vs fix vs docs)
- 学习用户喜欢的消息长度和表达方式
- 追踪项目特定的 commit 模式和术语
- 随时间提供越来越个性化的建议

**Conventional Commits Enforcement:**
- 严格遵循格式: `<type>(<scope>): <subject>`
- 支持的类型: feat, fix, docs, style, refactor, test, chore
- 自动建议合适的 scope
- 确保 subject 简洁(50字符以内)

### Design Review Summary

**Flow Validation:**
```
启动 → 检查(auto) → 分析(auto) → 生成建议(auto) →
用户确认(interactive) → 执行(auto) → 完成 ✓
       ↑________不满意可重新生成________↓
```

**Requirements Coverage:**
- ✅ 自动分析代码变更
- ✅ 生成高质量 commit 消息
- ✅ 符合 Conventional Commits 规范
- ✅ 避免模糊或无意义消息
- ✅ 支持中英文
- ✅ 处理多文件复杂变更
- ✅ 低互动设计
- ✅ 支持重新生成循环
