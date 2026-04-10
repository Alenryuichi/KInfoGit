## ADDED Requirements

### Requirement: Detect full HTML documents in fenced code blocks
The sync script SHALL scan Markdown content for fenced code blocks tagged as `html` (`` ```html ``) that contain a full HTML document (identified by the presence of `<html` tag). When detected, the HTML content SHALL be extracted and processed as a standalone page.

#### Scenario: HTML document in fenced code block
- **WHEN** Markdown contains a `` ```html `` code block with `<!DOCTYPE html><html>...</html>`
- **THEN** the code block is replaced with an iframe tag pointing to the extracted file

#### Scenario: HTML snippet without html tag in code block
- **WHEN** Markdown contains a `` ```html `` code block with `<div>Hello</div>` (no `<html>` tag)
- **THEN** the code block is left as-is (rendered as a code example)

### Requirement: Detect full HTML documents as raw content (fallback)
The sync script SHALL scan Markdown content for raw (unfenced) full HTML documents identified by `<!DOCTYPE html>` or `<html` appearing in the body. This runs after fenced code block detection to avoid double-processing.

#### Scenario: Raw HTML document pasted in Markdown
- **WHEN** Markdown contains raw `<!DOCTYPE html><html>...</html>` outside any code fence
- **THEN** the HTML document is extracted and replaced with an iframe tag

#### Scenario: Multiple HTML documents in one post
- **WHEN** Markdown contains two separate full HTML documents
- **THEN** each is extracted to a separate file with incrementing suffix (`-2`, `-3`, etc.)

### Requirement: Extract HTML to standalone file
Each detected full HTML document SHALL be written to `website/public/blog/embeds/<filename>.html`. The extracted file SHALL have Yuque's extra blank lines collapsed and leading indentation (up to 4 spaces) removed.

#### Scenario: HTML extracted to embeds directory
- **WHEN** a full HTML document is detected in a blog post with Yuque slug `xo3cylufunfyzh4m`
- **THEN** the file is written to `website/public/blog/embeds/<readable-name>.html`

### Requirement: Generate readable filename from title
The extracted HTML filename SHALL be derived from the `<title>` element: lowercased, non-alphanumeric characters replaced with hyphens, max 60 characters. If no `<title>` is found, the filename SHALL fall back to `{doc-slug}-embed-{index}.html`.

#### Scenario: HTML with title element
- **WHEN** extracted HTML contains `<title>Risk Engine V5 — Deep Dive</title>`
- **THEN** the filename is `risk-engine-v5-deep-dive.html`

#### Scenario: HTML without title element
- **WHEN** extracted HTML has no `<title>` tag and doc slug is `abc123`
- **THEN** the filename is `abc123-embed-1.html`

### Requirement: Replace extracted HTML with iframe
Each extracted HTML document SHALL be replaced in the Markdown with an iframe tag: `<iframe src="/blog/embeds/<filename>" width="100%" height="800" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;" loading="lazy"></iframe>`.

#### Scenario: Replacement in Markdown
- **WHEN** a full HTML document is extracted to `risk-engine-v5-deep-dive.html`
- **THEN** the original HTML in Markdown is replaced with `<iframe src="/blog/embeds/risk-engine-v5-deep-dive.html" ...></iframe>`

### Requirement: Inject height resize script into extracted HTML
The sync script SHALL inject a small JavaScript snippet before `</body>` in each extracted HTML file. The snippet SHALL post a message `{ type: 'iframe-resize', height: document.documentElement.scrollHeight }` to `window.parent` on load and on resize.

#### Scenario: Script injection
- **WHEN** an HTML file is extracted
- **THEN** a `<script>` block is inserted before `</body>` that sends postMessage with document height

### Requirement: Clean Yuque attachment links for HTML files
The sync script SHALL remove Markdown links of the form `[*.html](https://www.yuque.com/attachments/...)` from the content, as these require Yuque authentication and are inaccessible to visitors.

#### Scenario: HTML attachment link
- **WHEN** content contains `[v5-presentation.html](https://www.yuque.com/attachments/yuque/...html)`
- **THEN** the entire link line is removed from the output

#### Scenario: Non-HTML attachment link
- **WHEN** content contains `[report.pdf](https://www.yuque.com/attachments/yuque/...pdf)`
- **THEN** the link is kept as-is

### Requirement: HTML comment removal after extraction
The sync script SHALL remove HTML comments (`<!-- -->`) only from the Markdown content **after** full HTML documents have been extracted. Comments inside extracted HTML files SHALL be preserved.

#### Scenario: Comment in Markdown
- **WHEN** Markdown body contains `<!-- TODO: fix this -->`
- **THEN** the comment is removed from the final Markdown

#### Scenario: Comment in extracted HTML
- **WHEN** an extracted HTML file contains `<!--[if IE]>...<![endif]-->`
- **THEN** the comment is preserved in the extracted file
