/**
 * 文档索引构建器
 * 扫描 Markdown 文件，生成 index.json
 */

import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import type { DocumentMeta, DocumentIndex } from '../types/index.js';

export class IndexBuilder {
  private outputDir: string;
  private indexFile: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    this.indexFile = path.join(outputDir, 'index.json');
  }

  /**
   * 构建文档索引
   */
  async buildIndex(): Promise<DocumentIndex> {
    const documents: DocumentMeta[] = [];
    
    if (await fs.pathExists(this.outputDir)) {
      await this.scanDirectory(this.outputDir, documents);
    }

    const index: DocumentIndex = {
      generatedAt: new Date().toISOString(),
      totalDocuments: documents.length,
      documents,
    };

    // 保存索引文件
    await fs.writeJson(this.indexFile, index, { spaces: 2 });

    return index;
  }

  /**
   * 递归扫描目录
   */
  private async scanDirectory(dir: string, documents: DocumentMeta[]): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // 跳过隐藏目录和图片目录
        if (!entry.name.startsWith('.') && entry.name !== 'images') {
          await this.scanDirectory(fullPath, documents);
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const meta = await this.extractDocumentMeta(fullPath);
        if (meta) {
          documents.push(meta);
        }
      }
    }
  }

  /**
   * 提取文档元数据
   */
  private async extractDocumentMeta(filePath: string): Promise<DocumentMeta | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stat = await fs.stat(filePath);
      const relativePath = path.relative(this.outputDir, filePath);

      // 解析 Front Matter
      const frontMatter = this.parseFrontMatter(content);

      // 提取标题
      const title = frontMatter.title || this.extractTitle(content) || path.basename(filePath, '.md');

      // 生成 ID
      const id = this.generateId(relativePath);

      // 计算字数
      const wordCount = this.countWords(content);

      return {
        id,
        title,
        slug: frontMatter.slug || path.basename(filePath, '.md'),
        path: relativePath,
        createdAt: frontMatter.createdAt || stat.birthtime.toISOString(),
        updatedAt: frontMatter.updatedAt || stat.mtime.toISOString(),
        wordCount,
        tags: frontMatter.tags,
      };
    } catch {
      return null;
    }
  }

  /**
   * 解析 Front Matter
   */
  private parseFrontMatter(content: string): Record<string, any> {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const frontMatter: Record<string, any> = {};
    const lines = match[1].split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();
        
        // 处理数组格式
        if (value.startsWith('[') && value.endsWith(']')) {
          const arrayValue = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
          frontMatter[key] = arrayValue;
        } else {
          frontMatter[key] = value.replace(/['"]/g, '');
        }
      }
    }

    return frontMatter;
  }

  /**
   * 从 Markdown 提取标题
   */
  private extractTitle(content: string): string | null {
    // 跳过 Front Matter
    let text = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
    
    // 匹配第一个标题
    const match = text.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  /**
   * 计算字数（中英文）
   */
  private countWords(content: string): number {
    // 移除 Front Matter
    let text = content.replace(/^---\n[\s\S]*?\n---\n?/, '');
    // 移除 Markdown 语法
    text = text.replace(/[#*`\[\]()]/g, '');
    
    // 中文字符计数
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    // 英文单词计数
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    
    return chineseChars + englishWords;
  }

  /**
   * 生成文档 ID
   */
  private generateId(relativePath: string): string {
    return crypto.createHash('md5').update(relativePath).digest('hex').slice(0, 12);
  }

  /**
   * 获取已有索引
   */
  async getExistingIndex(): Promise<DocumentIndex | null> {
    try {
      if (await fs.pathExists(this.indexFile)) {
        return await fs.readJson(this.indexFile);
      }
      return null;
    } catch {
      return null;
    }
  }
}

export default IndexBuilder;

