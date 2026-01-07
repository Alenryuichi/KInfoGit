import { describe, it, expect } from 'vitest';
import { isProject, isProjectLinks, Project, ProjectLinks } from './project';

describe('isProjectLinks', () => {
  it('should return true for valid ProjectLinks with all fields', () => {
    const links: ProjectLinks = {
      demo: 'https://demo.example.com',
      github: 'https://github.com/user/repo',
      article: 'https://blog.example.com/article',
    };
    expect(isProjectLinks(links)).toBe(true);
  });

  it('should return true for valid ProjectLinks with partial fields', () => {
    expect(isProjectLinks({ demo: 'https://demo.example.com' })).toBe(true);
    expect(isProjectLinks({ github: 'https://github.com/user/repo' })).toBe(true);
    expect(isProjectLinks({})).toBe(true);
  });

  it('should return false for invalid field types', () => {
    expect(isProjectLinks({ demo: 123 })).toBe(false);
    expect(isProjectLinks({ github: null })).toBe(false);
    expect(isProjectLinks({ article: true })).toBe(false);
  });

  it('should return false for unknown fields', () => {
    expect(isProjectLinks({ demo: 'https://demo.example.com', unknown: 'field' })).toBe(false);
    expect(isProjectLinks({ invalidKey: 'value' })).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isProjectLinks(null)).toBe(false);
    expect(isProjectLinks(undefined)).toBe(false);
    expect(isProjectLinks('string')).toBe(false);
    expect(isProjectLinks(123)).toBe(false);
    expect(isProjectLinks([])).toBe(false);
  });
});

describe('isProject', () => {
  const validProject: Project = {
    id: 'project-1',
    title: 'Test Project',
    slug: 'test-project',
    description: 'A test project description',
    featured: true,
    order: 1,
    category: 'engineering',
    tags: ['react', 'typescript'],
    role: 'Lead Developer',
    period: '2023-2024',
    hasDetailPage: true,
  };

  it('should return true for valid Project with required fields only', () => {
    expect(isProject(validProject)).toBe(true);
  });

  it('should return true for valid Project with optional fields', () => {
    const projectWithOptionals: Project = {
      ...validProject,
      thumbnail: '/images/project-1.png',
      links: {
        demo: 'https://demo.example.com',
        github: 'https://github.com/user/repo',
      },
    };
    expect(isProject(projectWithOptionals)).toBe(true);
  });

  it('should return false when required fields are missing', () => {
    const { id, ...missingId } = validProject;
    expect(isProject(missingId)).toBe(false);

    const { title, ...missingTitle } = validProject;
    expect(isProject(missingTitle)).toBe(false);

    const { slug, ...missingSlug } = validProject;
    expect(isProject(missingSlug)).toBe(false);
  });

  it('should return false when required fields have wrong types', () => {
    expect(isProject({ ...validProject, id: 123 })).toBe(false);
    expect(isProject({ ...validProject, featured: 'yes' })).toBe(false);
    expect(isProject({ ...validProject, order: '1' })).toBe(false);
    expect(isProject({ ...validProject, hasDetailPage: 1 })).toBe(false);
  });

  it('should return false when tags is not a string array', () => {
    expect(isProject({ ...validProject, tags: 'react' })).toBe(false);
    expect(isProject({ ...validProject, tags: [1, 2, 3] })).toBe(false);
    expect(isProject({ ...validProject, tags: ['react', 123] })).toBe(false);
    expect(isProject({ ...validProject, tags: null })).toBe(false);
  });

  it('should return true when tags is empty array', () => {
    expect(isProject({ ...validProject, tags: [] })).toBe(true);
  });

  it('should return false when thumbnail is not a string', () => {
    expect(isProject({ ...validProject, thumbnail: 123 })).toBe(false);
    expect(isProject({ ...validProject, thumbnail: true })).toBe(false);
  });

  it('should return false when links has invalid structure', () => {
    expect(isProject({ ...validProject, links: { unknown: 'field' } })).toBe(false);
    expect(isProject({ ...validProject, links: { demo: 123 } })).toBe(false);
    expect(isProject({ ...validProject, links: 'string' })).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isProject(null)).toBe(false);
    expect(isProject(undefined)).toBe(false);
    expect(isProject('string')).toBe(false);
    expect(isProject(123)).toBe(false);
    expect(isProject([])).toBe(false);
  });
});

