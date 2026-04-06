## MODIFIED Requirements

### Requirement: Theme tab filtering with four categories
The blog page SHALL display a tab bar above the post list. The first tab SHALL always be "全部" (showing all posts). The remaining tabs SHALL be dynamically generated from the unique `category` values present in the posts data, ordered by `categoryOrder` (ascending). Selecting a tab SHALL filter the list to show only posts with matching `category`. The "全部" tab SHALL show all posts.

#### Scenario: Default state shows all posts
- **WHEN** the blog page loads
- **THEN** the "全部" tab is active and all posts are displayed

#### Scenario: Tabs generated from post data
- **WHEN** posts have categories "文章" (order 0), "分享" (order 1), "随笔" (order 2)
- **THEN** tabs are displayed as: 全部, 文章, 分享, 随笔

#### Scenario: New category appears
- **WHEN** a new category "读书笔记" (order 3) appears in post data
- **THEN** a new tab "读书笔记" automatically appears after existing tabs

#### Scenario: Selecting a dynamic tab filters posts
- **WHEN** the user clicks the "文章" tab
- **THEN** only posts with `category === "文章"` are displayed, still grouped by year
- **AND** year sections with no matching posts are hidden

#### Scenario: Active tab has visual indicator
- **WHEN** a tab is selected
- **THEN** it has a sliding background indicator animated with framer-motion layoutId

## REMOVED Requirements

### Requirement: Category mapping from existing data
**Reason**: Category is now directly set from Yuque TOC directory names during sync. No mapping needed — `category` field in frontmatter already matches the tab label exactly.
**Migration**: Remove `mapCategoryToTheme()` function and hardcoded `THEMES` array from `blog.tsx`.
