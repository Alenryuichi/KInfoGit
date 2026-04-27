# search-content-marking Specification

## Purpose
TBD - created by archiving change pagefind-search-upgrade. Update Purpose after archive.
## Requirements
### Requirement: Content body marking
各页面模板 SHALL 使用 `data-pagefind-body` 属性标记主内容区域，确保只有正文内容被索引。

#### Scenario: Blog post page
- **WHEN** Pagefind 索引 blog 详情页
- **THEN** 只有文章标题和正文被索引，header/footer/nav 不被索引

#### Scenario: AI Daily page
- **WHEN** Pagefind 索引 AI Daily 页面
- **THEN** 每日摘要的标题和内容被索引

#### Scenario: Project page
- **WHEN** Pagefind 索引 projects/work 页面
- **THEN** 项目描述和详情被索引

### Requirement: Exclude non-content elements
页面中的导航栏、页脚、侧边栏等非内容元素 SHALL NOT 被 Pagefind 索引。

#### Scenario: Navigation not indexed
- **WHEN** 用户搜索导航菜单中出现的通用词汇（如 "Blog"、"About"）
- **THEN** 搜索结果不会因为每个页面的导航栏都包含该词而返回所有页面

