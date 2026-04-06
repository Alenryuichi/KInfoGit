## 1. 创建 sync-yuque-work.ts 主脚本

- [x] 1.1 创建 `scripts/sync-yuque-work.ts` 基础结构：env 加载、类型定义、main 函数框架
- [x] 1.2 实现语雀 API client（`yuqueGet<T>()`、`getToc()`、`getDoc()`），复用 blog sync 模式
- [x] 1.3 实现 TOC 解析：一级 TITLE → section，DOC 节点按全局顺序 → order
- [x] 1.4 实现 sync state 加载/保存（`work-sync-state.json`），`updated_at` 增量判断
- [x] 1.5 实现 DeepSeek prompt（精简版：不含 section/order/featured），含 few-shot 示例和 JSON 解析 + retry
- [x] 1.6 实现 HTML 清理 + 图片下载（远程 URL → `website/public/work/images/`）
- [x] 1.7 实现输出：合并 `core-projects.json`（按 order 排序）+ 生成 `{id}.md`（frontmatter + 清理正文）
- [x] 1.8 实现 featured 逻辑：全局前 3 个 = featured，`--force` 参数支持

## 2. 清理旧文件

- [x] 2.1 删除 `tools/yuque-sync/elog.work.config.cjs`
- [x] 2.2 删除 `scripts/convert-to-work.ts`
- [x] 2.3 删除 `tools/yuque-sync/.work-sync-cache.json`（如果存在）

## 3. 更新 GitHub Actions Workflow

- [x] 3.1 重写 `.github/workflows/sync-yuque-work.yml`：去掉 elog 步骤，直接 `npx tsx scripts/sync-yuque-work.ts`
- [x] 3.2 环境变量改为 `YUQUE_TOKEN`/`YUQUE_LOGIN`/`YUQUE_WORK_REPO`/`DEEPSEEK_API_KEY`
- [x] 3.3 force_sync 时删除 `work-sync-state.json` 并传入 `--force` 参数

## 4. 本地验证

- [x] 4.1 本地运行 `sync-yuque-work.ts`，验证 TOC 解析 + 文档获取
- [x] 4.2 验证生成的 `core-projects.json` 与 Project interface 兼容
- [x] 4.3 验证增量模式：二次运行跳过未变更文档
- [x] 4.4 验证 `npx next build` 成功，Work 页面正常展示
