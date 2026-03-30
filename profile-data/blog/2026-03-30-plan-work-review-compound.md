---
title: "#### Plan → Work → Review → Compound"
date: "2026-03-30"
tags: ["AI辅助开发","工程流程","知识管理","自动化工具","团队协作"]
category: "Engineering"
readTime: "3 min read"
featured: false
image: "/blog/covers/2026-03-30-plan-work-review-compound.png"
excerpt: "本文介绍了Compound Engineering Plugin如何通过Plan→Work→Review→Compound的闭环工作流，将AI从被动工具转变为能够从经验中持续学习的开发伙伴。系统通过多代理并行规划、执行、审查，并核心强调知识沉淀机制，将常见问题、解决方案和最佳实践结构化记录，实现团队知识的复合增长和开发效率的复利提升。"
---

#### Plan → Work → Review → Compound
> 来源：claude-code 和 every 团队的时间交流
>
> **Compound Engineering Plugin** 中得到了系统化实现——这是一个包含 27 个 Agent、19 个 Command、13 个 Skill 的完整 AI 辅助开发工具包。
>
> [https://github.com/EveryInc/compound-engineering-plugin](https://github.com/EveryInc/compound-engineering-plugin)
>

Compound Engineering Plugin 设计了一个闭环的工作流循环：

```javascript
Plan ──────→ Work ──────→ Review ──────→ Compound
详细规划     执行工作     质量检查       知识沉淀
   ↑                                       │
   └───────────────────────────────────────┘
            知识复合：下次规划更精准
```

+ **Plan**：多代理并行研究仓库模式、最佳实践、框架文档，输出结构化计划
+ **Work**：系统性执行计划，边做边测，质量内建
+ **Review**：多代理并行审查（安全、性能、架构等），输出分级 Todo
+ **Compound**：这是复合工程的核心——将解决的问题结构化记录，形成团队知识资产

#### 实现机制：知识复合的典型场景
实现复合工程的关键，在于建立系统化的知识沉淀机制。以下是几个典型场景：

**场景 1：Agent 重复犯同类错误**

```plain
触发：发现 Agent 在某类问题上反复出错
沉淀：将教训写入 AGENTS.md / CLAUDE.md / 系统提示词
效果：该类错误不再发生，无需人工提醒
```

**场景 2：某类问题需要频繁人工检查**

```plain
触发：Code Review 时反复指出同类问题
沉淀：创建 Lint 规则 / Pre-commit Hook / CI 检查
效果：问题在提交前自动拦截，减少人工负担
```

**场景 3：复杂流程被多次执行**

```plain
触发：某个多步骤操作被团队重复执行
沉淀：封装为 Skill / Command / Agent
效果：一键触发标准化流程，新人也能执行专家级操作
```

**场景 4：解决了一个有价值的问题**

```plain
触发：花了较长时间解决某个棘手问题
沉淀：结构化记录到 context/experience/ 目录
效果：下次遇到类似问题，Agent 自动加载相关经验
```

这些场景的共同特点是：**在问题解决的当下立即沉淀**，而不是事后补文档。

#### Claude 团队的复合工程应用案例
以下是 Every 团队和 Anthropic 内部使用复合工程的真实案例：

**案例 1："@claude，把这个加到 claude.md 里"**

当有人在 PR 里犯错，团队会说："@claude，把这个加到 claude.md 里，下次就不会再犯了。"或者："@claude，给这个写个测试，确保不会回归。"通过这种方式，错误转化为系统的免疫能力。

**案例 2：100% AI 生成的测试和 Lint 规则**

Claude Code 内部几乎 100% 的测试都是 Claude 写的。坏的测试不会被提交，好的测试留下来。Lint 规则也是 100% Claude 写的，每次有新规则需要，直接在 PR 里说一句："@claude，写个 lint 规则。"

**案例 3：十年未写代码的经理**

经理 Fiona 十年没写代码了，加入团队第一天就开始提交 PR。不是因为她重新学会了编程，而是因为 Claude Code 里积累了所有团队的实践经验——系统"记得"怎么写代码。

**案例 4：内置记忆系统**

把每次实现功能的过程——计划怎么制定的、哪些部分需要修改、测试时发现了什么问题、哪些地方容易遗漏——全部记录下来，编码回所有的 prompts、sub-agents、slash commands。这样下次别人做类似功能时，系统会自动提醒："注意，上次这里有个坑。"

#### 成果：一个自我进化的开发伙伴
这一范式带来的最终效果是惊人的。它将 AI 从一个被动执行命令的工具，转变为一个能够从经验中持续学习、并让整个开发流程效率不断"复利"增长的开发伙伴。