#!/usr/bin/env npx tsx
/**
 * 语雀文章转换为博客格式
 * 使用 DeepSeek API 清理 HTML 标签并生成 frontmatter
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

/**
 * 调用 DeepSeek API 转换文章
 */
async function convertWithDeepSeek(content: string, filename: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 环境变量未设置');
  }

  const prompt = `你是一个 Markdown 格式化专家。请将以下语雀导出的文章转换为标准博客格式。

要求：
1. 移除所有 <font>、<span>、<div> 等 HTML 标签，保留纯 Markdown
2. 保留代码块、链接、图片等 Markdown 语法
3. 在文章开头添加 YAML frontmatter，包含：
   - title: 从第一个 # 标题或文章内容提取
   - date: "${new Date().toISOString().split('T')[0]}"
   - tags: 根据内容推断 3-5 个相关标签（用数组格式）
   - category: 从 ["Engineering", "AI", "iOS", "DevOps", "Career"] 中选择最合适的
   - readTime: 根据字数估算阅读时间（中文约 400 字/分钟），格式如 "5 min read"
   - featured: false
   - image: "/blog/images/default.jpg"
   - excerpt: 提取或生成 100 字以内的文章摘要
4. 修复图片路径：将 images/xxx.png 改为 /blog/images/xxx.png
5. 统一标题层级，确保文章只有一个 # 标题
6. 直接返回转换后的完整 Markdown，不要有任何解释

原文件名: ${filename}

原文：
${content}`;

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
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API 错误: ${response.status} - ${error}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content;
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
    
    const content = await fs.readFile(filePath, 'utf-8');
    
    // 跳过已有 frontmatter 的文件
    if (content.startsWith('---\n')) {
      console.log(`   ⏭️  跳过（已有 frontmatter）`);
      return { success: true, file: filename };
    }
    
    // 调用 DeepSeek 转换
    const converted = await convertWithDeepSeek(content, filename);
    
    // 生成输出文件名
    const titleMatch = converted.match(/title:\s*["']?([^"'\n]+)["']?/);
    const title = titleMatch ? titleMatch[1] : filename.replace('.md', '');
    const outputFilename = generateBlogFilename(title);
    const outputPath = path.join(BLOG_OUTPUT_DIR, outputFilename);
    
    // 写入文件
    mkdirSync(BLOG_OUTPUT_DIR, { recursive: true });
    await fs.writeFile(outputPath, converted);
    
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

