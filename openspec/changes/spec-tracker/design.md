## Context

Code Weekly 已有完整的 editors + benchmarks 追踪管道（12 个数据源，每日/每周 GitHub Action），以及 benchmarks 独立页面（`/code/benchmarks/`）。现在需要新增一个结构相似但完全独立的管道追踪 AI Coding Spec 生态。

现有架构模式可复用：
- `scripts/code-weekly/sources/*.ts` → fetch 函数模式
- `profile-data/benchmarks/{latest.json, history/}` → 快照存储模式
- `website/lib/code-weekly.ts` → SSG 数据读取模式
- `website/components/code-weekly/charts/` → SVG 可视化组件模式
- `website/pages/code/benchmarks.tsx` → 独立页面 + getStaticProps 模式

## Goals / Non-Goals

**Goals:**
- 每日自动采集 8 个固定 spec 框架的 GitHub stats + npm downloads + changelog
- 每日自动探索新兴 spec 项目（GitHub Search + npm search）
- 独立页面 `/code/specs/` 展示 6 个区域：Hero Cards、Stars 趋势、npm 下载量、对比表、Recent Activity、Emerging
- 历史快照支持趋势图（stars/downloads 折线图）
- 零耦合：不修改任何现有 Code Weekly 文件

**Non-Goals:**
- 不做 spec 框架的功能对比或评测
- 不抓取闭源项目的内部数据（Kiro/Tessl 只追踪公开博客和 npm）
- 不做推送通知（仅被动展示）
- 不自动将 discovered 项目加入固定追踪列表（需人工确认）

## Decisions

### D1: 独立管道 vs 共享 Code Weekly 管道
**选择**: 完全独立管道（scripts/spec-tracker/, profile-data/specs/, 独立 Action）

**理由**: 追踪频率相同（每日），但数据模型完全不同（GitHub stars/npm downloads vs Arena Elo/pass rate）。独立管道避免耦合，便于独立迭代。

**替代方案**: 集成到 fetch-code-weekly.ts → 拒绝，因为 spec 数据和编辑器更新语义不同，混在一起会让 summarizer prompt 更复杂。

### D2: GitHub API 使用策略
**选择**: 使用 REST API v3，每日请求量约 30-40 次（8 repos × 3-4 endpoints + discovery searches）

**理由**: 远低于 GITHUB_TOKEN 的 5000 req/hr 限制。GraphQL v4 可以减少请求数，但 REST 更简单、已有 github-releases.ts 可参考。

**端点列表**:
- `GET /repos/{owner}/{repo}` → stars, forks, open_issues, pushed_at
- `GET /repos/{owner}/{repo}/releases?per_page=3` → latest releases
- `GET /repos/{owner}/{repo}/stats/commit_activity` → weekly commits (需注意：首次请求可能 202)
- `GET /search/repositories?q=...&sort=stars` → discovery

### D3: npm Downloads API
**选择**: 使用 npm downloads API `https://api.npmjs.org/downloads/point/last-week/{pkg}`

**理由**: 简单、免费、无需 auth。只需周下载量数字，不需要逐日。

### D4: Discovery 机制
**选择**: GitHub Search API + npm search，每日运行但结果缓存 7 天

**搜索策略**:
```
GitHub: q="spec-driven" OR "ai-coding-spec" OR "agent-specification"
        language:typescript sort:stars
        → 过滤: stars>50, pushed_at>90天内, 不在固定列表中
npm:    keywords=spec-driven,ai-coding-spec
        → 过滤: weekly downloads>100
```

**输出**: discovered 项目只采集基本信息（name, stars, description, url），不做深度追踪。展示在页面 Emerging 区域。

### D5: 可视化复用策略
**选择**: 复用 OrgTrendChart 的 SVG 模式，但新建组件

**理由**: Stars 趋势图的结构和 Arms Race 几乎相同（多条折线 + 右侧标签），可以提取相同的 resolveOverlap 逻辑。但数据类型不同（Elo vs stars count），不应强行复用同一组件。

### D6: 闭源项目追踪
**选择**: Kiro 和 Tessl 只追踪公开可获取的数据

- Kiro: 无 GitHub repo，无 npm → 只在 FrameworkTable 中标注 "闭源 IDE"，changelog 来自 Tavily search
- Tessl: 有 `tessl` npm 包 → 追踪 npm downloads + version。无 GitHub repo → 标注 "closed beta"

## Risks / Trade-offs

- **[GitHub API 202 on commit_activity]** → 首次请求返回 202 (computing)，重试一次即可。Mitigation: 设置 1 次重试 + 3s 等待。
- **[Discovery 搜索噪音]** → "spec-driven" 等关键词可能匹配无关项目。Mitigation: 多条件过滤（stars>50 + recent push + TypeScript/JavaScript language）。
- **[npm 包名不确定]** → Spec-Kit 的 npm 包名可能不是 `specify-cli`。Mitigation: 脚本运行时如果 404 则优雅跳过，日志标记 warning。
- **[Stars 数据回填]** → 首次运行只有一天数据，趋势图空。Mitigation: 与 benchmarks 不同，GitHub API 没有历史 stars 端点。第一天只展示表格和 Hero Cards，趋势图在积累 7 天数据后自动出现。
