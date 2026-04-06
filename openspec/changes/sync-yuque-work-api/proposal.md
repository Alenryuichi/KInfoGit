## Why

当前 Work 同步基于 elog（账号密码认证 + 中间文件落盘），而 Blog 同步已升级为直接调用语雀 API（Token 认证 + 内存处理）。需要将 Work 同步对齐到相同架构，减少依赖、简化流程，并利用 TOC API 自动映射 section/order。

## What Changes

- 新建 `scripts/sync-yuque-work.ts`：单脚本完成语雀 Work 知识库 → 结构化 Project 数据的全流程
- **删除** `tools/yuque-sync/elog.work.config.cjs`（不再需要 elog）
- **重写** `scripts/convert-to-work.ts` → 合并到新的 sync 脚本中
- **重写** `.github/workflows/sync-yuque-work.yml`：去掉 elog 步骤，直接调用新脚本
- 认证方式从 `YUQUE_USERNAME/PASSWORD` 改为 `YUQUE_TOKEN`
- 利用语雀 TOC 一级目录名作为 `section`，TOC 出现顺序作为 `order`，不再由 LLM 猜测
- 增量判断从 content hash 改为 `updated_at` 时间戳（无需下载全文即可判断）

## Capabilities

### New Capabilities
- `yuque-work-api-sync`: 基于语雀 API 的 Work 项目同步，包括 TOC 解析、增量同步、DeepSeek 结构化提取、图片下载、JSON/Markdown 输出

### Modified Capabilities

## Impact

- `scripts/sync-yuque-work.ts`（新建）
- `scripts/convert-to-work.ts`（删除）
- `tools/yuque-sync/elog.work.config.cjs`（删除）
- `.github/workflows/sync-yuque-work.yml`（重写）
- GitHub Secrets：新增 `YUQUE_WORK_REPO`，复用 `YUQUE_TOKEN`/`YUQUE_LOGIN`/`DEEPSEEK_API_KEY`
- `profile-data/projects/core-projects.json` + `{id}.md`（输出目标不变）
