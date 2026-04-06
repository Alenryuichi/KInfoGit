## ADDED Requirements

### Requirement: Blog detail page renders without double Layout
The blog detail page SHALL NOT wrap its content in a `<Layout>` component, because `_app.tsx` already provides the Layout wrapper for all pages. FloatingLines and other layout elements MUST render exactly once.

#### Scenario: Single Layout rendering on blog detail page
- **WHEN** a user navigates to any blog detail page (`/blog/[slug]`)
- **THEN** the Layout component (including FloatingLines) renders exactly once in the DOM

#### Scenario: Layout consistency with other pages
- **WHEN** comparing the blog detail page DOM structure with other pages (e.g., `/about`, `/work`)
- **THEN** the nesting depth of Layout components is identical across all pages

### Requirement: Blog titles display without markdown markers
The system SHALL strip markdown heading markers (leading `#{1,6}\s*`) and other markdown artifacts from blog post titles before rendering. This MUST apply consistently in both the blog list page and blog detail page.

#### Scenario: Title with heading markers is cleaned
- **WHEN** a blog post has a title like `### 最致命的问题：无法应对考古需求`
- **THEN** the rendered title displays as `最致命的问题：无法应对考古需求`

#### Scenario: Title without markdown markers is unchanged
- **WHEN** a blog post has a clean title like `My Blog Post`
- **THEN** the rendered title displays as `My Blog Post` with no modification

#### Scenario: Title with inline hash not at start is preserved
- **WHEN** a blog post has a title like `C# Programming Guide`
- **THEN** the rendered title displays as `C# Programming Guide` (only leading markers are stripped)

#### Scenario: Title cleaning is consistent across pages
- **WHEN** the same blog post title appears on the blog list page and the blog detail page
- **THEN** both pages display the identical cleaned title text

### Requirement: Table of contents displays for articles with sufficient headings
The blog detail page SHALL display a table of contents (TOC) extracted from the article's h2 and h3 headings. The TOC MUST be shown as a sticky sidebar on desktop viewports and as a collapsible panel on mobile viewports. The TOC SHALL be hidden when the article contains fewer than 2 headings.

#### Scenario: TOC displays on desktop for article with headings
- **WHEN** a user views a blog post with 3 or more h2/h3 headings on a desktop viewport (>= 1024px)
- **THEN** a sticky TOC sidebar appears on the right side listing all h2 and h3 headings as navigable links, with h3 headings visually indented

#### Scenario: TOC is collapsible on mobile
- **WHEN** a user views a blog post with headings on a mobile viewport (< 1024px)
- **THEN** the TOC is presented as a collapsible panel (collapsed by default) that the user can toggle open/closed

#### Scenario: TOC is hidden for short articles
- **WHEN** a user views a blog post with fewer than 2 h2/h3 headings
- **THEN** the TOC component is not rendered

#### Scenario: Clicking a TOC entry scrolls to that heading
- **WHEN** a user clicks a heading link in the TOC
- **THEN** the page smoothly scrolls to the corresponding heading in the article

### Requirement: Active heading is highlighted in TOC
The TOC SHALL highlight the heading that is currently visible in the viewport using IntersectionObserver. As the user scrolls through the article, the active heading in the TOC MUST update accordingly.

#### Scenario: Active heading updates on scroll
- **WHEN** a user scrolls through an article and a new h2/h3 heading enters the viewport
- **THEN** the corresponding TOC entry becomes visually highlighted and the previously active entry is de-highlighted

#### Scenario: First heading is active at top of article
- **WHEN** a user is at the top of the article before any heading has been scrolled past
- **THEN** the first heading in the TOC is highlighted as active

### Requirement: Prev/next post navigation at article footer
The blog detail page SHALL display navigation links to the previous and next blog posts (sorted chronologically by date) at the bottom of the article content. If there is no previous or next post, that side of the navigation MUST be omitted.

#### Scenario: Article with both prev and next posts
- **WHEN** a user views a blog post that has both an older and a newer post
- **THEN** the footer shows a link to the previous (older) post on the left and the next (newer) post on the right, each displaying the post title

#### Scenario: First article has no previous post
- **WHEN** a user views the oldest blog post in the collection
- **THEN** the footer shows only a next post link; no previous link is rendered

#### Scenario: Last article has no next post
- **WHEN** a user views the newest blog post in the collection
- **THEN** the footer shows only a previous post link; no next link is rendered

### Requirement: Reading progress bar at top of page
The blog detail page SHALL display a thin horizontal progress bar fixed at the top of the viewport. The bar MUST visually represent the user's scroll progress through the article content, starting at 0% when the article top is in view and reaching 100% when the article bottom is in view.

#### Scenario: Progress bar at start of article
- **WHEN** a user opens a blog post and is at the top of the page
- **THEN** the progress bar width is at 0% (or near 0%)

#### Scenario: Progress bar at end of article
- **WHEN** a user scrolls to the bottom of the article content
- **THEN** the progress bar width reaches 100%

#### Scenario: Progress bar updates smoothly during scroll
- **WHEN** a user scrolls through the article
- **THEN** the progress bar width updates continuously and smoothly to reflect current scroll position
