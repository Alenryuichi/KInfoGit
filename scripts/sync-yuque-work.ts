#!/usr/bin/env npx tsx
/**
 * 语雀 Work 知识库 API 同步脚本
 * - 直接调用语雀 API（token 认证），替代 elog + convert 两步流水线
 * - TOC 一级目录 → section，全局出现顺序 → order
 * - DeepSeek 提取结构化 Project 数据（title 翻译、tech_stack、achievements 等）
 * - 图片下载到本地
 * - updated_at 增量同步
 */

import fs from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { cleanHtmlTags, removeHtmlComments, cleanAttachmentLinks, extractFullHtmlPages } from './html-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// --- Config ---

const PROJECTS_OUTPUT_DIR = path.join(ROOT_DIR, 'profile-data/projects');
const WORK_IMAGES_DIR = path.join(ROOT_DIR, 'website/public/work/images');
const WORK_EMBEDS_DIR = path.join(ROOT_DIR, 'website/public/work/embeds');
const SYNC_STATE_FILE = path.join(ROOT_DIR, 'tools/yuque-sync/work-sync-state.json');
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const YUQUE_API_BASE = 'https://www.yuque.com/api/v2';

const FEATURED_COUNT = 3;

// --- Types ---

interface TocNode {
  type: string;
  title: string;
  slug: string;
  doc_id?: number;
  depth: number;
}

interface YuqueDoc {
  id: number;
  slug: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
}

interface SectionInfo {
  name: string;
}

interface DocWithSection {
  doc_id: number;
  slug: string;
  title: string;
  section: SectionInfo;
  order: number;
}

interface Project {
  id: string;
  title: { zh: string; en: string };
  slug: string;
  period: string;
  company: string;
  role: { zh: string; en: string };
  tech_stack: string[];
  responsibilities: { zh: string[]; en: string[] };
  achievements: { zh: string[]; en: string[] };
  description?: { zh: string; en: string };
  highlights?: { zh: string; en: string };
  impact?: string;
  category?: string;
  section?: string;
  featured?: boolean;
  order?: number;
  hasDetailPage?: boolean;
}

interface DeepSeekResult {
  title: { zh: string; en: string };
  period: string;
  company: string;
  role: { zh: string; en: string };
  tech_stack: string[];
  responsibilities: { zh: string[]; en: string[] };
  achievements: { zh: string[]; en: string[] };
  description: { zh: string; en: string };
  highlights: { zh: string; en: string };
  impact: string;
  category: string;
}

interface SyncStateEntry {
  slug: string;
  updated_at: string;
  project: Project;
}

interface SyncState {
  lastSync: string;
  docs: Record<string, SyncStateEntry>;
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

async function yuqueGet<T>(apiPath: string, retries = 3): Promise<T> {
  const url = `${YUQUE_API_BASE}${apiPath}`;
  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await fetch(url, { headers: yuqueHeaders() });

    // Log rate limit info
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const limit = response.headers.get('X-RateLimit-Limit');
    if (remaining !== null) {
      console.log(`   📊 API 配额: ${remaining}/${limit}`);
    }

    if (response.status === 429) {
      // Parse x-cchm header for remaining quota: "h:<hour>,m:<minute>"
      const cchm = response.headers.get('x-cchm') || '';
      const hourMatch = cchm.match(/h:(\d+)/);
      const hourRemaining = hourMatch ? parseInt(hourMatch[1]) : -1;

      if (hourRemaining === 0) {
        // Hour quota exhausted — calculate wait until next hour
        const now = new Date();
        const minutesLeft = 60 - now.getMinutes();
        console.warn(`   🚫 小时配额已耗尽 (${cchm})，需等待 ~${minutesLeft} 分钟到下一整点`);
        if (attempt < retries) {
          const waitSec = Math.min(minutesLeft * 60, 600); // 最多等 10 分钟
          console.warn(`   ⏳ 等待 ${waitSec}s 后重试 (${attempt}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, waitSec * 1000));
          continue;
        }
      } else {
        // Per-second / per-minute throttle — short wait
        const wait = 5 * attempt;
        console.warn(`   ⏳ 短暂限流 (${cchm})，等待 ${wait}s 后重试 (${attempt}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, wait * 1000));
        continue;
      }

      throw new Error(`Yuque API 429: 配额耗尽 (${cchm})，请等待下一整点后重试`);
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Yuque API ${response.status}: ${text}`);
    }
    const json = await response.json() as { data: T };
    return json.data;
  }
  throw new Error(`Yuque API: 重试 ${retries} 次后仍失败`);
}

async function getToc(namespace: string): Promise<TocNode[]> {
  return yuqueGet<TocNode[]>(`/repos/${namespace}/toc`);
}

/** Fetch doc list in one request — for checking updated_at without per-doc API calls */
async function getDocList(namespace: string): Promise<YuqueDoc[]> {
  const allDocs: YuqueDoc[] = [];
  let offset = 0;
  const limit = 100;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = await yuqueGet<YuqueDoc[]>(`/repos/${namespace}/docs?offset=${offset}&limit=${limit}`);
    allDocs.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return allDocs;
}

async function getDoc(namespace: string, slug: string): Promise<YuqueDoc> {
  return yuqueGet<YuqueDoc>(`/repos/${namespace}/docs/${slug}`);
}

// --- TOC Parsing ---

interface ParsedToc {
  sections: string[];
  docs: DocWithSection[];
}

function parseToc(toc: TocNode[]): ParsedToc {
  const sections: string[] = [];
  const docs: DocWithSection[] = [];

  let currentSection = '未分类';
  let globalOrder = 0;

  for (const node of toc) {
    if (node.type === 'TITLE' && node.depth === 1) {
      currentSection = node.title;
      if (!sections.includes(currentSection)) {
        sections.push(currentSection);
      }
    } else if (node.type === 'DOC' && node.doc_id) {
      docs.push({
        doc_id: node.doc_id,
        slug: node.slug,
        title: node.title,
        section: { name: currentSection },
        order: globalOrder++,
      });
    }
  }

  return { sections, docs };
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

// --- Image Download ---

async function downloadImages(content: string, docSlug: string): Promise<string> {
  mkdirSync(WORK_IMAGES_DIR, { recursive: true });

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
      const localPath = path.join(WORK_IMAGES_DIR, filename);

      await fs.writeFile(localPath, buffer);
      result = result.replace(fullMatch, `![${alt}](/work/images/${filename})`);
    } catch (error) {
      console.warn(`   ⚠️  图片下载异常: ${url}`, error instanceof Error ? error.message : '');
    }
  }

  return result;
}

// --- DeepSeek Structured Extraction ---

const DEEPSEEK_PROMPT = `你是一个项目信息提取助手。从以下项目文档中提取结构化信息，返回 JSON。

要求：
1. title: 项目名称，zh 保留原文，en 翻译为英文
2. period: 项目时间段，如 "2025.09 - 至今"
3. company: 所属公司或 "独立开发"
4. role: 角色，zh + en
5. tech_stack: 技术栈数组
6. responsibilities: 职责列表，zh + en
7. achievements: 成就/亮点列表，zh + en，尽量量化
8. description: 项目简介，zh + en，1-2 句话
9. highlights: 一句话亮点，zh + en，用于卡片展示
10. impact: 一行量化影响，如 "10亿级数据处理能力"
11. category: 项目类别标签，如 "ai-agent"、"mobile-app"、"system-architecture"

只返回 JSON，不要任何解释。

示例输出：
{
  "title": { "zh": "磕线 (Betaline) - 独立开发全流程 iOS 应用", "en": "Betaline - Full-stack iOS Climbing App" },
  "period": "2025.09 - 至今",
  "company": "独立开发",
  "role": { "zh": "独立开发者", "en": "Independent Developer" },
  "tech_stack": ["SwiftUI", "CoreML", "Go/Gin"],
  "responsibilities": { "zh": ["产品设计", "iOS 开发"], "en": ["Product Design", "iOS Development"] },
  "achievements": { "zh": ["独立完成全流程开发"], "en": ["Completed full-stack development independently"] },
  "description": { "zh": "从 0 到 1 独立开发的攀岩应用", "en": "Climbing app built from scratch" },
  "highlights": { "zh": "全栈独立开发上线", "en": "Full-stack independent launch" },
  "impact": "全栈独立开发上线",
  "category": "mobile-app"
}

项目文档：
`;

async function extractProjectData(content: string, title: string, retryCount = 0): Promise<DeepSeekResult | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.warn('   ⚠️  DEEPSEEK_API_KEY 未设置，跳过提取');
    return null;
  }

  const contentPreview = content.slice(0, 3000);
  const prompt = `${DEEPSEEK_PROMPT}\n标题: ${title}\n\n${contentPreview}`;

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
        temperature: 0.2,
        max_tokens: 2000,
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

    const parsed = JSON.parse(jsonStr.trim()) as DeepSeekResult;

    // Validate required fields
    if (!parsed.title?.zh || !parsed.title?.en) {
      throw new Error('Missing required title fields');
    }

    return parsed;
  } catch (error) {
    if (retryCount < 1) {
      console.warn(`   ⚠️  DeepSeek 解析失败，重试中...`, error instanceof Error ? error.message : '');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return extractProjectData(content, title, retryCount + 1);
    }
    console.error(`   ❌  DeepSeek 提取失败:`, error instanceof Error ? error.message : '');
    return null;
  }
}

// --- Slug Generation ---

function generateSlug(title: string): string {
  // Try to extract English name from patterns like "磕线 (Betaline)" or "OpenMemory Plus - xxx"
  // 1. Check for parenthesized English name
  const parenMatch = title.match(/[（(]([A-Za-z][A-Za-z0-9\s\-+]*)[）)]/);
  if (parenMatch) {
    return parenMatch[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }

  // 2. Check for "english-name - 中文描述" pattern
  const dashMatch = title.match(/^([A-Za-z][A-Za-z0-9\s\-+]*?)\s*[-–—]\s/);
  if (dashMatch) {
    return dashMatch[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }

  // 3. If title starts with English, use it
  const englishStart = title.match(/^([A-Za-z][A-Za-z0-9\s\-+]+)/);
  if (englishStart && englishStart[1].trim().length > 2) {
    return englishStart[1].trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '').slice(0, 50);
  }

  // 4. Fallback: extract all English words from title
  const englishWords = title.match(/[A-Za-z][A-Za-z0-9]*/g);
  if (englishWords && englishWords.length >= 2) {
    return englishWords.join('-').toLowerCase().slice(0, 50);
  }

  // 5. Last resort: full title slugify
  return title
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]+/g, '')  // Remove Chinese chars
    .replace(/[^a-z0-9\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'untitled';
}

// --- Output ---

function buildProject(
  docInfo: DocWithSection,
  extracted: DeepSeekResult,
  slug: string,
  hasDetailContent: boolean,
): Project {
  return {
    id: slug,
    title: extracted.title,
    slug,
    period: extracted.period || '',
    company: extracted.company || '',
    role: extracted.role || { zh: '', en: '' },
    tech_stack: extracted.tech_stack || [],
    responsibilities: extracted.responsibilities || { zh: [], en: [] },
    achievements: extracted.achievements || { zh: [], en: [] },
    description: extracted.description,
    highlights: extracted.highlights,
    impact: extracted.impact,
    category: extracted.category,
    section: docInfo.section.name,
    featured: false,  // Will be set later
    order: docInfo.order,
    hasDetailPage: hasDetailContent,
  };
}

function formatProjectFrontmatter(id: string): string {
  return `---\nid: "${id}"\n---`;
}

// --- Main ---

async function main(): Promise<void> {
  console.log('\n🚀 开始从语雀同步 Work 项目\n');
  console.log('─'.repeat(50));

  // Parse --force flag
  const forceSync = process.argv.includes('--force');
  if (forceSync) {
    console.log('⚡ 强制同步模式\n');
  }

  // Validate env
  if (!process.env.YUQUE_TOKEN) {
    console.error('❌ 请设置 YUQUE_TOKEN 环境变量');
    process.exit(1);
  }

  const login = process.env.YUQUE_LOGIN || 'kylin-bxrhs';
  const repo = process.env.YUQUE_WORK_REPO || 'sh4e9k';
  const namespace = `${login}/${repo}`;
  console.log(`📚 知识库: ${namespace}\n`);

  // 1. Fetch TOC
  console.log('📑 获取目录结构...');
  const toc = await getToc(namespace);
  const { sections, docs } = parseToc(toc);

  console.log(`   分区: ${sections.join(', ')}`);
  console.log(`   文档: ${docs.length} 篇\n`);

  if (docs.length === 0) {
    console.log('📭 没有找到需要同步的文档');
    return;
  }

  // 2. Fetch doc list in batch (1 request) for updated_at checks
  console.log('📋 获取文档列表...');
  const docList = await getDocList(namespace);
  const docMap = new Map(docList.map(d => [d.id, d]));
  console.log(`   获取到 ${docList.length} 篇文档的元数据\n`);

  // 3. Load sync state
  const syncState = await loadSyncState();

  // 4. Process each doc
  mkdirSync(PROJECTS_OUTPUT_DIR, { recursive: true });
  mkdirSync(WORK_IMAGES_DIR, { recursive: true });

  const allProjects: Project[] = [];
  let synced = 0;
  let skipped = 0;
  let failed = 0;

  for (const docInfo of docs) {
    const docIdStr = String(docInfo.doc_id);
    const docMeta = docMap.get(docInfo.doc_id);

    if (!docMeta) {
      console.warn(`📝 ${docInfo.title}: ⚠️ 文档列表中未找到，跳过`);
      continue;
    }

    try {
      console.log(`📝 处理: ${docInfo.title}`);

      // Check if unchanged using batch-fetched updated_at (no extra API call)
      const cached = syncState.docs[docIdStr];
      if (!forceSync && cached && cached.updated_at === docMeta.updated_at) {
        console.log(`   ⏭️  跳过（未变更）`);
        // Reuse cached project data but update section/order from current TOC
        const project = { ...cached.project };
        project.section = docInfo.section.name;
        project.order = docInfo.order;
        allProjects.push(project);
        skipped++;
        continue;
      }

      // Content changed or new doc — fetch full content (1 API call per changed doc)
      const doc = await getDoc(namespace, docInfo.slug);

      // Clean content
      console.log(`   🧹 清理内容...`);
      let content = cleanHtmlTags(doc.body || '');

      // Download images
      console.log(`   📷 下载图片...`);
      content = await downloadImages(content, docInfo.slug);

      // Extract full HTML pages → standalone files + iframe
      content = await extractFullHtmlPages(content, docInfo.slug, {
        embedsDir: WORK_EMBEDS_DIR,
        embedsUrlPrefix: '/work/embeds',
      });

      // Clean up after extraction
      content = removeHtmlComments(content);
      content = cleanAttachmentLinks(content);

      // Remove first heading if it matches title
      const contentWithoutTitle = content.replace(/^#\s+.+\n+/, '');

      // Extract structured data via DeepSeek
      console.log(`   🤖 DeepSeek 提取结构化数据...`);
      const extracted = await extractProjectData(content, doc.title);

      if (!extracted) {
        console.error(`   ❌ 跳过文档（提取失败）: ${docInfo.title}`);
        failed++;
        continue;
      }

      // Generate slug: try doc title first, fallback to DeepSeek English title
      let slug = generateSlug(docInfo.title);
      if (slug === 'untitled') {
        slug = generateSlug(extracted.title.en);
      }

      // Write markdown detail file
      const mdPath = path.join(PROJECTS_OUTPUT_DIR, `${slug}.md`);
      const mdContent = formatProjectFrontmatter(slug) + '\n\n' + contentWithoutTitle;
      await fs.writeFile(mdPath, mdContent);

      // Build project object
      const hasDetailContent = contentWithoutTitle.trim().length > 50;
      const project = buildProject(docInfo, extracted, slug, hasDetailContent);
      allProjects.push(project);

      // Update sync state
      syncState.docs[docIdStr] = {
        slug: docInfo.slug,
        updated_at: doc.updated_at,
        project,
      };

      console.log(`   ✅ 已同步: ${slug}`);
      synced++;

      // Rate limiting (语雀 API 限流较严格)
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ 失败: ${message}`);
      failed++;
    }
  }

  // 4. Delete orphaned docs (removed from Yuque but still in local cache)
  const remoteDocIds = new Set(docs.map(d => String(d.doc_id)));
  let deleted = 0;
  for (const [docId, cached] of Object.entries(syncState.docs)) {
    if (!remoteDocIds.has(docId)) {
      const mdPath = path.join(PROJECTS_OUTPUT_DIR, `${cached.project.slug}.md`);
      if (existsSync(mdPath)) {
        await fs.unlink(mdPath);
        console.log(`🗑️  已删除: ${cached.project.slug}.md`);
      }
      // Also clean up any extracted embed files for this doc
      const embedPrefix = cached.slug;
      if (existsSync(WORK_EMBEDS_DIR)) {
        const embedFiles = await fs.readdir(WORK_EMBEDS_DIR);
        for (const f of embedFiles.filter(f => f.startsWith(embedPrefix))) {
          await fs.unlink(path.join(WORK_EMBEDS_DIR, f));
          console.log(`🗑️  已删除 embed: ${f}`);
        }
      }
      delete syncState.docs[docId];
      deleted++;
    }
  }

  // 5. Set featured: top N by order
  allProjects.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  for (let i = 0; i < allProjects.length; i++) {
    allProjects[i].featured = i < FEATURED_COUNT;
  }

  // 5. Write core-projects.json
  const jsonPath = path.join(PROJECTS_OUTPUT_DIR, 'core-projects.json');
  await fs.writeFile(jsonPath, JSON.stringify(allProjects, null, 2) + '\n');
  console.log(`\n📄 写入 core-projects.json（${allProjects.length} 个项目）`);

  // 6. Save sync state
  syncState.lastSync = new Date().toISOString();
  await saveSyncState(syncState);

  // 7. Summary
  console.log('\n' + '─'.repeat(50));
  console.log(`\n📊 同步完成`);
  console.log(`   同步: ${synced}`);
  console.log(`   跳过: ${skipped}`);
  console.log(`   删除: ${deleted}`);
  console.log(`   失败: ${failed}`);
  console.log(`   分区: ${sections.join(', ')}`);
  console.log(`   Featured: ${allProjects.filter(p => p.featured).map(p => p.id).join(', ')}`);

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
