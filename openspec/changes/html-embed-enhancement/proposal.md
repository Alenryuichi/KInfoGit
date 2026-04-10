## Why

Blog posts synced from Yuque can contain embedded HTML content (inline cards, tables) and full standalone HTML applications (presentations, interactive demos). Currently the sync pipeline strips all meaningful HTML tags via `cleanHtmlTags()`, and full HTML documents pasted into Yuque render as broken content. There is no way to embed an interactive HTML application in a blog post.

## What Changes

- Detect full HTML documents inside `` ```html `` code blocks (or raw `<!DOCTYPE html>` fallback) during sync, extract them to `website/public/blog/embeds/`, and replace with `<iframe>` in Markdown
- Generate readable iframe filenames from `<title>` instead of Yuque slugs
- Remove dead Yuque attachment links (`.html` files pointing to `yuque.com/attachments/`) that require authentication and are inaccessible to visitors
- Add a custom iframe component in `MarkdownRenderer.tsx` with fullscreen toggle button and loading skeleton
- Support iframe height auto-resize via `postMessage` communication
- Reorder HTML comment removal to run after HTML page extraction, so comments inside extracted HTML apps are preserved

## Capabilities

### New Capabilities
- `html-page-extraction`: Detect and extract full HTML documents from Markdown content during Yuque sync, saving them as standalone files and replacing with iframe references
- `iframe-renderer`: Custom iframe component in MarkdownRenderer with fullscreen support, loading states, and height auto-resize

### Modified Capabilities
- `yuque-api-sync`: Changes to `cleanHtmlTags()` (preserve meaningful HTML, reorder comment removal), attachment link cleanup, and integration of HTML extraction into the sync pipeline

## Impact

- `scripts/sync-yuque.ts` — sync pipeline changes (HTML extraction, tag cleaning, attachment cleanup)
- `website/components/MarkdownRenderer.tsx` — new iframe component with fullscreen + loading
- `website/public/blog/embeds/` — new directory for extracted HTML files
- No dependency changes needed; uses browser Fullscreen API and postMessage (native)
