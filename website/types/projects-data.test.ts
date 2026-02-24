import { describe, it, expect } from 'vitest';
import projectsData from '../../profile-data/projects/core-projects.json';

// Type for core-projects.json structure
interface CoreProject {
  id: string;
  title: { zh: string; en: string };
  slug?: string;
  period: string;
  company: string;
  role: { zh: string; en: string };
  tech_stack: string[];
  responsibilities: { zh: string[]; en: string[] };
  achievements: { zh: string[]; en: string[] };
  highlights?: { zh: string; en: string };
  impact?: string;
  category?: string;
  section?: string;
  featured?: boolean;
  order?: number;
  hasDetailPage?: boolean;
}

describe('core-projects.json data validation', () => {
  const projects = projectsData as CoreProject[];

  it('should be a non-empty array', () => {
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThanOrEqual(3);
  });

  it('should have at least 3-5 projects', () => {
    expect(projects.length).toBeGreaterThanOrEqual(3);
    expect(projects.length).toBeLessThanOrEqual(10);
  });

  it('should have unique ids for all projects', () => {
    const ids = projects.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique slugs for all projects', () => {
    const slugs = projects.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('should have valid slug format (lowercase, hyphen-separated)', () => {
    const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    for (const project of projects) {
      expect(project.slug).toMatch(slugPattern);
    }
  });

  it('should have required multilingual fields', () => {
    for (const project of projects) {
      expect(project.title.zh).toBeDefined();
      expect(project.title.en).toBeDefined();
      expect(project.role.zh).toBeDefined();
      expect(project.role.en).toBeDefined();
    }
  });

  describe('featured projects configuration', () => {
    it('should have at least 3 featured projects', () => {
      const featuredProjects = projects.filter((p) => p.featured === true);
      expect(featuredProjects.length).toBeGreaterThanOrEqual(3);
    });

    it('should have featured projects with hasDetailPage=true', () => {
      const featuredProjects = projects.filter((p) => p.featured === true);
      for (const project of featuredProjects) {
        expect(project.hasDetailPage).toBe(true);
      }
    });

    it('should have featured projects with order values set', () => {
      const featuredProjects = projects.filter((p) => p.featured === true);
      for (const project of featuredProjects) {
        expect(typeof project.order).toBe('number');
        expect(project.order).toBeGreaterThan(0);
      }
    });

    it('should have unique order values for featured projects', () => {
      const featuredProjects = projects.filter((p) => p.featured === true);
      const orders = featuredProjects.map((p) => p.order);
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBe(orders.length);
    });

    it('should have featured projects sorted by order ascending', () => {
      const featuredProjects = projects
        .filter((p) => p.featured === true)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      for (let i = 0; i < featuredProjects.length - 1; i++) {
        expect(featuredProjects[i].order).toBeLessThan(featuredProjects[i + 1].order!);
      }
    });
  });

  describe('section configuration', () => {
    it('should have all projects with section defined', () => {
      for (const project of projects) {
        expect(project.section).toBeDefined();
      }
    });

    it('should have valid section values', () => {
      const validSections = ['独立项目', '企业微信'];
      for (const project of projects) {
        expect(validSections).toContain(project.section);
      }
    });
  });
});
