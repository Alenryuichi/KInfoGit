## ADDED Requirements

### Requirement: Popover appears on tabs with subcategories
When a tab has subcategories (posts with non-empty `subcategory` values), the tab SHALL display a `▾` indicator after the category name. Clicking the tab SHALL open a popover dropdown below it.

#### Scenario: Tab with subcategories
- **WHEN** the "文章" category has posts with subcategories "AI" and "工程化"
- **THEN** the tab displays as "文章 ▾"

#### Scenario: Tab without subcategories
- **WHEN** the "随笔" category has no posts with subcategories
- **THEN** the tab displays as "随笔" with no arrow indicator

### Requirement: Popover lists subcategories with "全部" option
The popover SHALL display a list starting with "全部" followed by all unique subcategory values for the active tab, in the order they appear in the data.

#### Scenario: Popover content
- **WHEN** user clicks "文章 ▾" tab
- **THEN** the popover shows: 全部, AI, 工程化

### Requirement: Selecting a subcategory updates tab label and filters posts
When a subcategory is selected from the popover, the tab label SHALL update to show the selected subcategory (e.g., "文章 · AI ▾"), the popover SHALL close, and the post list SHALL be filtered to show only posts matching both the category and subcategory.

#### Scenario: Select subcategory
- **WHEN** user selects "AI" from the "文章" popover
- **THEN** tab shows "文章 · AI ▾"
- **AND** only posts with category="文章" AND subcategory="AI" are displayed
- **AND** the popover closes

#### Scenario: Select "全部" in popover
- **WHEN** user selects "全部" from the popover
- **THEN** tab reverts to "文章 ▾"
- **AND** all posts with category="文章" are displayed (regardless of subcategory)

### Requirement: Popover closes on outside click or tab switch
The popover SHALL close when the user clicks outside of it, or when a different tab is selected.

#### Scenario: Click outside
- **WHEN** the popover is open and user clicks outside the popover and tab
- **THEN** the popover closes

#### Scenario: Switch to another tab
- **WHEN** the popover is open and user clicks a different tab
- **THEN** the popover closes and the subcategory selection resets

### Requirement: Popover has animated entrance
The popover SHALL animate in using framer-motion with opacity (0→1) and vertical offset (y: -4→0) over 150ms.

#### Scenario: Popover opens
- **WHEN** user clicks a tab with subcategories
- **THEN** the popover fades in and slides down from 4px above its final position

### Requirement: Popover visual style matches dark theme
The popover SHALL use dark theme styling: semi-transparent dark background with backdrop blur, subtle border, rounded corners, and shadow.

#### Scenario: Popover appearance
- **WHEN** the popover is open
- **THEN** it has dark semi-transparent background, backdrop blur, white/10 border, rounded-lg corners, and shadow-xl
