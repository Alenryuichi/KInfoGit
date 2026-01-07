/**
 * Blog Cover Image Generator
 * 使用 Satori 将 React 组件渲染为 SVG，再用 @resvg/resvg-js 转为 PNG
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 配置
const BLOG_DIR = path.join(__dirname, '../../profile-data/blog');
const OUTPUT_DIR = path.join(__dirname, '../public/blog/covers');
const FONTS_DIR = path.join(__dirname, 'fonts');

// 封面尺寸 (OG Image 标准尺寸)
const WIDTH = 1200;
const HEIGHT = 630;

// 字体文件最小有效大小 (100KB)
const MIN_FONT_FILE_SIZE = 100_000;

// 跟踪是否有错误发生
let hasErrors = false;

// 渐变背景颜色主题
const GRADIENT_THEMES = [
  { from: '#667eea', to: '#764ba2' }, // 紫蓝
  { from: '#f093fb', to: '#f5576c' }, // 粉红
  { from: '#4facfe', to: '#00f2fe' }, // 蓝青
  { from: '#43e97b', to: '#38f9d7' }, // 绿青
  { from: '#fa709a', to: '#fee140' }, // 粉黄
  { from: '#a18cd1', to: '#fbc2eb' }, // 淡紫粉
  { from: '#ff9a9e', to: '#fecfef' }, // 粉色
  { from: '#667eea', to: '#f093fb' }, // 紫粉
];

// 根据标题哈希选择主题
function getThemeForTitle(title: string): typeof GRADIENT_THEMES[0] {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash = hash & hash;
  }
  return GRADIENT_THEMES[Math.abs(hash) % GRADIENT_THEMES.length];
}

// 封面模板 React 元素 (使用对象格式，Satori 支持)
function createCoverElement(post: {
  title: string;
  tags: string[];
  category: string;
  readTime: string;
  date: string;
}) {
  const theme = getThemeForTitle(post.title);
  const displayTags = post.tags.slice(0, 4);

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px',
        background: `linear-gradient(135deg, ${theme.from} 0%, ${theme.to} 100%)`,
        fontFamily: 'Noto Sans SC, Inter',
      },
      children: [
        // 顶部: BLOG 标签
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 20px',
                    borderRadius: '20px',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  },
                  children: '📖 BLOG',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '16px',
                  },
                  children: post.category,
                },
              },
            ],
          },
        },
        // 中间: 标题
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    color: 'white',
                    fontSize: post.title.length > 40 ? '42px' : '52px',
                    fontWeight: 'bold',
                    lineHeight: 1.2,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                  },
                  children: post.title,
                },
              },
            ],
          },
        },
        // 底部: 标签和元信息
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            },
            children: [
              // 标签
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                  },
                  children: displayTags.map(tag => ({
                    type: 'div',
                    props: {
                      style: {
                        background: 'rgba(255,255,255,0.25)',
                        padding: '6px 14px',
                        borderRadius: '16px',
                        color: 'white',
                        fontSize: '14px',
                      },
                      children: `#${tag}`,
                    },
                  })),
                },
              },
              // 元信息
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    gap: '20px',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '16px',
                  },
                  children: [
                    { type: 'span', props: { children: `⏱️ ${post.readTime}` } },
                    { type: 'span', props: { children: `📅 ${post.date}` } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// 网络请求超时时间 (毫秒)
const NETWORK_TIMEOUT = 30_000;

/**
 * 带超时的 fetch 请求
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 从 Google Fonts API 加载字体
 * 支持超时和错误处理
 */
async function loadFontFromGoogle(fontName: string): Promise<Buffer> {
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;

  // 获取 CSS
  const cssResponse = await fetchWithTimeout(googleFontUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
    }
  });

  if (!cssResponse.ok) {
    throw new Error(`Failed to fetch font CSS: ${cssResponse.status} ${cssResponse.statusText}`);
  }

  const css = await cssResponse.text();

  // 从 CSS 中提取字体 URL
  const urlMatch = css.match(/src:\s*url\(([^)]+)\)/);
  if (!urlMatch) {
    throw new Error(`Could not find font URL in CSS for ${fontName}`);
  }

  const fontUrl = urlMatch[1];
  const fontResponse = await fetchWithTimeout(fontUrl);

  if (!fontResponse.ok) {
    throw new Error(`Failed to download font: ${fontResponse.status} ${fontResponse.statusText}`);
  }

  const arrayBuffer = await fontResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// 加载字体 - 优先本地，否则从 Google Fonts 加载
async function loadFonts() {
  const notoSansPath = path.join(FONTS_DIR, 'NotoSansSC-Regular.ttf');

  const fonts = [];

  // 尝试加载本地 Noto Sans SC
  if (fs.existsSync(notoSansPath)) {
    const stat = fs.statSync(notoSansPath);
    if (stat.size > MIN_FONT_FILE_SIZE) {
      fonts.push({
        name: 'Noto Sans SC',
        data: fs.readFileSync(notoSansPath),
        weight: 400 as const,
        style: 'normal' as const,
      });
    }
  }

  // 如果本地字体不存在或无效，从 Google Fonts 加载
  if (fonts.length === 0) {
    console.log('📥 从 Google Fonts 下载字体...');
    try {
      const notoSansData = await loadFontFromGoogle('Noto+Sans+SC:wght@400');
      fonts.push({
        name: 'Noto Sans SC',
        data: notoSansData,
        weight: 400 as const,
        style: 'normal' as const,
      });
    } catch (error) {
      console.error('❌ 无法加载 Noto Sans SC 字体:', error);
    }
  }

  return fonts;
}

// 生成单个封面
async function generateCover(
  post: { slug: string; title: string; tags: string[]; category: string; readTime: string; date: string },
  fonts: Awaited<ReturnType<typeof loadFonts>>
) {
  const element = createCoverElement(post);

  const svg = await satori(element as any, {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    background: 'rgba(255, 255, 255, 1)',
    fitTo: {
      mode: 'width',
      value: WIDTH,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outputPath = path.join(OUTPUT_DIR, `${post.slug}.png`);
  fs.writeFileSync(outputPath, pngBuffer);

  return outputPath;
}

// 主函数
async function main() {
  console.log('🎨 开始生成博客封面...\n');

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 加载字体
  const fonts = await loadFonts();
  if (fonts.length === 0) {
    console.error('❌ 未找到字体文件，请确保 scripts/fonts/ 目录下有字体文件');
    process.exit(1);
  }
  console.log(`📝 已加载 ${fonts.length} 个字体\n`);

  // 读取所有博客文章
  const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));

  let generated = 0;
  let skipped = 0;

  for (const file of blogFiles) {
    const slug = file.replace(/\.md$/, '');
    const filePath = path.join(BLOG_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);

    const outputPath = path.join(OUTPUT_DIR, `${slug}.png`);

    // 检查是否需要重新生成 (源文件更新时间比封面新)
    if (fs.existsSync(outputPath)) {
      const srcStat = fs.statSync(filePath);
      const outStat = fs.statSync(outputPath);
      if (outStat.mtime > srcStat.mtime) {
        console.log(`⏭️  跳过 (已存在): ${slug}`);
        skipped++;
        continue;
      }
    }

    const post = {
      slug,
      title: data.title || slug,
      tags: data.tags || [],
      category: data.category || 'Blog',
      readTime: data.readTime || '5 min read',
      date: data.date || '',
    };

    try {
      await generateCover(post, fonts);
      console.log(`✅ 生成成功: ${slug}.png`);
      generated++;
    } catch (error) {
      console.error(`❌ 生成失败: ${slug}`, error);
      hasErrors = true;
    }
  }

  console.log(`\n🎉 完成! 生成 ${generated} 个, 跳过 ${skipped} 个`);

  // 如果有任何错误，设置非零退出码供 CI 检测
  if (hasErrors) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exitCode = 1;
});

