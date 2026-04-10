/**
 * Shared HTML processing utilities for Yuque sync scripts.
 * Used by both sync-yuque.ts (blog) and sync-yuque-work.ts (work/projects).
 */

import fs from 'node:fs/promises';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

// --- HTML Cleaning ---

/**
 * Clean Yuque's decorative HTML tags while preserving meaningful HTML.
 * Only strips font/span wrappers and compacts whitespace inside HTML blocks.
 */
export function cleanHtmlTags(content: string): string {
  let cleaned = content;

  cleaned = cleaned.replace(/<font[^>]*>([\s\S]*?)<\/font>/gi, '$1');
  cleaned = cleaned.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  cleaned = cleaned.replace(/<a\s+name="[^"]*"\s*><\/a>/gi, '');

  // Compact HTML blocks: remove Yuque's extra blank lines + indentation
  // so Markdown parsers treat them as raw HTML rather than code blocks.
  const htmlBlockTags = 'div|table|details|summary|figure|section|article|nav|aside|header|footer|iframe|video|audio|canvas|form|fieldset';
  const htmlBlockRegex = new RegExp(
    `(^[ \\t]*<(?:${htmlBlockTags})\\b[\\s\\S]*?<\\/(?:${htmlBlockTags})\\s*>)`,
    'gmi'
  );
  cleaned = cleaned.replace(htmlBlockRegex, (block) => {
    return block
      .split('\n')
      .map(line => line.replace(/^[ \t]{1,4}/, ''))
      .filter((line, i, arr) => {
        if (line.trim() === '' && i > 0 && i < arr.length - 1) return false;
        return true;
      })
      .join('\n');
  });

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');

  return cleaned.trim();
}

/** Remove HTML comments (called after HTML page extraction to preserve comments inside extracted files) */
export function removeHtmlComments(content: string): string {
  return content.replace(/<!--[\s\S]*?-->/g, '');
}

/** Remove Yuque attachment links for .html files (require auth, inaccessible to visitors) */
export function cleanAttachmentLinks(content: string): string {
  return content.replace(/^\[.*?\.html\]\(https?:\/\/www\.yuque\.com\/attachments\/[^)]+\)\s*$/gm, '');
}

// --- HTML Page Extraction ---

function slugifyHtmlTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/[\u4e00-\u9fa5]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Script injected into extracted HTML files to enable iframe height auto-resize via postMessage */
const IFRAME_RESIZE_SCRIPT = `
<script>
(function() {
  function postHeight() {
    window.parent.postMessage(
      { type: 'iframe-resize', height: document.documentElement.scrollHeight },
      '*'
    );
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  setTimeout(postHeight, 500);
})();
</script>`;

interface ExtractHtmlOptions {
  /** Absolute path to the embeds output directory */
  embedsDir: string;
  /** URL path prefix for iframe src (e.g. '/blog/embeds' or '/work/embeds') */
  embedsUrlPrefix: string;
}

/**
 * Detect full HTML documents embedded in Markdown, extract them into
 * standalone files, and replace with <iframe> tags.
 *
 * Supports two input formats:
 * 1. Fenced ```html code blocks containing <html> tag (primary)
 * 2. Raw <!DOCTYPE html> or <html> in body (fallback)
 *
 * HTML fragments in ```html blocks (without <html> tag) are unwrapped
 * so they render as raw HTML instead of code blocks.
 */
export async function extractFullHtmlPages(
  content: string,
  docSlug: string,
  options: ExtractHtmlOptions,
): Promise<string> {
  let result = content;
  let embedIndex = 0;
  let dirCreated = false;

  async function processHtmlDoc(rawHtml: string, idx: number): Promise<string> {
    if (!dirCreated) {
      mkdirSync(options.embedsDir, { recursive: true });
      dirCreated = true;
    }

    const cleanedHtml = rawHtml
      .split('\n')
      .map(line => line.replace(/^[ \t]{1,4}/, ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

    let finalHtml = cleanedHtml;
    if (/<\/body\s*>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/<\/body\s*>/i, `${IFRAME_RESIZE_SCRIPT}\n</body>`);
    } else {
      finalHtml = finalHtml + '\n' + IFRAME_RESIZE_SCRIPT;
    }

    const titleMatch = finalHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const htmlTitle = titleMatch?.[1]?.trim() || '';
    const titleSlug = slugifyHtmlTitle(htmlTitle);
    const suffix = idx > 1 ? `-${idx}` : '';
    const filename = titleSlug
      ? `${titleSlug}${suffix}.html`
      : `${docSlug}-embed${suffix}.html`;

    const filePath = path.join(options.embedsDir, filename);
    await fs.writeFile(filePath, finalHtml);
    console.log(`   📦 提取 HTML 页面: ${filename}${htmlTitle ? ` (${htmlTitle})` : ''}`);

    return `<iframe src="${options.embedsUrlPrefix}/${filename}" width="100%" height="800" style="border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;" loading="lazy"></iframe>`;
  }

  // 1. Fenced code blocks: ```html ... ```
  const fencedRegex = /```html\s*\n([\s\S]*?)```/gi;
  const fencedMatches = [...result.matchAll(fencedRegex)];
  const fencedReplacements: { start: number; end: number; replacement: string }[] = [];
  for (const match of fencedMatches) {
    const codeContent = match[1];
    const start = match.index!;
    const end = start + match[0].length;
    if (/<html[\s>]/i.test(codeContent)) {
      embedIndex++;
      const iframe = await processHtmlDoc(codeContent, embedIndex);
      fencedReplacements.push({ start, end, replacement: iframe });
    } else {
      fencedReplacements.push({ start, end, replacement: codeContent.trim() });
    }
  }
  for (const r of fencedReplacements.reverse()) {
    result = result.slice(0, r.start) + r.replacement + result.slice(r.end);
  }

  // 2. Raw HTML fallback: <!DOCTYPE html> or <html> in body
  const rawHtmlRegex = /(?:<!DOCTYPE\s+html[^>]*>[\s\S]*?)?<html[\s\S]*?<\/html\s*>/gi;
  const rawMatches = [...result.matchAll(rawHtmlRegex)];
  const rawReplacements: { start: number; end: number; replacement: string }[] = [];
  for (const match of rawMatches) {
    embedIndex++;
    const start = match.index!;
    const end = start + match[0].length;
    const iframe = await processHtmlDoc(match[0], embedIndex);
    rawReplacements.push({ start, end, replacement: iframe });
  }
  for (const r of rawReplacements.reverse()) {
    result = result.slice(0, r.start) + r.replacement + result.slice(r.end);
  }

  return result;
}
