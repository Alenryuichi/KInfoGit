## ADDED Requirements

### Requirement: Search result type labels
搜索结果 SHALL 显示来源分类标签（Blog / Stars / AI Daily / Work / About），从 Pagefind meta 的 `type` 字段读取。

#### Scenario: Blog result shows label
- **WHEN** 搜索返回一篇 blog 文章
- **THEN** 结果条目右侧显示 "Blog" 标签

#### Scenario: Stars result shows label
- **WHEN** 搜索返回 Stars 页面
- **THEN** 结果条目右侧显示 "Stars" 标签

### Requirement: Keyboard navigation
搜索 modal SHALL 支持 ↑↓ 箭头键在结果列表中导航，Enter 跳转到选中结果。

#### Scenario: Arrow down selects next result
- **WHEN** 搜索有结果且用户按 ↓
- **THEN** 下一个结果高亮，滚动可见

#### Scenario: Enter navigates to selected
- **WHEN** 有结果被 ↑↓ 选中且用户按 Enter
- **THEN** 页面跳转到选中结果的 URL，modal 关闭

#### Scenario: No selection defaults to first
- **WHEN** 用户未用 ↑↓ 选择直接按 Enter
- **THEN** 跳转到第一个结果

### Requirement: Search history
系统 SHALL 在 localStorage 中保存最近 5 条搜索词，打开搜索 modal 时显示。

#### Scenario: Save search on navigate
- **WHEN** 用户点击或 Enter 选择一个搜索结果
- **THEN** 当前搜索词被保存到历史（去重，最新在前）

#### Scenario: Show history on open
- **WHEN** 用户打开搜索 modal 且输入框为空
- **THEN** 显示最近搜索历史列表，点击可直接搜索

#### Scenario: localStorage unavailable
- **WHEN** localStorage 不可用（隐私模式等）
- **THEN** 搜索历史功能静默降级，不显示历史

### Requirement: Empty state guidance
搜索 modal 在未输入时 SHALL 显示引导内容而非空白。

#### Scenario: No input shows guidance
- **WHEN** 搜索 modal 打开且输入框为空且无搜索历史
- **THEN** 显示提示文字（如 "搜索博客、项目、Stars..."）和快捷键提示
