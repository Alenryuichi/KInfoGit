## ADDED Requirements

### Requirement: Blog list displays posts grouped by year
The blog page SHALL display all posts in a single-column list, grouped by publication year in descending order (newest year first). Each year section SHALL display a year heading with a horizontal divider line.

#### Scenario: Posts grouped by year
- **WHEN** the blog page loads with posts from 2024, 2025, and 2026
- **THEN** the page displays three year sections: 2026, 2025, 2024 (top to bottom)
- **AND** each section contains only posts from that year, sorted by date descending

#### Scenario: Year section with single post
- **WHEN** a year has only one post
- **THEN** the year section still displays with its heading and the single post entry

### Requirement: Each post entry displays title, date, excerpt, and tags
Each post entry in the list SHALL display: the post title (clickable, links to post detail page), the publication date (formatted as MM/DD), a 1-2 line excerpt (truncated with line-clamp-2), and up to 4 tags as inline pills.

#### Scenario: Post with long excerpt
- **WHEN** a post has an excerpt longer than 2 lines
- **THEN** the excerpt is truncated at 2 lines with ellipsis

#### Scenario: Post with more than 4 tags
- **WHEN** a post has more than 4 tags
- **THEN** only the first 4 tags are displayed

#### Scenario: Clicking a post title
- **WHEN** a user clicks on a post title
- **THEN** the user is navigated to `/blog/<slug>/`

### Requirement: Theme tab filtering with four categories
The blog page SHALL display a tab bar above the post list with tabs: 全部, 文章, 随笔, 分享. Selecting a tab SHALL filter the list to show only posts matching that theme. The "全部" tab SHALL show all posts.

#### Scenario: Default state shows all posts
- **WHEN** the blog page loads
- **THEN** the "全部" tab is active and all posts are displayed

#### Scenario: Selecting a theme tab filters posts
- **WHEN** the user clicks the "文章" tab
- **THEN** only posts categorized as "文章" are displayed, still grouped by year
- **AND** year sections with no matching posts are hidden

#### Scenario: Active tab has visual indicator
- **WHEN** a tab is selected
- **THEN** it has a sliding background indicator animated with framer-motion layoutId

### Requirement: Category mapping from existing data
The page SHALL map existing post `category` field values to the new theme system: technical categories (AI, Engineering, etc.) map to "文章"; "Recently Updated" and unrecognized values map to "随笔"; posts explicitly marked as "分享" remain "分享".

#### Scenario: AI category maps to 文章
- **WHEN** a post has category "AI"
- **THEN** it appears under the "文章" tab

#### Scenario: Unknown category maps to 随笔
- **WHEN** a post has a category not in the mapping table
- **THEN** it appears under the "随笔" tab

### Requirement: Responsive layout
The blog list SHALL be responsive. On mobile (< 768px), the tab bar SHALL be horizontally scrollable. The max content width SHALL be constrained (max-w-3xl) and centered.

#### Scenario: Mobile tab overflow
- **WHEN** the screen width is less than 768px
- **THEN** the tab bar is horizontally scrollable without wrapping

#### Scenario: Desktop centering
- **WHEN** the screen width exceeds the max content width
- **THEN** the content is centered with equal margins

### Requirement: No cover images in blog list
The blog list page SHALL NOT display cover images for posts. Post entries are text-only (title, date, excerpt, tags).

#### Scenario: Post with image field
- **WHEN** a post has an `image` field in frontmatter
- **THEN** the image is NOT displayed on the blog list page

### Requirement: Page header simplified
The blog page SHALL display a simplified header with "THE BLOG" label and a title line. The FloatingLines background animation SHALL NOT be rendered on the blog page.

#### Scenario: Blog page header
- **WHEN** the blog page loads
- **THEN** the header shows "THE BLOG" label and a descriptive title
- **AND** no animated background lines are visible
