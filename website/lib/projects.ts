/**
 * 项目数据获取模块
 * 封装项目数据的获取逻辑，提供统一的 API 供页面组件使用
 * @module lib/projects
 */
import { type Project, isProject } from '@/types/project';
import projectsData from '../../profile-data/projects.json';

// Re-export Project type for convenient single-import usage
export type { Project } from '@/types/project';
export { isProject } from '@/types/project';

// Runtime validation to catch data format errors early
if (!Array.isArray(projectsData)) {
  throw new Error('projects.json must be an array');
}

// Validate each project at load time
const projects: Project[] = projectsData.map((item, index) => {
  if (!isProject(item)) {
    throw new Error(`Invalid project data at index ${index}`);
  }
  return item;
});

// Cached featured projects (computed once at load time)
const featuredProjectsCache: Project[] = projects
  .filter((p) => p.featured)
  .sort((a, b) => a.order - b.order);

/**
 * 获取所有项目
 * @returns 所有项目的数组副本
 * @example
 * const allProjects = getAllProjects();
 * console.log(`Total: ${allProjects.length} projects`);
 */
export function getAllProjects(): Project[] {
  return [...projects];
}

/**
 * 获取精选项目（featured=true），按 order 升序排序
 * @returns 精选项目数组副本，按 order 从小到大排序
 * @example
 * const featured = getFeaturedProjects();
 * // Returns projects with order 1, 2, 3 (if they exist)
 */
export function getFeaturedProjects(): Project[] {
  return [...featuredProjectsCache];
}

/**
 * 根据 slug 获取单个项目
 * @param slug - 项目的 URL 友好标识符
 * @returns 匹配的项目，如果不存在则返回 undefined
 * @example
 * const project = getProjectBySlug('portrait-platform');
 * if (project) {
 *   console.log(project.title); // "画像中台系统"
 * }
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/**
 * 获取项目统计信息
 * @returns 项目总数和精选项目数
 */
export function getProjectStats(): { total: number; featured: number } {
  return {
    total: projects.length,
    featured: featuredProjectsCache.length,
  };
}

