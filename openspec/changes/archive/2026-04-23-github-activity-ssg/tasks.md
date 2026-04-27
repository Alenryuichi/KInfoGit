## 1. 修改数据获取

- [x] 1.1 在 `about.tsx` 的 `getStaticProps` 中添加 GitHub GraphQL 查询，获取 `contributionsCollection.contributionCalendar`
- [x] 1.2 实现数据转换：`weeks[].contributionDays[]` → `Activity[]`（date, count, level），level 按 count 分 5 档
- [x] 1.3 无 `GITHUB_TOKEN` 或请求失败时传空数组，打印警告，不阻断构建

## 2. 修改组件

- [x] 2.1 `GitHubActivity` 新增 `contributionData` prop（`Activity[]`）
- [x] 2.2 替换 `react-github-calendar` 的 `GitHubCalendar` 为 `react-activity-calendar` 的 `ActivityCalendar`，传入 `contributionData`
- [x] 2.3 `contributionData` 为空时隐藏 calendar 区域
- [x] 2.4 移除 `CalendarErrorBoundary`（不再需要运行时错误处理）和 `dynamic import`

## 3. 依赖管理

- [x] 3.1 `npm uninstall react-github-calendar && npm install react-activity-calendar`
- [x] 3.2 确认 `react-activity-calendar` 版本与现有主题配置兼容

## 4. 验证

- [x] 4.1 本地 `GITHUB_TOKEN` 设置后运行 `next build`，验证 contribution calendar 正常渲染
- [x] 4.2 不设 `GITHUB_TOKEN` 时构建成功，calendar 区域隐藏
