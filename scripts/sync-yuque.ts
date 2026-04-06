#!/usr/bin/env npx tsx
/**
 * 语雀 API 同步脚本
 * - 直接调用语雀 API（token 认证），替代 elog
 * - 一级目录名 → category，保持语雀目录排序
 * - DeepSeek 生成 tags + excerpt
 * - 图片下载到本地
 * - 增量同步
 */

import fs from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// --- Config ---

const BLOG_OUTPUT_DIR = path.join(ROOT_DIR, 'profile-data/blog');
const BLOG_IMAGES_DIR = path.join(ROOT_DIR, 'website/public/blog/images');
const SYNC_STATE_FILE = path.join(ROOT_DIR, 'tools/yuque-sync/sync-state.json');
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

const YUQUE_API_BASE = 'https://www.yuque.com/api/v2';

// --- Types ---

interface TocNode {
  type: string;
  title: string;
  slug: string;
  doc_id?: number;
  depth: number;
  // uuid / parent_uuid etc. omitted
}

interface YuqueDoc {
  id: number;
  slug: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface CategoryInfo {
  name: string;
  order: number;
}

interface DocWithCategory {
  doc_id: number;
  slug: string;
  title: string;
  category: CategoryInfo;
}

interface SyncState {
  lastSync: string;
  docs: Record<string, {
    slug: string;
    updated_at: string;
    category: string;
    blogFile: string;
  }>;
}

interface Frontmatter {
  title: string;
  date: string;
  tags: string[];
  category: string;
  categoryOrder: number;
  readTime: string;
  featured: boolean;
  excerpt: string;
}

// --- Yuque API Client ---

function yuqueHeaders(): Record<string, string> {
  const token = process.env.YUQUE_TOKEN;
  if (!token) {
    throw new Error('YUQUE_TOKEN 环境变量未设置');
  }
  return {
    'X-Auth-Token': token,
    'Content-Type': 'application/json',
    'User-Agent': 'KInfoGit-Sync/1.0',
  };
}

async function yuqueGet<T>(path: string): Promise<T> {
  const url = `${YUQUE_API_BASE}${path}`;
  const response = await fetch(url, { headers: yuqueHeaders() });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Yuque API ${response.status}: ${text}`);
  }
  const json = await response.json() as { data: T };
  return json.data;
}

async function getToc(namespace: string): Promise<TocNode[]> {
  return yuqueGet<TocNode[]>(`/repos/${namespace}/toc`);
}

async function getDoc(namespace: string, slug: string): Promise<YuqueDoc> {
  return yuqueGet<YuqueDoc>(`/repos/${namespace}/docs/${slug}`);
}

// --- TOC Parsing ---

interface ParsedToc {
  categories: CategoryInfo[];
  docs: DocWithCategory[];
}

function parseToc(toc: TocNode[]): ParsedToc {
  const categories: CategoryInfo[] = [];
  const docs: DocWithCategory[] = [];

  let currentCategory: CategoryInfo | null = null;
  let categoryIndex = 0;

  for (const node of toc) {
    if (node.type === 'TITLE' && node.depth === 1) {
      currentCategory = { name: node.title, order: categoryIndex++ };
      categories.push(currentCategory);
    } else if (node.type === 'DOC' && node.doc_id) {
      const category = currentCategory || { name: '未分类', order: 999 };
      docs.push({
        doc_id: node.doc_id,
        slug: node.slug,
        title: node.title,
        category,
      });
    }
  }

  return { categories, docs };
}

// --- Sync State ---

async function loadSyncState(): Promise<SyncState> {
  try {
    const content = await fs.readFile(SYNC_STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { lastSync: '', docs: {} };
  }
}

async function saveSyncState(state: SyncState): Promise<void> {
  mkdirSync(path.dirname(SYNC_STATE_FILE), { recursive: true });
  await fs.writeFile(SYNC_STATE_FILE, JSON.stringify(state, null, 2));
}

// --- HTML Cleaning ---

function cleanHtmlTags(content: string): string {
  let cleaned = content;

  // Remove <font> tags (keep content)
  cleaned = cleaned.replace(/<font[^>]*>([\s\S]*?)<\/font>/gi, '$1');
  // Remove <span> tags (keep content)
  cleaned = cleaned.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');
  // Remove <div> tags (keep content)
  cleaned = cleaned.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1');
  // Remove <p> tags (keep content)
  cleaned = cleaned.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n');
  // Remove <br> tags
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');
  // Remove <a> anchor-only tags
  cleaned = cleaned.replace(/<a\s+name="[^"]*"\s*><\/a>/gi, '');
  // Remove empty HTML tags
  cleaned = cleaned.replace(/<([a-z]+)[^>]*>\s*<\/\1>/gi, '');
  // Remove tags with inline style
  cleaned = cleaned.replace(/<([a-z]+)\s+style="[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi, '$2');
  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  // Collapse multiple blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  // Trim trailing whitespace per line
  cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');

  return cleaned.trim();
}

// --- Image Download ---

async function downloadImages(content: string, docSlug: string): Promise<string> {
  mkdirSync(BLOG_IMAGES_DIR, { recursive: true });

  // Match markdown images and HTML img tags
  const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  let result = content;
  const matches = [...content.matchAll(imgRegex)];

  for (const match of matches) {
    const [fullMatch, alt, url] = match;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`   ⚠️  图片下载失败: ${url} (${response.status})`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const hash = createHash('md5').update(buffer).digest('hex').slice(0, 8);
      const ext = path.extname(new URL(url).pathname) || '.png';
      const filename = `${docSlug}-${hash}${ext}`;
      const localPath = path.join(BLOG_IMAGES_DIR, filename);

      await fs.writeFile(localPath, buffer);
      result = result.replace(fullMatch, `![${alt}](/blog/images/${filename})`);
    } catch (error) {
      console.warn(`   ⚠️  图片下载异常: ${url}`, error instanceof Error ? error.message : '');
    }
  }

  return result;
}

// --- Read Time ---

function calculateReadTime(content: string): string {
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  const minutes = Math.ceil(chineseChars / 400 + englishWords / 200);
  return `${Math.max(1, minutes)} min read`;
}

// --- DeepSeek ---

async function generateTagsAndExcerpt(content: string, title: string): Promise<{ tags: string[]; excerpt: string }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn('   ⚠️  DEEPSEEK_API_KEY 未设置，使用默认 tags');
    return { tags: ['未分类'], excerpt: title };
  }

  const contentPreview = content.slice(0, 2000);

  const prompt = `分析以下 Markdown 文章，生成 JSON 格式的信息。

要求：
1. tags: 根据内容推断 3-5 个相关标签（中文或英文皆可）
2. excerpt: 生成 50-100 字的中文摘要，概括文章核心内容

只返回 JSON，不要任何解释：
{
  "tags": ["标签1", "标签2", "标签3"],
  "excerpt": "摘要内容"
}

文章标题: ${title}

文章内容:
${contentPreview}`;

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API ${response.status}: ${error}`);
    }

    const data = await response.json() as any;
    const responseText = data.choices[0].message.content;

    let jsonStr = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonStr.trim());
    return {
      tags: parsed.tags || ['未分类'],
      excerpt: parsed.excerpt || title,
    };
  } catch (error) {
    console.warn('   ⚠️  DeepSeek 调用失败:', error instanceof Error ? error.message : '');
    return { tags: ['未分类'], excerpt: title };
  }
}

// --- Frontmatter ---

function formatFrontmatter(fm: Frontmatter): string {
  const tagsStr = JSON.stringify(fm.tags);
  return `---
title: "${fm.title.replace(/"/g, '\\"')}"
date: "${fm.date}"
tags: ${tagsStr}
category: "${fm.category}"
categoryOrder: ${fm.categoryOrder}
readTime: "${fm.readTime}"
featured: ${fm.featured}
excerpt: "${fm.excerpt.replace(/"/g, '\\"')}"
---`;
}

// --- Blog File ---

function generateBlogFilename(title: string, date: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${date}-${slug}.md`;
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  const firstLine = content.split('\n').find(line => line.trim());
  return firstLine?.slice(0, 50) || 'Untitled';
}

// --- Main ---

async function main(): Promise<void> {
  console.log('\n🚀 开始从语雀同步博客文章\n');
  console.log('─'.repeat(50));

  // Validate env
  if (!process.env.YUQUE_TOKEN) {
    console.error('❌ 请设置 YUQUE_TOKEN 环境变量');
    process.exit(1);
  }

  const namespace = `${process.env.YUQUE_LOGIN || 'kylin-bxrhs'}/${process.env.YUQUE_REPO || 'qd9got'}`;
  console.log(`📚 知识库: ${namespace}\n`);

  // 1. Fetch TOC
  console.log('📑 获取目录结构...');
  const toc = await getToc(namespace);
  const { categories, docs } = parseToc(toc);

  console.log(`   分类: ${categories.map(c => c.name).join(', ')}`);
  console.log(`   文档: ${docs.length} 篇\n`);

  if (docs.length === 0) {
    console.log('📭 没有找到需要同步的文档');
    return;
  }

  // 2. Load sync state
  const syncState = await loadSyncState();

  // 3. Process each doc
  mkdirSync(BLOG_OUTPUT_DIR, { recursive: true });

  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const docInfo of docs) {
    const docIdStr = String(docInfo.doc_id);

    try {
      // Fetch doc to check updated_at
      console.log(`📝 处理: ${docInfo.title}`);

      const doc = await getDoc(namespace, docInfo.slug);

      // Check if unchanged
      const cached = syncState.docs[docIdStr];
      if (cached && cached.updated_at === doc.updated_at) {
        console.log(`   ⏭️  跳过（未变更）`);
        // Update category in case it was moved
        cached.category = docInfo.category.name;
        skipped++;
        continue;
      }

      // Clean content
      console.log(`   🧹 清理内容...`);
      let content = cleanHtmlTags(doc.body || '');

      // Download images
      console.log(`   📷 下载图片...`);
      content = await downloadImages(content, docInfo.slug);

      // Extract title from content (or use API title)
      const title = doc.title || extractTitle(content);
      console.log(`   📖 标题: ${title}`);

      // Remove first heading if it matches title
      const contentWithoutTitle = content.replace(/^#\s+.+\n+/, '');

      // Generate tags + excerpt via DeepSeek
      console.log(`   🤖 生成 tags + excerpt...`);
      const { tags, excerpt } = await generateTagsAndExcerpt(content, title);

      // Build frontmatter
      const date = doc.created_at.split('T')[0];
      const frontmatter: Frontmatter = {
        title,
        date,
        tags,
        category: docInfo.category.name,
        categoryOrder: docInfo.category.order,
        readTime: calculateReadTime(content),
        featured: false,
        excerpt,
      };

      // Write blog file
      const filename = generateBlogFilename(title, date);
      const outputPath = path.join(BLOG_OUTPUT_DIR, filename);
      const finalContent = formatFrontmatter(frontmatter) + '\n\n' + contentWithoutTitle;

      await fs.writeFile(outputPath, finalContent);

      // Update sync state
      syncState.docs[docIdStr] = {
        slug: docInfo.slug,
        updated_at: doc.updated_at,
        category: docInfo.category.name,
        blogFile: filename,
      };

      console.log(`   ✅ 已同步: ${filename}`);
      synced++;

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ 失败: ${message}`);
      failed++;
    }
  }

  // 4. Save sync state
  syncState.lastSync = new Date().toISOString();
  await saveSyncState(syncState);

  // 5. Summary
  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 同步完成`);
  console.log(`   同步: ${synced}`);
  console.log(`   跳过: ${skipped}`);
  console.log(`   失败: ${failed}`);
  console.log(`   分类: ${categories.map(c => `${c.name}(${c.order})`).join(', ')}`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Load env from .elog.env for local development
function loadEnvFile(): void {
  try {
    const envPath = path.join(ROOT_DIR, 'tools/yuque-sync/.elog.env');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIndex = trimmed.indexOf('=');
          if (eqIndex > 0) {
            const key = trimmed.slice(0, eqIndex);
            const value = trimmed.slice(eqIndex + 1);
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      }
    }
  } catch {
    // ignore
  }
}

loadEnvFile();

main().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});
