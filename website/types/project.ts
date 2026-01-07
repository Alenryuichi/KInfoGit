/**
 * Project 类型定义模块
 * 定义展示层使用的统一项目数据结构
 * @module types/project
 */

/**
 * 项目相关链接
 */
export interface ProjectLinks {
  /** 演示/线上地址 */
  demo?: string;
  /** GitHub 仓库地址 */
  github?: string;
  /** 相关文章链接 */
  article?: string;
}

/**
 * Project 项目数据模型
 * 用于展示层的统一项目数据结构
 */
export interface Project {
  /** 唯一标识符，用于路由和数据查询 */
  id: string;
  /** 项目标题 */
  title: string;
  /** URL 友好的标识符，用于 /work/[slug] 路由 */
  slug: string;
  /** 简短描述，用于卡片展示（建议 50-100 字） */
  description: string;
  /** 是否在首页精选区域展示 */
  featured: boolean;
  /** 排序权重，数字越小越靠前 */
  order: number;
  /** 项目类别（如 system-architecture, anti-fraud） */
  category: string;
  /** 技术标签数组 */
  tags: string[];
  /** 担任的角色 */
  role: string;
  /** 时间段（如 "2022-2024"） */
  period: string;
  /** 缩略图路径，相对于 public 目录 */
  thumbnail?: string;
  /** 相关链接 */
  links?: ProjectLinks;
  /** 是否有 MDX 详情页 */
  hasDetailPage: boolean;
}

/**
 * Project 类型守卫函数
 * 用于运行时类型检查
 * @param obj - 待检查的对象
 * @returns 是否为有效的 Project 对象
 */
export function isProject(obj: unknown): obj is Project {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  const p = obj as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.slug === 'string' &&
    typeof p.description === 'string' &&
    typeof p.featured === 'boolean' &&
    typeof p.order === 'number' &&
    typeof p.category === 'string' &&
    Array.isArray(p.tags) &&
    typeof p.role === 'string' &&
    typeof p.period === 'string' &&
    typeof p.hasDetailPage === 'boolean'
  );
}

