## ADDED Requirements

### Requirement: Page type filter metadata
每个可搜索页面 SHALL 通过 `data-pagefind-meta="type:<value>"` 声明页面类型。

#### Scenario: Blog pages have type meta
- **WHEN** Pagefind 索引 blog 详情页
- **THEN** 页面包含 `data-pagefind-meta="type:Blog"`

#### Scenario: Stars pages have type meta
- **WHEN** Pagefind 索引 Stars 详情页
- **THEN** 页面包含 `data-pagefind-meta="type:Stars"`

#### Scenario: AI Daily pages have type meta
- **WHEN** Pagefind 索引 AI Daily 详情页
- **THEN** 页面包含 `data-pagefind-meta="type:AI Daily"`

#### Scenario: Work pages have type meta
- **WHEN** Pagefind 索引 Work 详情页
- **THEN** 页面包含 `data-pagefind-meta="type:Work"`

### Requirement: Navigation noise exclusion
页面中的「上一篇/下一篇」导航区域 SHALL 使用 `data-pagefind-ignore` 排除索引。

#### Scenario: Prev/next links excluded
- **WHEN** Pagefind 索引 blog 详情页
- **THEN** 上一篇/下一篇导航中的文章标题不被索引

### Requirement: Date metadata
可搜索页面 SHALL 通过 `data-pagefind-meta` 声明日期信息，搜索结果可展示。

#### Scenario: Blog page has date meta
- **WHEN** Pagefind 索引 blog 详情页
- **THEN** 页面包含 `data-pagefind-meta="date:<YYYY-MM-DD>"`
