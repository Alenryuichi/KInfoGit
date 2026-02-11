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
const BLOG_COVERS_DIR = path.join(ROOT_DIR, 'website/public/blog/covers');
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

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
 * 使用通义万相生成 AI 背景 + Sharp 叠加文字
 * 最佳实践：AI 生成抽象背景，代码精确控制文字排版
 */
async function generateCoverImage(
  title: string,
  excerpt: string,
  slug: string,
  tags: string[] = [],
  category: string = 'Blog'
): Promise<string> {
  const apiKey = process.env.QWEN_API_KEY;

  // 封面尺寸 (OG Image 标准)
  const WIDTH = 1200;
  const HEIGHT = 630;

  mkdirSync(BLOG_COVERS_DIR, { recursive: true });
  const imageName = `${slug}.png`;
  const imagePath = path.join(BLOG_COVERS_DIR, imageName);

  try {
    // Step 1: 生成 AI 抽象背景
    let backgroundBuffer: Buffer;

    if (apiKey) {
      console.log(`   🎨 生成 AI 背景...`);
      backgroundBuffer = await generateAIBackground(apiKey, title, WIDTH, HEIGHT);
    } else {
      console.log(`   ⚠️  未设置 QWEN_API_KEY，使用渐变背景`);
      backgroundBuffer = await generateGradientBackground(title, WIDTH, HEIGHT);
    }

    // Step 2: 使用 Sharp 叠加文字层
    console.log(`   ✍️  叠加文字层...`);
    const finalImage = await composeCoverWithText(
      backgroundBuffer,
      title,
      tags.slice(0, 3),
      category,
      WIDTH,
      HEIGHT
    );

    await fs.writeFile(imagePath, finalImage);
    console.log(`   🎨 封面已生成: ${imageName}`);
    return `/blog/covers/${imageName}`;

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`   ⚠️  生成封面异常: ${message}，使用备用方案`);

    // 备用方案：纯渐变 + 文字
    try {
      const fallbackBg = await generateGradientBackground(title, WIDTH, HEIGHT);
      const fallbackImage = await composeCoverWithText(fallbackBg, title, tags.slice(0, 3), category, WIDTH, HEIGHT);
      await fs.writeFile(imagePath, fallbackImage);
      console.log(`   🎨 封面已生成 (备用): ${imageName}`);
      return `/blog/covers/${imageName}`;
    } catch {
      return '/blog/images/default.jpg';
    }
  }
}

/**
 * 调用通义万相生成抽象背景图
 */
async function generateAIBackground(apiKey: string, title: string, width: number, height: number): Promise<Buffer> {
  // 根据标题提取关键词，生成相关的视觉元素
  const keywords = extractKeywords(title);
  const visualTheme = getVisualTheme(keywords);

  // 通义万相优化 prompt - 简洁、具体、中文友好
  const prompt = `${visualTheme.scene}，科技感数字艺术背景。
风格：${visualTheme.style}，深色主题，${visualTheme.colors}渐变。
元素：${visualTheme.elements}，光效，景深模糊。
构图：简洁留白，适合叠加文字，无文字无人物。
质量：高清，4K，专业设计感。`;

  // 提交生成任务
  const response = await fetch(QWEN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: { prompt },
      parameters: {
        style: '<auto>',
        size: '1280*720',
        n: 1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`AI 生成失败: ${response.status}`);
  }

  const data = await response.json() as any;
  const taskId = data.output?.task_id;
  if (!taskId) {
    console.log(`      ❌ API 响应: ${JSON.stringify(data)}`);
    throw new Error('未获取到任务ID');
  }
  console.log(`      📋 任务ID: ${taskId}`);

  // 轮询等待（最多 90 次，每次 4 秒 = 6 分钟，通义万相队列可能较慢）
  const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  for (let i = 0; i < 90; i++) {
    await new Promise(resolve => setTimeout(resolve, 4000));
    const taskResponse = await fetch(taskUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const taskData = await taskResponse.json() as any;
    const status = taskData.output?.task_status;

    // 每 20 秒输出一次状态
    if (i % 5 === 0) {
      console.log(`      ⏳ ${status} (${Math.floor(i * 4 / 60)}m${(i * 4) % 60}s)`);
    }

    if (status === 'SUCCEEDED') {
      const imageUrl = taskData.output?.results?.[0]?.url;
      if (imageUrl) {
        const imgResponse = await fetch(imageUrl);
        const buffer = Buffer.from(await imgResponse.arrayBuffer());
        // 调整尺寸并添加暗化遮罩，让文字更清晰
        const sharp = (await import('sharp')).default;
        return await sharp(buffer)
          .resize(width, height, { fit: 'cover' })
          .composite([{
            input: Buffer.from(
              `<svg width="${width}" height="${height}">
                <defs>
                  <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:rgba(0,0,0,0.3)"/>
                    <stop offset="50%" style="stop-color:rgba(0,0,0,0.5)"/>
                    <stop offset="100%" style="stop-color:rgba(0,0,0,0.7)"/>
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#overlay)"/>
              </svg>`
            ),
            top: 0,
            left: 0,
          }])
          .png()
          .toBuffer();
      }
    } else if (status === 'FAILED') {
      throw new Error('AI 生成任务失败');
    }
  }
  throw new Error('AI 生成超时');
}

/**
 * 生成渐变背景（备用方案）
 */
async function generateGradientBackground(title: string, width: number, height: number): Promise<Buffer> {
  // 根据标题哈希选择渐变色
  const gradients = [
    { from: '#667eea', to: '#764ba2' },
    { from: '#f093fb', to: '#f5576c' },
    { from: '#4facfe', to: '#00f2fe' },
    { from: '#43e97b', to: '#38f9d7' },
    { from: '#fa709a', to: '#fee140' },
    { from: '#a18cd1', to: '#fbc2eb' },
  ];

  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash = hash & hash;
  }
  const theme = gradients[Math.abs(hash) % gradients.length];

  const sharp = (await import('sharp')).default;

  // 创建渐变背景 + 网格图案
  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.from};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${theme.to};stop-opacity:1" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="#0a0a0a"/>
      <rect width="100%" height="100%" fill="url(#grad)" opacity="0.6"/>
      <rect width="100%" height="100%" fill="url(#grid)"/>
      <!-- 光晕效果 -->
      <ellipse cx="${width * 0.8}" cy="${height * 0.2}" rx="400" ry="300" fill="${theme.from}" opacity="0.15" filter="blur(80px)"/>
      <ellipse cx="${width * 0.2}" cy="${height * 0.8}" rx="300" ry="250" fill="${theme.to}" opacity="0.15" filter="blur(80px)"/>
    </svg>
  `;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

/**
 * 使用 Sharp 在背景上叠加文字
 */
async function composeCoverWithText(
  background: Buffer,
  title: string,
  tags: string[],
  category: string,
  width: number,
  height: number
): Promise<Buffer> {
  const sharp = (await import('sharp')).default;

  // 计算文字大小（标题长度决定字号）
  const titleFontSize = title.length > 25 ? 48 : title.length > 15 ? 56 : 64;
  const titleLineHeight = titleFontSize * 1.2;

  // 文字换行处理
  const maxCharsPerLine = title.length > 25 ? 20 : 25;
  const titleLines = wrapText(title, maxCharsPerLine);

  // 生成标签 SVG
  const tagsSvg = tags.map((tag, i) => {
    const x = 60 + i * 100;
    return `
      <rect x="${x}" y="${height - 100}" width="90" height="28" rx="14" fill="rgba(255,255,255,0.15)"/>
      <text x="${x + 45}" y="${height - 82}" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="500" fill="rgba(255,255,255,0.9)" text-anchor="middle">${escapeXml(tag)}</text>
    `;
  }).join('');

  // 生成标题 SVG（多行）
  const titleSvg = titleLines.map((line, i) => {
    const y = height / 2 - (titleLines.length - 1) * titleLineHeight / 2 + i * titleLineHeight;
    return `<text x="60" y="${y}" font-family="Inter, system-ui, sans-serif" font-size="${titleFontSize}" font-weight="700" fill="white">${escapeXml(line)}</text>`;
  }).join('');

  // 完整的文字层 SVG
  const textOverlay = `
    <svg width="${width}" height="${height}">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap');
      </style>

      <!-- 分类标签 -->
      <rect x="60" y="50" width="${category.length * 10 + 24}" height="28" rx="4" fill="rgba(99, 102, 241, 0.8)"/>
      <text x="72" y="69" font-family="Inter, system-ui, sans-serif" font-size="12" font-weight="600" fill="white" text-transform="uppercase" letter-spacing="1">${escapeXml(category.toUpperCase())}</text>

      <!-- 标题 -->
      ${titleSvg}

      <!-- 装饰线 -->
      <rect x="60" y="${height / 2 + titleLines.length * titleLineHeight / 2 + 20}" width="80" height="4" rx="2" fill="url(#accentGrad)"/>

      <!-- 标签 -->
      ${tagsSvg}

      <!-- 品牌 Logo -->
      <text x="${width - 60}" y="${height - 40}" font-family="Inter, system-ui, sans-serif" font-size="14" font-weight="600" fill="rgba(255,255,255,0.6)" text-anchor="end">KM Blog</text>

      <defs>
        <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#6366f1"/>
          <stop offset="100%" style="stop-color:#a855f7"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  return await sharp(background)
    .composite([{
      input: Buffer.from(textOverlay),
      top: 0,
      left: 0,
    }])
    .png()
    .toBuffer();
}

/**
 * 文字换行
 */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxChars) {
      currentLine = (currentLine + ' ' + word).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // 如果是中文，按字符数分割
  if (lines.length === 1 && text.length > maxChars) {
    const chars = text.split('');
    lines.length = 0;
    for (let i = 0; i < chars.length; i += maxChars) {
      lines.push(chars.slice(i, i + maxChars).join(''));
    }
  }

  return lines.slice(0, 3); // 最多 3 行
}

/**
 * XML 转义
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * 从标题提取关键词
 */
function extractKeywords(title: string): string[] {
  const techKeywords: Record<string, string[]> = {
    // 前端
    'react|vue|angular|svelte': ['前端', '组件', 'UI'],
    'css|样式|布局|grid|flex': ['设计', '布局', '视觉'],
    'next|nuxt|remix': ['框架', '全栈', 'SSR'],
    // 后端
    'node|python|go|rust|java': ['后端', '服务器', '编程'],
    'api|接口|graphql|rest': ['接口', '数据', '连接'],
    'database|数据库|sql|mongo': ['数据', '存储', '结构'],
    // AI/ML
    'ai|人工智能|机器学习|ml|深度学习': ['AI', '智能', '神经网络'],
    'gpt|llm|大模型|chatgpt': ['AI对话', '语言模型', '智能'],
    // DevOps
    'git|版本|commit': ['版本控制', '协作', '代码'],
    'docker|k8s|kubernetes|部署': ['容器', '云原生', '部署'],
    'ci|cd|自动化|workflow': ['自动化', '流水线', '效率'],
    // 通用
    '测试|test|单元测试': ['测试', '质量', '验证'],
    '性能|优化|performance': ['性能', '速度', '优化'],
    '安全|security|加密': ['安全', '防护', '加密'],
  };

  const lowerTitle = title.toLowerCase();
  for (const [pattern, keywords] of Object.entries(techKeywords)) {
    if (new RegExp(pattern, 'i').test(lowerTitle)) {
      return keywords;
    }
  }
  return ['科技', '数字', '创新'];
}

/**
 * 根据关键词生成视觉主题
 */
function getVisualTheme(keywords: string[]): { scene: string; style: string; colors: string; elements: string } {
  const themes: Record<string, { scene: string; style: string; colors: string; elements: string }> = {
    '前端': { scene: '抽象的用户界面层叠', style: '扁平化设计', colors: '蓝紫色', elements: '几何方块、线条网格' },
    'AI': { scene: '神经网络节点连接', style: '未来科技感', colors: '青蓝色', elements: '光点、连接线、波纹' },
    '智能': { scene: '数据流动的抽象空间', style: '赛博朋克', colors: '紫青色', elements: '粒子、光束、全息' },
    '数据': { scene: '数据可视化抽象图', style: '信息图表风', colors: '蓝绿色', elements: '图表、节点、流线' },
    '版本控制': { scene: '分支合并的抽象树形', style: '极简线条', colors: '橙蓝色', elements: '分支线、节点、箭头' },
    '容器': { scene: '模块化堆叠的立方体', style: '3D等距', colors: '蓝紫色', elements: '立方体、连接器、层次' },
    '自动化': { scene: '齿轮与流程的融合', style: '机械美学', colors: '金蓝色', elements: '齿轮、箭头、循环' },
    '性能': { scene: '速度与能量的抽象', style: '动感流线', colors: '红橙色', elements: '光速线、能量波' },
    '安全': { scene: '盾牌与锁的数字化', style: '坚固稳重', colors: '深蓝绿', elements: '盾牌、锁、防护层' },
    '设计': { scene: '色彩与形状的和谐', style: '艺术抽象', colors: '多彩渐变', elements: '色块、曲线、层叠' },
  };

  for (const keyword of keywords) {
    if (themes[keyword]) return themes[keyword];
  }

  // 默认科技主题
  return {
    scene: '抽象的数字科技空间',
    style: '现代极简',
    colors: '深蓝紫色',
    elements: '几何图形、光效、渐变'
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

    // 检查输出文件是否已存在（避免重复调用 AI）
    const outputFilename = generateBlogFilename(title);
    const outputPath = path.join(BLOG_OUTPUT_DIR, outputFilename);
    if (existsSync(outputPath)) {
      console.log(`   ⏭️  跳过（博客已存在: ${outputFilename}）`);
      return { success: true, file: outputFilename };
    }

    // 3. 调用 DeepSeek 生成 frontmatter
    console.log(`   🤖 生成 frontmatter...`);
    const frontmatter = await generateFrontmatter(cleanedContent, title);

    // 4. 生成封面图（传入 tags 和 category 用于文字叠加）
    const slug = outputFilename.replace('.md', '');
    console.log(`   🎨 生成封面图...`);
    frontmatter.image = await generateCoverImage(
      title,
      frontmatter.excerpt,
      slug,
      frontmatter.tags || [],
      frontmatter.category || 'Blog'
    );

    // 5. 移除原文中的第一个标题（frontmatter 中已有 title）
    const contentWithoutTitle = cleanedContent.replace(/^#\s+.+\n+/, '');

    // 6. 组合 frontmatter + 清理后的内容
    const finalContent = formatFrontmatter(frontmatter) + '\n\n' + contentWithoutTitle;

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

