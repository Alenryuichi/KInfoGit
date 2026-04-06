## ADDED Requirements

### Requirement: TOC parsing extracts second-level directories as subcategory
The sync script SHALL recognize depth=2 TITLE nodes in the TOC as subcategories. Each DOC node SHALL inherit the most recent depth=2 TITLE as its `subcategory`. When a new depth=1 TITLE is encountered, the current subcategory SHALL reset to undefined.

#### Scenario: Document under a second-level directory
- **WHEN** the TOC has 文章(depth=1) → AI(depth=2) → Page Agent(DOC, depth=3)
- **THEN** Page Agent's subcategory is "AI" and category is "文章"

#### Scenario: Document directly under first-level directory (no subcategory)
- **WHEN** a DOC appears at depth=2 with no preceding depth=2 TITLE under its parent
- **THEN** the document's subcategory is undefined (omitted from frontmatter)

#### Scenario: New first-level directory resets subcategory
- **WHEN** the TOC has 文章(depth=1) → AI(depth=2) → 随笔(depth=1) → some DOC
- **THEN** the DOC under 随笔 has no subcategory (reset by new depth=1 TITLE)

### Requirement: Frontmatter includes optional subcategory field
The sync script SHALL include a `subcategory` field in the frontmatter when a document has a subcategory. The field SHALL be omitted when no subcategory exists.

#### Scenario: Document with subcategory
- **WHEN** a document has subcategory "AI"
- **THEN** the frontmatter includes `subcategory: "AI"`

#### Scenario: Document without subcategory
- **WHEN** a document has no subcategory
- **THEN** the frontmatter does not contain a `subcategory` line

### Requirement: Subcategory changes trigger frontmatter update
The incremental sync SHALL detect subcategory changes (document moved between second-level directories) and update the frontmatter in the existing blog file without re-fetching content or re-generating tags.

#### Scenario: Document moved to different subcategory
- **WHEN** a document's subcategory changes from "AI" to "工程化" but content is unchanged
- **THEN** the sync updates only the subcategory line in the existing blog file
