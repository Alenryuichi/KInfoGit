/**
 * 同步报告生成器
 * 生成 JSON 格式的同步报告
 */

import fs from 'fs-extra';
import path from 'path';
import type { SyncReport, SyncState, DocumentMeta, DocumentChange } from '../types/index.js';

export class ReportGenerator {
  private outputDir: string;
  private stateFile: string;
  private reportFile: string;

  constructor(outputDir: string) {
    this.outputDir = outputDir;
    this.stateFile = path.join(outputDir, '.sync-state.json');
    this.reportFile = path.join(outputDir, '.sync-report.json');
  }

  /**
   * 生成同步报告
   */
  async generateReport(
    startTime: Date,
    success: boolean,
    previousDocs: DocumentMeta[],
    currentDocs: DocumentMeta[],
    errors?: string[]
  ): Promise<SyncReport> {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    // 计算变更
    const changes = this.calculateChanges(previousDocs, currentDocs);

    const report: SyncReport = {
      timestamp: endTime.toISOString(),
      success,
      duration,
      summary: {
        total: currentDocs.length,
        added: changes.filter(c => c.type === 'added').length,
        updated: changes.filter(c => c.type === 'updated').length,
        deleted: changes.filter(c => c.type === 'deleted').length,
      },
      changes,
      errors: errors?.length ? errors : undefined,
    };

    // 保存报告
    await fs.writeJson(this.reportFile, report, { spaces: 2 });

    // 更新状态
    const state: SyncState = {
      lastSyncAt: endTime.toISOString(),
      lastSyncSuccess: success,
      totalDocuments: currentDocs.length,
      outputDir: this.outputDir,
    };
    await fs.writeJson(this.stateFile, state, { spaces: 2 });

    return report;
  }

  /**
   * 计算文档变更
   */
  private calculateChanges(
    previousDocs: DocumentMeta[],
    currentDocs: DocumentMeta[]
  ): DocumentChange[] {
    const changes: DocumentChange[] = [];
    const prevMap = new Map(previousDocs.map(d => [d.id, d]));
    const currMap = new Map(currentDocs.map(d => [d.id, d]));

    // 检测新增和更新
    for (const doc of currentDocs) {
      const prev = prevMap.get(doc.id);
      if (!prev) {
        changes.push({ type: 'added', title: doc.title, path: doc.path, slug: doc.slug });
      } else if (prev.updatedAt !== doc.updatedAt) {
        changes.push({ type: 'updated', title: doc.title, path: doc.path, slug: doc.slug });
      }
    }

    // 检测删除
    for (const doc of previousDocs) {
      if (!currMap.has(doc.id)) {
        changes.push({ type: 'deleted', title: doc.title, path: doc.path, slug: doc.slug });
      }
    }

    return changes;
  }

  /**
   * 获取上次同步状态
   */
  async getLastState(): Promise<SyncState | null> {
    try {
      if (await fs.pathExists(this.stateFile)) {
        return await fs.readJson(this.stateFile);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 获取上次同步报告
   */
  async getLastReport(): Promise<SyncReport | null> {
    try {
      if (await fs.pathExists(this.reportFile)) {
        return await fs.readJson(this.reportFile);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 格式化报告为文本
   */
  formatReportText(report: SyncReport): string {
    const lines: string[] = [];
    lines.push('📊 同步报告');
    lines.push('─'.repeat(30));
    lines.push(`状态: ${report.success ? '✅ 成功' : '❌ 失败'}`);
    lines.push(`耗时: ${(report.duration / 1000).toFixed(2)}s`);
    lines.push(`总文档数: ${report.summary.total}`);
    lines.push(`新增: ${report.summary.added}`);
    lines.push(`更新: ${report.summary.updated}`);
    lines.push(`删除: ${report.summary.deleted}`);

    if (report.errors && report.errors.length > 0) {
      lines.push('');
      lines.push('❗ 错误:');
      report.errors.forEach(e => lines.push(`  - ${e}`));
    }

    return lines.join('\n');
  }
}

export default ReportGenerator;

