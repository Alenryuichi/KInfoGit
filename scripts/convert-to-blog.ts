#!/usr/bin/env npx tsx
/**
 * 语雀文章转换为博客格式
 * - 脚本清理 HTML 标签
 * - DeepSeek API 专注生成 frontmatter
 */

import fs from 'node:fs/promises';
import { existsSync, mkdirSync, cpSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// 配置
const YUQUE_DOCS_DIR = path.join(ROOT_DIR, 'tools/yuque-sync/docs');
const BLOG_OUTPUT_DIR = path.join(ROOT_DIR, 'profile-data/blog');
const BLOG_IMAGES_DIR = path.join(ROOT_DIR, 'website/public/blog/images');
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

interface ConvertResult {
  success: boolean;
  file: string;
  error?: string;
}

interface Frontmatter {
  title: string;
  date: string;
  tags: string[];
  category: string;
  readTime: string;
  featured: boolean;
  image: string;
  excerpt: string;
}

/**
 * 使用正则清理 HTML 标签
 */
function cleanHtmlTags(content: string): string {
  let cleaned = content;

  // 移除 <font> 标签（保留内容）
  cleaned = cleaned.replace(/<font[^>]*>([\s\S]*?)<\/font>/gi, '$1');

  // 移除 <span> 标签（保留内容）
  cleaned = cleaned.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, '$1');

  // 移除 <div> 标签（保留内容）
  cleaned = cleaned.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1');

  // 移除 <p> 标签（保留内容）
  cleaned = cleaned.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n');

  // 移除 <br> 标签
  cleaned = cleaned.replace(/<br\s*\/?>/gi, '\n');

  // 移除 <a> 标签中的 name 属性锚点（保留正常链接）
  cleaned = cleaned.replace(/<a\s+name="[^"]*"\s*><\/a>/gi, '');

  // 移除空的 HTML 标签
  cleaned = cleaned.replace(/<([a-z]+)[^>]*>\s*<\/\1>/gi, '');

  // 移除剩余的行内 style 属性的标签
  cleaned = cleaned.replace(/<([a-z]+)\s+style="[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi, '$2');

  // 移除 HTML 注释
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // 修复图片路径
  cleaned = cleaned.replace(/!\[([^\]]*)\]\(images\//g, '![$1](/blog/images/');

  // 清理多余空行（超过2个连续空行变成2个）
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 清理行首行尾空格
  cleaned = cleaned.split('\n').map(line => line.trimEnd()).join('\n');

  return cleaned.trim();
}

/**
 * 提取文章标题
 */
function extractTitle(content: string): string {
  // 匹配第一个 # 标题
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  // 如果没有标题，取第一行非空内容
  const firstLine = content.split('\n').find(line => line.trim());
  return firstLine?.slice(0, 50) || 'Untitled';
}

/**
 * 计算阅读时间
 */
function calculateReadTime(content: string): string {
  // 中文字符
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 英文单词
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  // 中文 400 字/分钟，英文 200 词/分钟
  const minutes = Math.ceil(chineseChars / 400 + englishWords / 200);
  return `${Math.max(1, minutes)} min read`;
}

/**
 * 调用 DeepSeek API 生成 frontmatter
 */
async function generateFrontmatter(content: string, title: string): Promise<Frontmatter> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
  }

  const readTime = calculateReadTime(content);
  const today = new Date().toISOString().split('T')[0];

  // 截取前 2000 字符用于分析
  const contentPreview = content.slice(0, 2000);

  const prompt = `分析以下 Markdown 文章，生成 JSON 格式的 frontmatter 信息。

要求：
1. tags: 根据内容推断 3-5 个相关标签（中文或英文皆可）
2. category: 从 ["Engineering", "AI", "iOS", "DevOps", "Career", "Life"] 中选择最合适的一个
3. excerpt: 生成 50-100 字的中文摘要，概括文章核心内容

只返回 JSON，不要任何解释：
{
  "tags": ["标签1", "标签2", "标签3"],
  "category": "类别",
  "excerpt": "摘要内容"
}

文章标题: ${title}

文章内容:
${contentPreview}`;

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
    throw new Error(`DeepSeek API 错误: ${response.status} - ${error}`);
  }

  const data = await response.json() as any;
  const responseText = data.choices[0].message.content;

  // 解析 JSON（处理可能的 markdown 代码块）
  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  const parsed = JSON.parse(jsonStr.trim());

  return {
    title,
    date: today,
    tags: parsed.tags || ['未分类'],
    category: parsed.category || 'Engineering',
    readTime,
    featured: false,
    image: '/blog/images/default.jpg',
    excerpt: parsed.excerpt || title,
  };
}

/**
 * 生成 YAML frontmatter 字符串
 */
function formatFrontmatter(fm: Frontmatter): string {
  const tagsStr = JSON.stringify(fm.tags);
  return `---
title: "${fm.title.replace(/"/g, '\\"')}"
date: "${fm.date}"
tags: ${tagsStr}
category: "${fm.category}"
readTime: "${fm.readTime}"
featured: ${fm.featured}
image: "${fm.image}"
excerpt: "${fm.excerpt.replace(/"/g, '\\"')}"
---`;
}

/**
 * 生成博客文件名
 */
function generateBlogFilename(title: string): string {
  const date = new Date().toISOString().split('T')[0];
  // 将中文标题转为拼音或简单处理
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  return `${date}-${slug}.md`;
}

/**
 * 扫描语雀文档目录
 */
async function scanYuqueDocs(): Promise<string[]> {
  const files: string[] = [];
  
  async function scan(dir: string) {
    if (!existsSync(dir)) return;

    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'images' && !entry.name.startsWith('.')) {
        await scan(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(YUQUE_DOCS_DIR);
  return files;
}

/**
 * 复制图片到博客目录
 */
async function copyImages(): Promise<void> {
  const yuqueImagesDir = path.join(YUQUE_DOCS_DIR, 'images');
  if (existsSync(yuqueImagesDir)) {
    mkdirSync(BLOG_IMAGES_DIR, { recursive: true });
    cpSync(yuqueImagesDir, BLOG_IMAGES_DIR, { recursive: true, force: true });
    console.log(`📷 已复制图片到 ${BLOG_IMAGES_DIR}`);
  }
}

/**
 * 处理单个文件
 */
async function processFile(filePath: string): Promise<ConvertResult> {
  const filename = path.basename(filePath);

  try {
    console.log(`📝 处理: ${filename}`);

    const rawContent = await fs.readFile(filePath, 'utf-8');

    // 跳过已有 frontmatter 的文件
    if (rawContent.startsWith('---\n')) {
      console.log(`   ⏭️  跳过（已有 frontmatter）`);
      return { success: true, file: filename };
    }

    // 1. 用脚本清理 HTML 标签
    console.log(`   🧹 清理 HTML 标签...`);
    const cleanedContent = cleanHtmlTags(rawContent);

    // 2. 提取标题
    const title = extractTitle(cleanedContent);
    console.log(`   📖 标题: ${title}`);

    // 3. 调用 DeepSeek 生成 frontmatter
    console.log(`   🤖 生成 frontmatter...`);
    const frontmatter = await generateFrontmatter(cleanedContent, title);

    // 4. 移除原文中的第一个标题（frontmatter 中已有 title）
    const contentWithoutTitle = cleanedContent.replace(/^#\s+.+\n+/, '');

    // 5. 组合 frontmatter + 清理后的内容
    const finalContent = formatFrontmatter(frontmatter) + '\n\n' + contentWithoutTitle;

    // 生成输出文件名
    const outputFilename = generateBlogFilename(title);
    const outputPath = path.join(BLOG_OUTPUT_DIR, outputFilename);

    // 写入文件
    mkdirSync(BLOG_OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputPath, finalContent);

    console.log(`   ✅ 已转换: ${outputFilename}`);
    return { success: true, file: outputFilename };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`   ❌ 失败: ${message}`);
    return { success: false, file: filename, error: message };
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('\n🚀 开始转换语雀文章为博客格式\n');
  console.log('─'.repeat(50));

  // 检查 API Key
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('❌ 请设置 DEEPSEEK_API_KEY 环境变量');
    process.exit(1);
  }

  // 扫描文档
  const files = await scanYuqueDocs();
  if (files.length === 0) {
    console.log('📭 没有找到需要转换的文档');
    return;
  }

  console.log(`📚 找到 ${files.length} 个文档\n`);

  // 复制图片
  await copyImages();

  // 处理每个文件
  const results: ConvertResult[] = [];
  for (const file of files) {
    const result = await processFile(file);
    results.push(result);

    // 添加延迟避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 输出统计
  console.log('\n' + '─'.repeat(50));
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n📊 转换完成`);
  console.log(`   成功: ${successful}`);
  console.log(`   失败: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ 失败的文件:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.file}: ${r.error}`);
    });
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});

