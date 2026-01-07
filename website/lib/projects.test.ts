/**
 * 项目数据获取函数测试
 * @module lib/projects.test
 */
import { describe, it, expect } from 'vitest';
import {
  getAllProjects,
  getFeaturedProjects,
  getProjectBySlug,
  getProjectStats,
  type Project,
} from './projects';

describe('projects lib', () => {
  describe('getAllProjects', () => {
    it('should return a non-empty array', () => {
      const result = getAllProjects();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return an array of valid Project objects', () => {
      const result = getAllProjects();
      expect(Array.isArray(result)).toBe(true);
      result.forEach((project) => {
        expect(project).toHaveProperty('id');
        expect(project).toHaveProperty('title');
        expect(project).toHaveProperty('slug');
        expect(project).toHaveProperty('featured');
        expect(project).toHaveProperty('order');
        expect(project).toHaveProperty('category');
        expect(project).toHaveProperty('tags');
        expect(project).toHaveProperty('role');
        expect(project).toHaveProperty('period');
        expect(project).toHaveProperty('hasDetailPage');
      });
    });

    it('should return a copy, not the original array', () => {
      const result1 = getAllProjects();
      const result2 = getAllProjects();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('getFeaturedProjects', () => {
    it('should return only featured projects', () => {
      const result = getFeaturedProjects();
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.featured === true)).toBe(true);
    });

    it('should be sorted by order ascending', () => {
      const result = getFeaturedProjects();
      for (let i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThan(result[i - 1].order);
      }
    });

    it('should return fewer or equal projects than getAllProjects', () => {
      const all = getAllProjects();
      const featured = getFeaturedProjects();
      expect(featured.length).toBeLessThanOrEqual(all.length);
    });

    it('should return a copy, not the cached array', () => {
      const result1 = getFeaturedProjects();
      const result2 = getFeaturedProjects();
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });

  describe('getProjectBySlug', () => {
    it('should return project for valid slug from getAllProjects', () => {
      const allProjects = getAllProjects();
      const firstProject = allProjects[0];
      const result = getProjectBySlug(firstProject.slug);
      expect(result).toBeDefined();
      expect(result?.id).toBe(firstProject.id);
      expect(result?.slug).toBe(firstProject.slug);
    });

    it('should return undefined for invalid slug', () => {
      const result = getProjectBySlug('non-existent-slug-12345');
      expect(result).toBeUndefined();
    });

    it('should return undefined for empty slug', () => {
      const result = getProjectBySlug('');
      expect(result).toBeUndefined();
    });

    it('should find all projects by their slug', () => {
      const allProjects = getAllProjects();
      allProjects.forEach((project) => {
        const result = getProjectBySlug(project.slug);
        expect(result).toBeDefined();
        expect(result?.slug).toBe(project.slug);
        expect(result?.id).toBe(project.id);
      });
    });
  });

  describe('getProjectStats', () => {
    it('should return correct total and featured counts', () => {
      const stats = getProjectStats();
      const all = getAllProjects();
      const featured = getFeaturedProjects();

      expect(stats.total).toBe(all.length);
      expect(stats.featured).toBe(featured.length);
    });

    it('should have featured <= total', () => {
      const stats = getProjectStats();
      expect(stats.featured).toBeLessThanOrEqual(stats.total);
    });
  });
});

