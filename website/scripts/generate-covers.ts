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
  const displayTags = post.tags.slice(0, 3);
  
  // Design System Colors
  const bgDark = '#030712'; // gray-950
  const textSecondary = '#9CA3AF'; // gray-400
  
  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: bgDark,
        color: 'white',
        fontFamily: 'Noto Sans SC, Inter',
        position: 'relative',
        overflow: 'hidden',
        padding: '60px', // Content safe area
      },
      children: [
        // 1. Background Grid Pattern (Full Bleed)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
            },
          },
        },
        
        // 2. Spotlight / Gradient Orb (Top Right & Bottom Left)
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '-150px',
              right: '-150px',
              width: '800px',
              height: '800px',
              background: `radial-gradient(circle, ${theme.from} 0%, transparent 70%)`,
              opacity: 0.15,
              filter: 'blur(80px)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: '-200px',
              left: '-200px',
              width: '600px',
              height: '600px',
              background: `radial-gradient(circle, ${theme.to} 0%, transparent 70%)`,
              opacity: 0.1,
              filter: 'blur(80px)',
            },
          },
        },

        // 3. Content Layer (Direct layout, no inner card)
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              zIndex: 10,
            },
            children: [
              // Header: Window Controls + Category
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  },
                  children: [
                    // Window Controls (Decoration)
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', gap: '10px' },
                        children: [
                          { type: 'div', props: { style: { width: '14px', height: '14px', borderRadius: '50%', background: '#EF4444' } } },
                          { type: 'div', props: { style: { width: '14px', height: '14px', borderRadius: '50%', background: '#EAB308' } } },
                          { type: 'div', props: { style: { width: '14px', height: '14px', borderRadius: '50%', background: '#22C55E' } } },
                        ],
                      },
                    },
                    // Category
                    {
                      type: 'div',
                      props: {
                        style: {
                          padding: '6px 16px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '100px',
                          color: theme.to,
                          fontSize: '14px',
                          fontWeight: '600',
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        },
                        children: [
                          { type: 'span', props: { style: { fontSize: '12px' }, children: '✦' } },
                          { type: 'span', props: { children: post.category } },
                        ],
                      },
                    },
                  ],
                },
              },
              
              // Title Area
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                  },
                  children: [
                    {
                      type: 'h1',
                      props: {
                        style: {
                          fontSize: post.title.length > 30 ? '64px' : '80px',
                          fontWeight: '800',
                          lineHeight: 1.1,
                          margin: 0,
                          // Use a slight gradient for text to give it sheen
                          background: 'linear-gradient(to bottom right, #ffffff, #cbd5e1)',
                          backgroundClip: 'text',
                          color: 'transparent',
                          letterSpacing: '-0.03em',
                        },
                        children: post.title,
                      },
                    },
                    // Decorative line
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '80px',
                          height: '4px',
                          background: `linear-gradient(90deg, ${theme.from}, ${theme.to})`,
                          borderRadius: '2px',
                        },
                      },
                    },
                  ],
                },
              },
              
              // Footer: Tags + Meta
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  },
                  children: [
                    // Tags
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          gap: '12px',
                        },
                        children: displayTags.map(tag => ({
                          type: 'div',
                          props: {
                            style: {
                              fontSize: '16px',
                              color: textSecondary,
                              fontFamily: 'monospace',
                            },
                            children: `#${tag}`,
                          },
                        })),
                      },
                    },
                    
                    // Meta Info
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          gap: '24px',
                          fontSize: '16px',
                          color: textSecondary,
                          fontFamily: 'monospace',
                          opacity: 0.8,
                        },
                        children: [
                          { type: 'span', props: { children: post.date } },
                          { type: 'span', props: { children: '//' } },
                          { type: 'span', props: { children: post.readTime } },
                        ],
                      },
                    },
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

  const svg = await satori(element as React.ReactNode, {
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

