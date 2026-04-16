## Context

Spec Tracker 管道已运行，每日输出 `profile-data/specs/latest.json` + `history/YYYY-MM-DD.json`。每个快照包含 8 个 framework 的 GitHub stats + npm downloads + 10 个 discovered projects。现在需要在管道中增加 delta 计算和 AI 洞察生成。

现有模式可复用：
- `scripts/code-weekly/summarizer.ts` — DeepSeek API 调用模式（prompt → structured JSON response）
- `scripts/code-weekly/config.ts` — `DEEPSEEK_API_URL` / `DEEPSEEK_MODEL` 常量

## Goals / Non-Goals

**Goals:**
- 对比昨日快照，计算每个 framework 的 stars delta 和 npm downloads delta
- 计算 weekly diff（最大涨幅、新进/退出 discovered 项目）
- 调用 DeepSeek API 生成 2-3 段中文趋势分析文字
- Hero Cards 显示 ▲/▼ delta
- 新增 Trend Insights + Weekly Diff 两个 UI 区域

**Non-Goals:**
- 不改变采集频率（仍然每日一次）
- 不做多周对比（只对比 yesterday vs today）
- 不修改 discovery 搜索词（噪音问题单独处理）
- AI 摘要不需要完美——有 > 没有

## Decisions

### D1: Delta 计算时机
**选择**: 在 `fetch-spec-data.ts` 主流程中，采集完成后、写入前，读取昨日 history 文件计算 delta。

**理由**: 最简单。delta 是派生数据，跟原始数据在同一次管道中计算，保证一致性。

**替代**: 单独脚本计算 → 增加复杂度，没必要。

### D2: AI 摘要 API
**选择**: 复用 DeepSeek API（`DEEPSEEK_API_URL` + `DEEPSEEK_MODEL`），与 Code Weekly summarizer 相同模式。

**理由**: 已有 API key 和调用模式。摘要质量对 spec tracker 足够。

**Prompt 策略**: 输入 delta 数据 + 最近 release notes，要求输出 JSON `{ insights: string }` 包含 2-3 段中文分析。

### D3: 向后兼容
**选择**: `deltas` 和 `insights` 作为 optional 字段加入 SpecSnapshot。页面端 null-check 后条件渲染。

**理由**: 已有的 1 天 history 文件没有这些字段，不能 break。

### D4: Fallback 策略
**选择**: 如果 DeepSeek API 不可用或昨日快照不存在，`insights` 为 null，`deltas` 为空。页面隐藏对应区域。

**理由**: 管道不应因为 AI 摘要失败而整体失败。

## Risks / Trade-offs

- **[首日无 delta]** → 第一天运行时无昨日快照，delta 全部为 0。Mitigation: 页面隐藏 delta 为 0 的指标。
- **[DeepSeek API 不稳定]** → Mitigation: Promise.allSettled + fallback to null，管道仍正常输出数据。
- **[AI 摘要质量]** → 简短 prompt 可能生成泛泛而谈的内容。Mitigation: prompt 中强调给出具体数字和对比。
