# CLAUDE.md — AI 协作上下文

> 给 AI 编程助手看的项目入门文档。人类向导请看 @README.md。
> 本文件只写**项目画像 + 必知约定 + 入口指引**，细节全部用 `@path` 引用到权威文档，避免重复。

## 项目画像

KInfoGit = **个人站点** + **AI 内容聚合平台**。

- **站点**：Next.js 16 Pages Router + React 19 + TypeScript + Tailwind，SSG 纯静态导出到 GitHub Pages。
- **内容**：三个持续更新型板块（AI Daily / Code / Stars）+ 静态内容（简历 / 博客 / Work / Projects）。
- **数据流**：`scripts/*.ts`（cron + GitHub Actions）抓取 → `profile-data/**/*.json` 落盘 → `website/pages` SSG 渲染。

路线图与板块现状见 @ROADMAP.md。

## 仓库入口一览

```
website/            Next.js 站点源码（pages / components / lib / styles / public）
profile-data/       所有内容数据（JSON / Markdown），SSG 的数据源头
scripts/            数据抓取 + 周报生成（tsx 脚本 + just 任务定义）
openspec/           变更提案（changes/）+ 能力规格（specs/），**技术决策的单一来源**
docs/               面向人类的长文档（guides / archive / 架构图）
.claude/rules/      按文件类型自动加载的 AI 规范（Cursor / Claude Code 风格）
tools/              外部工具（yuque-sync / horizon 等）
tmp/                本地临时产物（已 gitignore）
```

详细结构与技术栈见 @README.md。

## 开发流程

全部走 `just` 入口，**不要直接跑 `npm run xxx` 在根目录**（package.json 几乎是空的，真正的 npm 脚本在 `website/package.json`）。

```bash
just                  # 列出所有命令
just setup            # 首次环境准备
just dev              # 启动 website dev server
just build            # 生成博客封面 + SSG 构建
just serve            # 本地预览 out/
just deploy "msg"     # 构建 + 推送到 GitHub Pages
```

任务定义见：
- @justfile — 顶层入口，import 下面四个模块
- @scripts/dev.just — dev / build / serve / clean
- @scripts/git.just — status / sync / deploy / branch
- @scripts/content.just — 博客 / 项目 / 简历内容管理
- @scripts/utils.just — stats / backup

## 测试与检查

在 `website/` 目录下跑：

```bash
npm run test          # vitest 单测
npm run lint          # ESLint（@website/eslint.config.mjs）
npm run type-check    # tsc --noEmit
npx playwright test   # E2E
```

## 代码规范（AI 协作强约束）

以下规则会按文件类型自动加载，**修改对应类型文件前必读**：

- @.claude/rules/nextjs.md — SSG / Pages Router / `unoptimized: true` 图片 / 路径前缀
- @.claude/rules/components.md — 函数组件 + TS + Tailwind 的组件约定
- @.claude/rules/code-style.md — 通用代码风格
- @.claude/rules/blog-content.md — 博客文章的 frontmatter / 目录 / 封面生成

## 提案与规格流程（openspec）

**任何非平凡的功能改动都走 openspec**：先写提案再改代码。

- 提案模板与目录：@openspec/changes/
- 已固化的能力规格：@openspec/specs/
- 配置：@openspec/config.yaml

原则（来自 @ROADMAP.md 的维护约定）：
- **openspec 是技术决策的单一来源**，README / ROADMAP / CLAUDE 都只做导航，不复制细节
- change 完成后迁移为 spec，changes 目录按时间保留历史
- ROADMAP 里用 ✅/🚧/📐/💡 标记状态，不删行

## 数据与内容

- **博客**：Markdown 放在 `profile-data/blog/`（**不是** `website/` 下），构建前自动生成封面
- **AI Daily**：`profile-data/ai-daily/YYYY-MM-DD.json`，每日 cron 产出，meta 见 `profile-data/ai-daily/_meta/`
- **Code 周报**：`profile-data/code-weekly/` + benchmark 历史在 `profile-data/benchmarks/`
- **Stars**：`profile-data/people-activity/` + `bluesky-posts/` + `youtube-videos/` + `weekly-digests/`
- **简历**：`profile-data/resume/*.json`（结构化，站点消费）+ `website/public/kylin-resume.pdf`（公开下载）

## 部署

GitHub Pages，`master` 分支推送后自动构建。详细清单与回滚见 @docs/guides/DEPLOYMENT_GUIDE.md。

## 易踩的坑

- 图片必须 `unoptimized: true`（GitHub Pages 无 Image Optimization Runtime）
- 博客文章源在 `profile-data/blog/`，**别去 `website/` 下找**
- `just build` 会先跑 `just generate-covers` 生成博客封面，跳过会导致列表页缺图
- 新增数据目录后记得更新 `.gitignore` 与相关 fetcher 的 glob
- `profile-data/ai-daily/*.bak.json` 是迁移脚本的备份，已 gitignore，不要手动创建

## 扩展文档

- @docs/index.md — 文档总目录
- @docs/project-overview.md — 项目总览（人类向）
- @docs/development-guide.md — 开发细节
- @docs/component-inventory.md — 组件清单
- @docs/archive/ — 历史阶段性文档（如 X_SIGNALS 迁移记录）

## 约束清单（给 AI 的 TL;DR）

1. 动手改代码前，先看对应的 `.claude/rules/*.md` 和相关 `openspec/specs/`
2. 非平凡改动走 openspec change 流程，不要直接改 spec
3. 构建命令走 `just`，不直接 `cd website && npm run ...`，除非测试/lint
4. 新增文档优先放 `docs/` 或 `openspec/`，**根目录只保留 README / ROADMAP / CLAUDE**
5. 数据文件改动要能被 `npm run type-check` + `just validate-json` 双通过
