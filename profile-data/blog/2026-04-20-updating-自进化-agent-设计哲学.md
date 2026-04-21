---
title: "Updating-自进化 Agent 设计哲学"
date: "2026-04-20"
tags: ["自进化Agent","AI系统设计","Agent框架对比","进化算法","人工智能"]
category: "AI"
categoryOrder: 1
subcategory: "Agent"
readTime: "6 min read"
featured: false
excerpt: "文章深入探讨了自进化Agent的设计哲学与实现框架。核心观点是，真正的自进化需要在受控搜索空间中，通过可靠评估函数驱动形成持续闭环优化；文章通过横向对比多个框架，清晰揭示了不同设计在进化单位、闭环程度和稳定性上的权衡；其提出的指标体系为评估和设计自进化系统提供了极具价值的参考框架，值得AI开发者深入思考。"
---

> 哲学归一：在受控搜索空间中，用可靠评估函数驱动的持续闭环优化
>

# 横向对比
**横向一句对比**：GenericAgent 是"经验落盘，用时查表"；Hermes 是"经验落盘 + 用时纠错 + 遗传筛选"，进化闭环更完整，但复杂度和自评偏差是新引入的风险。

| 框架 | 进化单位 | 进化层级 | 进化操作 | 选择机制 | 闭环程度 | 搜索策略 | 记忆/累积 | 稳定性 | 核心定位 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **GenericAgents** | prompt / skill | 参数级 | rewrite（人工/LLM） | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | ✅ 高 | 静态组件系统 |
| **Hermes** | skill + prompt | 功能级 | rewrite / 生成 / 组合 | 🔶 基于任务 success | 🔶 弱闭环 | greedy（局部） | 🔶 skill 可积累 | 🔶 中 | 函数级进化 |
| **AgentFactory** | agent（代码） | Agent级 | generate（生成） | ❌ 无 | ❌ 无 | ❌ 无 | ❌ 无 | 🔶 中 | Agent生成器 |
| **EvoAgentX** | workflow（graph） | 结构级 | mutation / crossover / 重组 | ✅ evolutionary selection | ✅ 强闭环 | evolutionary | 🔶 population | ❌ 低 | 系统级进化 |
| **Gödel Agent** | 自身代码 | 元级 | self-rewrite | 🔶 理论证明 | ❌ 实际不可用 | ❌ 无限空间 | ✅ 理论可累积 | ❌❌ 极低 | 理论自进化 |

## 指标说明
| 指标 | 定义（它在衡量什么） | 为什么重要（决定什么能力） | 典型取值/范围 | 风险 / 误区 |
| --- | --- | --- | --- | --- |
| **进化单位** | 系统中允许被修改的最小对象 | 决定“能进化出什么能力” | prompt / skill / agent / workflow / self-code | 单位太小 → 只能调参；太大 → 不可控 |
| **进化层级** | 修改发生在系统哪一层结构 | 决定能力上限（是否能产生新结构） | 参数级 / 功能级 / 结构级 / 元级 | 层级越高，调试难度指数级上升 |
| **进化操作** | 系统如何改变自身 | 决定搜索空间的“形状”和探索能力 | rewrite / mutate / crossover / 组合 / 删除 | 只有 rewrite → 极易陷入局部最优 |
| **选择机制** | 如何判断新版本是否更优 | 决定进化是否“朝正确方向” | rule-based / reward / ranking / RL | reward 不准 → 学坏（reward hacking） |
| **闭环程度** | 是否形成自动迭代循环 | 决定是否“持续进化” | 无 / 半闭环 / 全自动闭环 | 没闭环 → 永远不会真正进化 |
| **搜索策略** | 如何在可能解空间中探索 | 决定效率 vs 探索能力平衡 | greedy / random / evolutionary / bandit | 搜索太弱 → 卡死；太强 → 成本爆炸 |
| **记忆 / 累积** | 是否保留历史进化成果 | 决定是否“越用越强” | 无 / session / 长期知识库 | 没记忆 → 每次从零开始 |
| **稳定性** | 进化过程中性能是否可控 | 决定能否用于生产 | 高 / 中 / 低 | 进化导致退化（regression）或崩溃 |
| **核心定位** | 系统设计目标是什么 | 决定是否真的需要“进化” | 工具系统 / 优化系统 / 研究系统 | 把“生成”误当“进化” |

# self-evolving agent list
## GenericAgent（2026.04）
**GitHub**：[https://github.com/lsdefine/GenericAgent](https://github.com/lsdefine/GenericAgent)

**核心**：7 个原子工具 + 92 行 Agent Loop，以 `code_run` 为杠杆给任意 LLM 注入本地系统级执行能力。

**自进化哲学**：不预设技能，每次解决新任务后将执行路径固化为 Skill 写入记忆层，Agent 的能力边界随使用时长单调扩张——本质是把"试错过程"变成"持久化程序"，让经验在 session 之间不消散。

**优点**

+ 任务执行路径直接固化为 Skill，**经验复用成本趋零**——同类任务从"摸索"退化为"查表"
+ Skill 以文件形式落盘，**天然可读、可手动审查和修改**，不是黑盒

**缺点**

+ **Skill 以"首次成功"为准**，不是最优解，且没有后续迭代/评分机制
+ **环境漂移导致 Skill 腐化**：网页改版、API 变更后旧 Skill 静默失效，无版本管理和健康检查
+ **无冲突消解**：多条 Skill 覆盖同一意图时，召回哪条、谁覆盖谁，没有明确策略
+ **记忆层召回机制不透明**：Skill 树长大后靠什么匹配任务（语义？关键词？），README 未说明，准确率存疑
+ **进化是单向的**：只有"写入"，没有"遗忘"或"合并"，长期运行后 Skill 库会冗余膨胀

## Hermes（2026.02）
**GitHub**：[**https://github.com/nousresearch/hermes-agent**](https://github.com/nousresearch/hermes-agent)

**核心**：5+ 工具调用后自动生成 Skill 文档，FTS5 全文检索历史 session + Honcho 用户建模，构成一个闭合学习环。

**自进化哲学**：Skill 在使用中被动态 patch——不只是"首次固化"，而是"**用时发现过时/错误即更新**"，并通过 DSPy + GEPA（遗传-Pareto 提示进化）在实验分支上对 Skill 和 prompt 做评分筛选，试图让进化有方向而非随机沉淀。

**优点（自进化部分）**

+ Skill 有**运行时 patch 机制**：发现旧 Skill 失效时当场修正，不是静默腐化
+ **GEPA 引入评分维度**：多轮迭代 + Pareto 筛选，比"首次成功即固化"多一层质量保障

**缺点（自进化部分）**

+ **自评估偏差**：agent 几乎总是认为自己执行良好，反馈信号失真，GEPA 尚未解决此问题
+ **Skill 质量仍不稳定**：复杂上下文依赖任务的自动生成 Skill 经常抓不住要点，GEPA 目前仍是实验性的，未进生产主路径

### AgentFactory（2026.03，学术界）
**GitHub**：[github.com/zzatpku/AgentFactory](https://github.com/zzatpku/AgentFactory)

**核心**：Meta-Agent 将成功任务分解为子问题，每个子问题生成专属 Python 子 Agent 代码持久化落盘，后续同类任务直接复用或基于执行反馈迭代修改——存的是**可执行代码**，不是文本经验。

**自进化哲学**：**"经验即程序，而非笔记"**。文本反思无法保证复杂任务的稳定复现，把 Skill 存为标准化 Python 代码（带 SKILL.md 文档），让进化结果具备可执行性和可迁移性。

**优点（自进化部分）**

+ Subagent 基于**执行反馈**而非自我评估来触发修改，信号比"agent 觉得自己做得好"更可靠
+ 代码形式的 Skill 可跨系统导出，进化成果不被平台锁定

**缺点（自进化部分）**

+ Install 阶段从零构建子 Agent 的成本高，首次执行 token 消耗大
+ 子 Agent 之间无协调机制，库膨胀后召回和冲突问题同样存在

---

## EvoAgentX（2025.05，学术界）
**GitHub**：[github.com/EvoAgentX/EvoAgentX](https://github.com/EvoAgentX/EvoAgentX)

**核心**：对整条 Agentic Workflow（不只是单个 Skill）做自动化演化——用优化算法迭代 prompt、工具选择、子 Agent 拓扑，让 workflow 整体收敛到更优解。

**自进化哲学**：**进化的单位是工作流，不是单步技能**。单个 Skill 的优化是局部最优，EvoAgentX 把整个多 Agent 协作拓扑视为可优化对象，用类遗传算法在 workflow 空间搜索。

**优点（自进化部分）**

+ 进化目标是端到端 workflow 表现，避免局部 Skill 优化但整体流程仍低效的问题
+ 有明确的评分/筛选机制，进化方向可测量

**缺点（自进化部分）**

+ 学术框架，工程完整度低，生产落地几乎需要从头适配
+ 优化 workflow 拓扑的搜索空间极大，实际收敛速度和成本未见系统验证

---

## Gödel Agent（2024.10，学术界）
**GitHub**：[github.com/Arvid-pku/Godel_Agent](https://github.com/Arvid-pku/Godel_Agent)

**核心**：Agent 在运行时用 LLM 动态重写**自身的执行逻辑代码**，而不只是修改 Skill 或 prompt——进化对象是 Agent 自身的行为程序。

**自进化哲学**：**哥德尔机思想的 LLM 实现——自我指涉、递归自改**。不预设优化算法，只给高层目标，让 LLM 自己决定"改哪里、怎么改"，理论上没有固定边界。

**优点（自进化部分）**

+ 进化粒度最彻底：工具、推理链、决策逻辑全部可改，没有其他框架的"只能改 Skill"限制
+ 无需预定义优化算法，进化策略本身也可以被进化

**缺点（自进化部分）**

+ **安全边界几乎为零**：自改逻辑可能产生完全不可预期的行为，比 `code_run` 风险量级高一个数量级
+ 纯研究阶段，没有生产可用的工程实现；"自改成功"的验证机制尚未解决

---