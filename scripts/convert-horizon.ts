#!/usr/bin/env npx tsx
/**
 * Convert Horizon Markdown summaries to structured JSON for the AI Daily page.
 * Reads from tools/horizon/repo/data/summaries/ and writes to profile-data/ai-daily/.
 */

import fs from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SUMMARIES_DIR = path.join(ROOT_DIR, 'tools/horizon/repo/data/summaries');
const OUTPUT_DIR = path.join(ROOT_DIR, 'profile-data/ai-daily');

// --- Types ---

interface NewsSource {
  name: string;
  meta?: string;
}

interface NewsItem {
  title: string;
  summary: string;
  url: string;
  score: number;
  sources: NewsSource[];
  tags: string[];
  focusTopics: string[];
  background?: string;
  discussion?: string;
}

interface DigestSection {
  id: string;
  title: string;
  items: NewsItem[];
}

interface DailyDigest {
  date: string;
  itemCount: number;
  sections: DigestSection[];
}

// --- Focus Topics ---

const FOCUS_TOPICS: Record<string, string[]> = {
  memory: ['memory', 'retrieval', 'rag', 'context window', 'long-term', 'episodic', 'procedural memory', 'knowledge graph'],
  'self-evolution': ['self-evolving', 'self-improvement', 'auto-optimization', 'self-play', 'self-refine', 'evoagent', 'meta-learning'],
  'multi-agent': ['multi-agent', 'multi agent', 'swarm', 'collaboration', 'a2a', 'agent-to-agent', 'orchestrat', 'crew'],
  planning: ['planning', 'reasoning', 'chain-of-thought', 'cot', 'tree-of-thought', 'task decomposition', 'step-by-step'],
  reflection: ['reflection', 'self-correct', 'self-evaluation', 'critique', 'reflexion', 'verify', 'self-debug'],
  'tool-use': ['tool use', 'tool calling', 'function calling', 'mcp', 'tool creation', 'api integration'],
};

function detectFocusTopics(item: { title: string; summary: string; tags: string[] }): string[] {
  const text = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase();
  const matched: string[] = [];

  for (const [topic, keywords] of Object.entries(FOCUS_TOPICS)) {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
      matched.push(topic);
    }
  }

  return matched;
}

// --- Section Classification ---

const SECTION_KEYWORDS: Record<string, string[]> = {
  headlines: ['raises', 'launches', 'announces', 'releases', 'funding', 'acquires', 'supports', 'backs', 'bill', 'policy', 'regulation', 'FBI', 'government'],
  research: ['researchers', 'paper', 'study', 'quantum', 'achieve', 'demonstrate', 'novel', 'benchmark', 'scaling', 'arxiv', 'breakthrough'],
  engineering: ['tool', 'library', 'framework', 'tutorial', 'guide', 'open-source', 'CLI', 'SDK', 'API', 'web tool', 'unicode', 'macOS', 'CPU', 'debug'],
};

function classifyItem(item: { title: string; summary: string; tags: string[] }): string {
  const text = `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase();

  let bestSection = 'headlines';
  let bestScore = 0;

  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    const score = keywords.filter(kw => text.includes(kw.toLowerCase())).length;
    if (score > bestScore) {
      bestScore = score;
      bestSection = section;
    }
  }

  return bestSection;
}

// --- Markdown Parser ---

function parseHorizonMarkdown(content: string, date: string): DailyDigest | null {
  // Split into items by "---" separators after the TOC
  const lines = content.split('\n');

  // Find all item blocks (## [title](url) ⭐️ score/10)
  const itemRegex = /^## \[(.+?)\]\((.+?)\)\s*⭐️\s*([\d.]+)\/10/;
  const items: NewsItem[] = [];
  let currentItem: Partial<NewsItem> | null = null;
  let currentField = '';
  let fieldContent: string[] = [];

  function flushField() {
    if (currentItem && currentField && fieldContent.length > 0) {
      const text = fieldContent.join('\n').trim();
      if (currentField === 'summary') {
        currentItem.summary = text;
      } else if (currentField === 'background') {
        currentItem.background = text.replace(/^\*\*Background\*\*:\s*/, '');
      } else if (currentField === 'discussion') {
        currentItem.discussion = text.replace(/^\*\*Discussion\*\*:\s*/, '');
      }
    }
    fieldContent = [];
    currentField = '';
  }

  function flushItem() {
    flushField();
    if (currentItem?.title && currentItem?.url) {
      const item: NewsItem = {
        title: currentItem.title,
        summary: currentItem.summary || '',
        url: currentItem.url,
        score: currentItem.score || 0,
        sources: currentItem.sources || [],
        tags: currentItem.tags || [],
        focusTopics: [],
        background: currentItem.background,
        discussion: currentItem.discussion,
      };
      item.focusTopics = detectFocusTopics(item);
      items.push(item);
    }
    currentItem = null;
  }

  for (const line of lines) {
    // New item header
    const itemMatch = line.match(itemRegex);
    if (itemMatch) {
      flushItem();
      currentItem = {
        title: itemMatch[1],
        url: itemMatch[2],
        score: parseFloat(itemMatch[3]),
        sources: [],
        tags: [],
      };
      currentField = 'summary';
      continue;
    }

    if (!currentItem) continue;

    // Source line: "hackernews · username · Apr 10, 11:29"
    const sourceMatch = line.match(/^(\w+)\s*·\s*(.+?)(?:\s*·\s*(.+))?$/);
    if (sourceMatch && !line.startsWith('**') && !line.startsWith('<') && !line.startsWith('#')) {
      flushField();
      const sourceName = sourceMatch[1];
      const meta = sourceMatch[2]?.trim();
      currentItem.sources = [{ name: sourceName, meta }];
      continue;
    }

    // Tags line: **Tags**: `#tag1`, `#tag2`
    if (line.startsWith('**Tags**:')) {
      flushField();
      const tagMatches = [...line.matchAll(/#([^`]+)/g)];
      currentItem.tags = tagMatches.map(m => m[1].trim());
      continue;
    }

    // Background
    if (line.startsWith('**Background**:')) {
      flushField();
      currentField = 'background';
      fieldContent.push(line);
      continue;
    }

    // Discussion
    if (line.startsWith('**Discussion**:')) {
      flushField();
      currentField = 'discussion';
      fieldContent.push(line);
      continue;
    }

    // Skip anchor tags, details blocks, separators
    if (line.startsWith('<a id=') || line.startsWith('<details') || line.startsWith('<ul>') ||
        line.startsWith('<li>') || line.startsWith('</') || line === '---' || line.startsWith('> ') ||
        /^\d+\.\s*\[/.test(line)) {
      continue;
    }

    // Accumulate field content
    if (currentField && line.trim()) {
      fieldContent.push(line);
    }
  }

  flushItem();

  if (items.length === 0) return null;

  // Classify items into sections
  const sectionMap: Record<string, NewsItem[]> = {
    headlines: [],
    research: [],
    engineering: [],
  };

  for (const item of items) {
    const section = classifyItem(item);
    sectionMap[section].push(item);
  }

  const sections: DigestSection[] = [
    { id: 'headlines', title: 'Headlines & Launches', items: sectionMap.headlines },
    { id: 'research', title: 'Research & Innovation', items: sectionMap.research },
    { id: 'engineering', title: 'Engineering & Resources', items: sectionMap.engineering },
  ].filter(s => s.items.length > 0);

  return {
    date,
    itemCount: items.length,
    sections,
  };
}

// --- Main ---

async function main(): Promise<void> {
  console.log('🔄 Converting Horizon summaries to AI Daily JSON\n');

  if (!existsSync(SUMMARIES_DIR)) {
    console.log('📭 No summaries directory found');
    return;
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = await fs.readdir(SUMMARIES_DIR);
  const enFiles = files.filter(f => f.match(/^horizon-\d{4}-\d{2}-\d{2}-en\.md$/));

  if (enFiles.length === 0) {
    console.log('📭 No English summary files found');
    return;
  }

  let converted = 0;
  let skipped = 0;

  for (const file of enFiles) {
    const dateMatch = file.match(/horizon-(\d{4}-\d{2}-\d{2})-en\.md/);
    if (!dateMatch) continue;

    const date = dateMatch[1];
    const outputPath = path.join(OUTPUT_DIR, `${date}.json`);

    // Skip if already converted and source hasn't changed
    if (existsSync(outputPath)) {
      const srcStat = await fs.stat(path.join(SUMMARIES_DIR, file));
      const dstStat = await fs.stat(outputPath);
      if (dstStat.mtime >= srcStat.mtime) {
        console.log(`   ⏭️  ${date} (already up to date)`);
        skipped++;
        continue;
      }
    }

    const content = await fs.readFile(path.join(SUMMARIES_DIR, file), 'utf-8');
    const digest = parseHorizonMarkdown(content, date);

    if (!digest) {
      console.log(`   ⚠️  ${date} (no items parsed)`);
      continue;
    }

    await fs.writeFile(outputPath, JSON.stringify(digest, null, 2) + '\n');
    console.log(`   ✅ ${date}: ${digest.itemCount} items → ${digest.sections.map(s => `${s.title}(${s.items.length})`).join(', ')}`);
    converted++;
  }

  console.log(`\n📊 Done: ${converted} converted, ${skipped} skipped`);
}

main().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});
