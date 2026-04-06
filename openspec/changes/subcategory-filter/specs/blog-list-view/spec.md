## MODIFIED Requirements

### Requirement: Theme tab filtering with four categories
The blog page SHALL display a tab bar above the post list. The first tab SHALL always be "全部" (showing all posts). The remaining tabs SHALL be dynamically generated from the unique `category` values present in the posts data, ordered by `categoryOrder` (ascending). Tabs that have posts with non-empty `subcategory` values SHALL display a `▾` indicator and support popover-based subcategory filtering. Selecting a tab SHALL filter the list to show only posts with matching `category`. The "全部" tab SHALL show all posts and reset any active subcategory filter.

#### Scenario: Default state shows all posts
- **WHEN** the blog page loads
- **THEN** the "全部" tab is active and all posts are displayed

#### Scenario: Tabs generated from post data
- **WHEN** posts have categories "文章" (order 0), "分享" (order 1), "随笔" (order 2)
- **THEN** tabs are displayed as: 全部, 文章, 分享, 随笔

#### Scenario: Tab with subcategories shows arrow
- **WHEN** the "文章" category has posts with subcategory values
- **THEN** the "文章" tab displays as "文章 ▾"

#### Scenario: Tab without subcategories has no arrow
- **WHEN** the "随笔" category has no posts with subcategory values
- **THEN** the "随笔" tab displays as "随笔" with no indicator

#### Scenario: Selecting a tab with subcategories
- **WHEN** the user clicks the "文章 ▾" tab
- **THEN** the tab becomes active, showing all "文章" posts, and the subcategory popover opens

#### Scenario: Selecting "全部" tab resets subcategory
- **WHEN** user has "文章 · AI ▾" active and clicks "全部"
- **THEN** subcategory filter is cleared and all posts are displayed

#### Scenario: Active tab has visual indicator
- **WHEN** a tab is selected
- **THEN** it has a sliding background indicator animated with framer-motion layoutId
