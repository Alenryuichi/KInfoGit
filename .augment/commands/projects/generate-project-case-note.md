---
description: 'Generate or update a project case-notes Markdown file from source-docs using the case-notes template.'
argument-hint: '{project-id}'
---

IT IS CRITICAL THAT YOU FOLLOW THIS COMMAND EXACTLY.

This command generates a single project case study file under:

- `profile-data/projects/case-notes/{project-id}.md`

using ALL raw materials from:

- `profile-data/projects/source-docs/{project-id}/`

and the template at:

- `profile-data/projects/case-notes/_template.md`

Follow these steps:

1. **Resolve `PROJECT_ID`**
   - Let `PROJECT_ID` be the single argument provided to this command (for example: `portrait-platform`).

2. **Load all source documents for this project**
   - Construct the source directory path:
     - `profile-data/projects/source-docs/{PROJECT_ID}/`
   - Read **all files** in this directory (and optionally subdirectories, if present).
   - Treat them as the complete context about this project: PRDs,设计说明,复盘、会议纪要等。

3. **Load the case-notes template**
   - Open `profile-data/projects/case-notes/_template.md`.
   - Use its headings和提问作为输出结构骨架，不要改变大标题结构，除非有充分理由。

4. **Synthesize a concise, interview-friendly case study**
   - 基于所有 source-docs，总结出一份面向 HR / 面试官的项目说明：
     - 聚焦：项目背景与目标 / 你的角色与团队 / 关键方案与设计 / 结果与影响 / 个人反思。
     - 适度讲故事，但保持清晰、结构化，避免流水账。
     - 尽量提取**可量化的指标**和**关键决策**，而不是只罗列任务。
   - 当不同文档之间有冲突时：
     - 优先选择时间更新的、或更详细、更可信的一版；必要时在总结中做轻微模糊化处理（例如使用范围值或相对提升）。

5. **生成目标文件内容**
   - 以模板为结构，填充各个 section：
     - `## 1. 项目背景与目标`
     - `## 2. 你的角色与团队`
     - `## 3. 关键方案 / 设计`
     - `## 4. 结果与影响`
     - `## 5. 个人反思 / 收获（可选）`
   - 内容语言可以使用中文，风格偏口语化但专业、清晰，适合放在个人项目网站上。

6. **写入 / 更新 case-notes 文件**
   - 目标文件路径：
     - `profile-data/projects/case-notes/{PROJECT_ID}.md`
   - 如果该文件**不存在**：
     - 创建新文件，内容为你刚刚生成的完整 Markdown。
   - 如果该文件**已存在**：
     - 在充分阅读现有内容后，可以整体重写，也可以只在原有基础上梳理和改进；
     - 保留对用户有价值的细节，但避免重复和矛盾。

7. **输出方式（按照你所处环境的约定）**
   - 如果当前环境要求通过“补丁”编辑文件：
     - 请输出一个清晰的补丁 / 编辑指令，用于创建或覆盖 `profile-data/projects/case-notes/{PROJECT_ID}.md`。
   - 如果当前环境支持直接写入文件：
     - 直接将最终 Markdown 写入上述路径。

目标：执行完本 command 后，`profile-data/projects/case-notes/{PROJECT_ID}.md` 应该是一份**可以直接用来渲染 `/work/{PROJECT_ID}` 项目详情页的完整 case study**。
