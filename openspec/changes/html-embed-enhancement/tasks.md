## 1. Sync Pipeline — HTML Extraction

- [x] 1.1 Refactor `cleanHtmlTags()` to only strip decorative tags (font, span), preserve meaningful HTML (div, table, p, iframe, etc.), and compact Yuque whitespace inside HTML blocks
- [x] 1.2 Move HTML comment removal (`<!-- -->`) to run after HTML page extraction, only on remaining Markdown content
- [x] 1.3 Add fenced code block detection: scan for `` ```html `` blocks containing `<html` tag, extract content and remove the code fence wrapper
- [x] 1.4 Keep raw `<!DOCTYPE html>` / `<html>` detection as fallback for unfenced full HTML documents
- [x] 1.5 Generate readable filenames from `<title>` element (slugify, max 60 chars, fallback to `{doc-slug}-embed-{index}`)
- [x] 1.6 Write extracted HTML files to `website/public/blog/embeds/`, cleaning Yuque whitespace artifacts
- [x] 1.7 Inject postMessage height-resize script snippet before `</body>` in each extracted HTML file
- [x] 1.8 Replace extracted HTML in Markdown with `<iframe src="/blog/embeds/<filename>" ...>` tag
- [x] 1.9 Add `BLOG_EMBEDS_DIR` constant and `mkdirSync` for the embeds directory

## 2. Sync Pipeline — Attachment Cleanup

- [x] 2.1 Remove Markdown links matching `[*.html](https://www.yuque.com/attachments/...)` pattern from content
- [x] 2.2 Preserve non-HTML attachment links (pdf, zip, etc.) as-is

## 3. Iframe Renderer Component

- [x] 3.1 Create `EmbedIframe` component in `MarkdownRenderer.tsx` with loading skeleton and fade-in on load
- [x] 3.2 Add fullscreen button (top-right corner) using Fullscreen API with modal overlay fallback
- [x] 3.3 Add postMessage listener for `{ type: 'iframe-resize', height }` to auto-resize iframe height
- [x] 3.4 Wire `EmbedIframe` into react-markdown's `components` map — match iframes with `src` starting with `/blog/embeds/`

## 4. Integration & Verification

- [x] 4.1 Re-sync the "HTML 嵌入测试" doc and verify: inline HTML (div, table) renders correctly, full HTML page is extracted to embeds/ and renders in iframe
- [x] 4.2 Run `npm run build` and verify no build errors
- [x] 4.3 Run `npm run lint` and `npm run type-check` and fix any issues
- [x] 4.4 Verify on localhost: gradient card, table, and iframe with fullscreen all work
