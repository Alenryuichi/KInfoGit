## Context

The Yuque sync pipeline (`scripts/sync-yuque.ts`) downloads Markdown blog posts via Yuque API and writes them to `profile-data/blog/`. The Markdown is rendered client-side by `react-markdown` with `rehype-raw` (which passes through raw HTML without sanitization).

Currently `cleanHtmlTags()` strips **all** HTML tags (div, table, p, etc.), destroying intentional HTML content. We've partially fixed this in the current session by preserving meaningful tags and compacting Yuque's extra whitespace. The remaining gap: full standalone HTML applications (complete `<!DOCTYPE html>` documents) cannot be embedded inline — they must be served as separate files via `<iframe>`.

Users author content in Yuque and may paste full HTML applications (presentations, interactive demos) either as raw HTML or inside `` ```html `` fenced code blocks.

## Goals / Non-Goals

**Goals:**
- Full HTML documents in blog Markdown are automatically extracted to standalone files and rendered via iframe
- Support both `` ```html `` code blocks and raw `<!DOCTYPE html>` as input formats
- Extracted files get readable filenames derived from `<title>`
- Dead Yuque attachment links (requiring auth) are cleaned up
- Iframes have fullscreen toggle and loading skeleton in the blog renderer
- Iframe height auto-resizes to content when possible
- HTML comments inside extracted pages are preserved

**Non-Goals:**
- Downloading Yuque attachments (requires Cookie auth, not feasible via API)
- Changing how inline HTML fragments (div, table, etc.) work — that's already fixed
- Supporting non-HTML attachments (PDF, ZIP)
- Editing the Yuque document from the sync side

## Decisions

### 1. Detection: `` ```html `` code blocks as primary, raw `<!DOCTYPE` as fallback

**Decision**: Check for full HTML documents in two places: (a) fenced `` ```html `` code blocks containing `<html`, (b) raw `<!DOCTYPE html>` or `<html>` in the Markdown body.

**Rationale**: Code blocks are the better authoring experience in Yuque (no tag mangling), but we keep raw detection as fallback for pasted content. Code block detection runs first — if an HTML document is inside a code fence, it won't also match the raw detection.

**Alternative considered**: Only support code blocks → rejected because raw paste already partially works from our earlier fix and is simpler for users.

### 2. Filename generation from `<title>`

**Decision**: Extract `<title>` from the HTML, slugify it (lowercase, alphanumeric + hyphens, max 60 chars). Fallback to `{doc-slug}-embed-{index}` if no title.

**Rationale**: Readable filenames in `public/blog/embeds/` are easier to debug and manage than Yuque slugs like `xo3cylufunfyzh4m.html`.

### 3. Iframe component with Fullscreen API + modal fallback

**Decision**: Wrap iframes in a custom component in `MarkdownRenderer.tsx` that detects `src` starting with `/blog/embeds/`. Add a fullscreen button that uses `Element.requestFullscreen()` on desktop, falls back to a fixed-position overlay on mobile/unsupported browsers.

**Alternative considered**: Always use modal overlay → rejected because native fullscreen gives true immersive experience on desktop.

### 4. Height auto-resize via postMessage

**Decision**: Inject a small script snippet into extracted HTML files that posts `{ type: 'iframe-resize', height }` to parent. The iframe component listens for this message and adjusts height. If no message received within 2s, keep default height (800px).

**Rationale**: This is the standard cross-origin iframe resize pattern. We control the extracted HTML files so we can inject the script.

### 5. Attachment link cleanup

**Decision**: Remove Markdown links pointing to `yuque.com/attachments/` where the linked file extension is `.html` (since the content is now embedded via iframe). Keep non-HTML attachment links as-is with no modification.

**Rationale**: HTML attachments are redundant once extracted. Other attachment types are left alone — removing them would lose information.

### 6. HTML comment removal ordering

**Decision**: Move `<!-- -->` removal to run **after** full HTML extraction, and only apply it to the remaining Markdown content (not inside extracted HTML files).

**Rationale**: HTML applications may legitimately use comments (conditional comments, template markers, etc.).

## Risks / Trade-offs

- **[Large HTML files bloat git repo]** → Acceptable for now; these are author-created presentation files, not generated artifacts. Could add `.gitignore` rules later if needed.
- **[postMessage resize requires injecting script]** → Only applies to extracted files we control. The injected snippet is minimal (~10 lines). Original HTML functionality is preserved.
- **[Fullscreen API browser support]** → Falls back to modal overlay. No functionality loss.
- **[Regex-based HTML detection may false-positive]** → Mitigated by requiring `<html` tag presence (not just `<!DOCTYPE`). Simple HTML snippets without `<html>` tag won't trigger extraction.
