---
title: "> 本文目标：教会你把 workflow 设计成“可被其它 workflow 调用的服务”，避免到处"
date: "2026-03-12"
tags: ["workflow","服务化设计","代码复用","自动化","开发工具"]
category: "Engineering"
readTime: "4 min read"
featured: false
image: "/blog/covers/2026-03-12-本文目标-教会你把-workflow-设计成-可被其它-workflow-调用的服务-避免到处.png"
excerpt: "本文介绍了如何将 workflow 设计成可被其他 workflow 调用的服务，以避免重复逻辑。核心方法是创建支持多模式（mode）的服务型 workflow，通过 `<invoke-workflow>` 和 `<param>` 进行参数传递与调用，并利用 `template-output` 返回结构化结果，从而实现逻辑的封装与复用。"
---

> 本文目标：教会你把 workflow 设计成“可被其它 workflow 调用的服务”，避免到处复制同一段逻辑。
>

核心结论：

+ **服务型 workflow** = 一个 workflow 同时提供“交互模式”和“服务模式（多 mode）”。
+ 通过 `<invoke-workflow>` + `<param>` 传参调用。
+ 通过 `template-output` 结构化返回值，把结果“塞回调用方上下文”。

---

## 1) `workflow-status` 在本仓库的定位
它的 workflow.yaml 定义是（`_bmad/bmm/workflows/workflow-status/workflow.yaml:1-30`）：

+ `name: workflow-status`
+ `description: ... answers "what should I do now?" ...`
+ `instructions: "{installed_path}/instructions.md"`（`workflow.yaml:18-20`）
+ `default_output_file: "{planning_artifacts}/bmm-workflow-status.yaml"`（`workflow.yaml:28-29`）

而它的 instructions 开头明确写了（`_bmad/bmm/workflows/workflow-status/instructions.md:5-6`）：

+ 这是一个 multi-mode service
+ 其它 workflow 可以把它当 service 调用，避免重复状态逻辑

---

## 2) 服务型 workflow 的核心设计：`mode` 路由
`workflow-status/instructions.md` 的 Step 0 用 `{{mode}}` 决定进入哪条分支（`instructions.md:11-34`）：

+ interactive（默认）→ Step 1
+ validate → Step 10
+ data → Step 20
+ init-check → Step 30
+ update → Step 40

这就是“服务化”的第一步：

> **把一个 workflow 拆成多条稳定子能力，并用 mode 做路由。**
>

---

## 3) 关键：服务模式如何传参（`<invoke-workflow>` + `<param>`）
本仓库给了非常清晰的调用示例：`document-project` workflow router 会调用 `workflow-status` 两次（`_bmad/bmm/workflows/document-project/instructions.md:13-42`）。

### 3.1 调用 data 模式获取项目配置
```xml
<invoke-workflow path="{project-root}/_bmad/bmm/workflows/workflow-status">
  <param>mode: data</param>
  <param>data_request: project_config</param>
</invoke-workflow>

```

见：`document-project/instructions.md:13-16`。

### 3.2 调用 validate 模式做“顺序/重复运行”校验
```xml
<invoke-workflow path="{project-root}/_bmad/bmm/workflows/workflow-status">
  <param>mode: validate</param>
  <param>calling_workflow: document-project</param>
</invoke-workflow>

```

见：`document-project/instructions.md:39-42`。

> 注意：这里的 `path` 并不是直接指向 workflow.yaml，而是指向 workflow 目录。执行引擎会按该 workflow 的约定加载 workflow.yaml（这一点在你们的目录组织里很常见）。
>

---

## 4) 关键：服务模式如何“返回值”（`template-output`）
服务模式不应该只靠自然语言解释；它应该返回可被调用方使用的结构化变量。

`workflow-status` 的 validate/data 等 service mode 会大量输出 `template-output`：

例如 validate mode，在找不到状态文件时返回（`workflow-status/instructions.md:199-208`）：

+ `status_exists = false`
+ `should_proceed = true`
+ `warning = ...`
+ `suggestion = ...`

当状态文件存在时，会返回更多关键字段（`workflow-status/instructions.md:216-257`）：

+ `project_level`
+ `project_type`
+ `field_type`
+ `next_workflow`
+ `status_file_path`
+ `should_proceed` / `warning` / `suggestion`

而调用方 `document-project` 立刻用这些返回值做判断：

+ `check if="status_exists == false"`（`document-project/instructions.md:18-23`）
+ `check if="warning != ''"`（`document-project/instructions.md:44-52`）

> 这就是“workflow 作为服务”的关键闭环：**调用方只依赖结构化返回值，而不是依赖模型自然语言。**
>

---

## 5) 交互模式 vs 服务模式：行为约束要不同
### 5.1 交互模式（interactive）
+ 需要展示状态、给出选项、让用户选下一步
+ `workflow-status` Step 3/4 就是典型交互流程（`instructions.md:86-193`）

### 5.2 服务模式（validate/data/init-check/update）
建议约束：

+ **尽量不 ask（或 ask 极少）**：避免把 service 调用变成“半路卡住”等待用户
+ **以 template-output 返回为主**：让调用方能继续自动化流程
+ **显式 Return/Exit**：在 service mode 结束时明确“return to calling workflow”（见 `workflow-status/instructions.md:260-261` 等）

---

## 6) 服务型 workflow 设计规范（建议团队约定）
1. **mode 路由必须集中在 Step 0**：别让 mode 判断散落在各 step。
2. **每个 mode 定义输入契约**：例如 data mode 需要 `data_request`（见 `document-project/instructions.md:14-16`）。
3. **每个 mode 定义输出契约**：至少输出 `success / error / warning / suggestion` 这类通用键。
4. **返回值一律用 template-output**：调用方不要 parse 自然语言。
5. **服务模式尽量避免副作用**：需要写文件时要么提供 update mode，要么显式告知调用方。

---

## 7) 什么时候该做“服务型 workflow”？
符合以下任意一条，就值得做成服务：

+ 多个 workflow 都需要同一段逻辑（例如状态文件读写、路径路由、上下文探测）
+ 逻辑含分支较多，复制粘贴容易出错
+ 需要提供可测试/可复用的“结果变量集合”

`workflow-status` 就是一个标准答案：它把“进度跟踪/路由/校验/更新”集中成一个可复用服务。

---

## 附：本文引用路径
+ `workflow-status` 配置：`_bmad/bmm/workflows/workflow-status/workflow.yaml`
+ `workflow-status` 多模式实现：`_bmad/bmm/workflows/workflow-status/instructions.md`
+ 调用示例：`_bmad/bmm/workflows/document-project/instructions.md:13-52`