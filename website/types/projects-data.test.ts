import { describe, it, expect } from 'vitest';
import { isProject, Project } from './project';
import projectsData from '../../profile-data/projects.json';

describe('projects.json data validation', () => {
  it('should be a non-empty array', () => {
    expect(Array.isArray(projectsData)).toBe(true);
    expect(projectsData.length).toBeGreaterThanOrEqual(3);
  });

  it('should have at least 3-5 projects (AC #2)', () => {
    expect(projectsData.length).toBeGreaterThanOrEqual(3);
    expect(projectsData.length).toBeLessThanOrEqual(10);
  });

  it('should have all projects conform to Project interface (AC #1)', () => {
    for (const project of projectsData) {
      expect(isProject(project)).toBe(true);
    }
  });

  it('should have unique ids for all projects', () => {
    const ids = projectsData.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have unique slugs for all projects', () => {
    const slugs = projectsData.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('should have valid slug format (lowercase, hyphen-separated)', () => {
    const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    for (const project of projectsData) {
      expect(project.slug).toMatch(slugPattern);
    }
  });

  it('should have description under 100 characters', () => {
    for (const project of projectsData) {
      expect(project.description.length).toBeLessThanOrEqual(100);
    }
  });

  describe('featured projects configuration (AC #3)', () => {
    it('should have at least 3 featured projects', () => {
      const featuredProjects = projectsData.filter((p) => p.featured === true);
      expect(featuredProjects.length).toBeGreaterThanOrEqual(3);
    });

    it('should have featured projects with hasDetailPage=true', () => {
      const featuredProjects = projectsData.filter((p) => p.featured === true);
      for (const project of featuredProjects) {
        expect(project.hasDetailPage).toBe(true);
      }
    });

    it('should have featured projects with order values set', () => {
      const featuredProjects = projectsData.filter((p) => p.featured === true);
      for (const project of featuredProjects) {
        expect(typeof project.order).toBe('number');
        expect(project.order).toBeGreaterThan(0);
      }
    });

    it('should have unique order values for featured projects', () => {
      const featuredProjects = projectsData.filter((p) => p.featured === true);
      const orders = featuredProjects.map((p) => p.order);
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBe(orders.length);
    });

    it('should have featured projects sorted by order ascending', () => {
      const featuredProjects = projectsData
        .filter((p) => p.featured === true)
        .sort((a, b) => a.order - b.order);

      for (let i = 0; i < featuredProjects.length - 1; i++) {
        expect(featuredProjects[i].order).toBeLessThan(featuredProjects[i + 1].order);
      }
    });
  });

  describe('non-featured projects configuration', () => {
    it('should have non-featured projects with hasDetailPage=false', () => {
      const nonFeaturedProjects = projectsData.filter((p) => p.featured === false);
      for (const project of nonFeaturedProjects) {
        expect(project.hasDetailPage).toBe(false);
      }
    });
  });
});

