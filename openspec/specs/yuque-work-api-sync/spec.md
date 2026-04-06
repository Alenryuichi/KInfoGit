## ADDED Requirements

### Requirement: TOC-based section and order mapping
脚本 SHALL 调用语雀 TOC API 解析知识库目录结构，将一级目录（`type=TITLE, depth=1`）映射为 `section` 名称，将文档在 TOC 中的全局出现顺序映射为 `order`。

#### Scenario: 正常 TOC 解析
- **WHEN** 知识库 TOC 包含 "独立项目"（下有 2 个 DOC）和 "企业微信"（下有 3 个 DOC）
- **THEN** 前 2 个项目 section="独立项目" order=0,1；后 3 个项目 section="企业微信" order=2,3,4

#### Scenario: 文档不在任何一级目录下
- **WHEN** DOC 节点出现在任何 TITLE 节点之前
- **THEN** 该文档 section="未分类"，order 按出现顺序递增

### Requirement: API-based document fetching
脚本 SHALL 使用 `YUQUE_TOKEN` 通过语雀 REST API v2 获取文档内容，不依赖 elog。

#### Scenario: 正常获取文档
- **WHEN** 环境变量 `YUQUE_TOKEN`、`YUQUE_LOGIN`、`YUQUE_WORK_REPO` 已设置
- **THEN** 脚本通过 `GET /api/v2/repos/{login}/{repo}/docs/{slug}` 获取每个文档的 body 和 updated_at

#### Scenario: Token 未设置
- **WHEN** `YUQUE_TOKEN` 环境变量为空
- **THEN** 脚本 SHALL 输出错误信息并以 exit code 1 退出

### Requirement: Incremental sync via updated_at
脚本 SHALL 基于文档 `updated_at` 时间戳判断是否需要重新处理，避免不必要的 DeepSeek API 调用。

#### Scenario: 文档未变更
- **WHEN** 文档的 `updated_at` 与 `work-sync-state.json` 中记录一致
- **THEN** 跳过 DeepSeek 调用，复用上次提取的 Project 数据

#### Scenario: 文档已变更
- **WHEN** 文档的 `updated_at` 与缓存不一致或缓存中无记录
- **THEN** 重新调用 DeepSeek 提取结构化数据

#### Scenario: 强制同步
- **WHEN** 传入 `--force` 参数
- **THEN** 忽略所有缓存，全量重新处理

### Requirement: DeepSeek structured extraction
脚本 SHALL 调用 DeepSeek API 从自由文本中提取 Project interface 的语义字段（title 翻译、tech_stack、responsibilities、achievements、highlights、impact、category、description）。`section`、`order`、`featured`、`id`、`slug` 由脚本确定性赋值，不传给 LLM。

#### Scenario: 正常提取
- **WHEN** 向 DeepSeek 发送项目文档内容
- **THEN** 返回的 JSON 包含 title.en、tech_stack、responsibilities（zh+en）、achievements（zh+en）、highlights（zh+en）、impact、category、description（zh+en）

#### Scenario: DeepSeek 返回非法 JSON
- **WHEN** DeepSeek 响应无法解析为 JSON
- **THEN** 脚本 SHALL retry 一次；若仍失败则跳过该文档并记录错误

### Requirement: Output compatibility
脚本输出 SHALL 与现有 `Project` interface（`website/lib/data.ts`）完全兼容。

#### Scenario: JSON 输出
- **WHEN** 同步完成
- **THEN** 生成 `profile-data/projects/core-projects.json`，包含所有项目，按 order 升序排列

#### Scenario: Markdown 输出
- **WHEN** 同步完成
- **THEN** 为每个项目生成 `profile-data/projects/{id}.md`，包含 frontmatter（id 字段）和清理后的正文

### Requirement: Image downloading
脚本 SHALL 下载文档中的远程图片到本地，替换路径为相对路径。

#### Scenario: 正常图片下载
- **WHEN** 文档包含 `![alt](https://cdn.yuque.com/...)` 格式的图片
- **THEN** 图片下载到 `website/public/work/images/`，路径替换为 `/work/images/{slug}-{hash}{ext}`

#### Scenario: 图片下载失败
- **WHEN** 图片 URL 不可达
- **THEN** 保留原始 URL，打印警告，不中断同步流程

### Requirement: GitHub Actions workflow
`.github/workflows/sync-yuque-work.yml` SHALL 配置为每周一 UTC 01:00 自动运行 + 支持手动触发（含 force_sync 参数）。

#### Scenario: 定时触发
- **WHEN** 每周一 UTC 01:00
- **THEN** 运行 `npx tsx scripts/sync-yuque-work.ts`，有变更则 commit & push

#### Scenario: 手动强制同步
- **WHEN** workflow_dispatch 且 force_sync=true
- **THEN** 删除 `work-sync-state.json` 后运行脚本，传入 `--force` 参数
