/**
 * status 命令
 * 显示上次同步状态、文档统计、定时任务状态
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { ReportGenerator } from '../core/report-generator.js';
import { IndexBuilder } from '../core/index-builder.js';
import { LaunchdScheduler } from '../scheduler/launchd.js';
import type { StatusOptions, SyncState, SyncReport, DocumentIndex } from '../types/index.js';
import { getOutputDir, DEFAULT_OUTPUT_DIR } from '../utils/config.js';

interface StatusInfo {
  configured: boolean;
  lastSync: SyncState | null;
  lastReport: SyncReport | null;
  index: DocumentIndex | null;
  schedule: {
    enabled: boolean;
    hour?: number;
    minute?: number;
  };
}

export async function statusCommand(options: StatusOptions): Promise<void> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, 'elog.config.js');
  
  const configured = await fs.pathExists(configPath);
  const outputDir = configured ? await getOutputDir(configPath) : DEFAULT_OUTPUT_DIR;
  
  const reportGen = new ReportGenerator(outputDir);
  const indexBuilder = new IndexBuilder(outputDir);
  const scheduler = new LaunchdScheduler(cwd);

  const status: StatusInfo = {
    configured,
    lastSync: await reportGen.getLastState(),
    lastReport: await reportGen.getLastReport(),
    index: await indexBuilder.getExistingIndex(),
    schedule: {
      enabled: await scheduler.isEnabled(),
      ...(await scheduler.getConfig()),
    },
  };

  if (options.json) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    printStatus(status);
  }
}

function printStatus(status: StatusInfo): void {
  console.log(chalk.blue('\n📊 yuque-sync 状态\n'));
  console.log('─'.repeat(40));

  console.log(chalk.cyan('\n⚙️  配置:'));
  console.log(`   状态: ${status.configured ? chalk.green('已配置') : chalk.yellow('未配置')}`);

  if (!status.configured) {
    console.log(chalk.gray('\n   运行 yuque-sync init 进行初始化'));
    return;
  }

  console.log(chalk.cyan('\n🔄 同步:'));
  if (status.lastSync) {
    const lastSyncDate = new Date(status.lastSync.lastSyncAt);
    const timeAgo = getTimeAgo(lastSyncDate);
    
    console.log(`   上次同步: ${lastSyncDate.toLocaleString()} (${timeAgo})`);
    console.log(`   同步状态: ${status.lastSync.lastSyncSuccess ? chalk.green('成功') : chalk.red('失败')}`);
    console.log(`   文档数量: ${status.lastSync.totalDocuments}`);
    console.log(`   输出目录: ${status.lastSync.outputDir}`);
  } else {
    console.log(chalk.gray('   尚未执行过同步'));
  }

  if (status.lastReport) {
    console.log(chalk.cyan('\n📈 上次同步变更:'));
    console.log(`   新增: ${status.lastReport.summary.added}`);
    console.log(`   更新: ${status.lastReport.summary.updated}`);
    console.log(`   删除: ${status.lastReport.summary.deleted}`);
  }

  console.log(chalk.cyan('\n📚 文档索引:'));
  if (status.index) {
    console.log(`   索引更新: ${new Date(status.index.generatedAt).toLocaleString()}`);
    console.log(`   文档总数: ${status.index.totalDocuments}`);
  } else {
    console.log(chalk.gray('   索引不存在'));
  }

  console.log(chalk.cyan('\n⏰ 定时任务:'));
  if (status.schedule.enabled) {
    const hour = status.schedule.hour?.toString().padStart(2, '0') || '00';
    const minute = status.schedule.minute?.toString().padStart(2, '0') || '00';
    console.log(`   状态: ${chalk.green('已启用')}`);
    console.log(`   执行时间: 每天 ${hour}:${minute}`);
  } else {
    console.log(`   状态: ${chalk.gray('未启用')}`);
    console.log(chalk.gray('   运行 yuque-sync schedule enable 启用定时同步'));
  }

  console.log('\n' + '─'.repeat(40) + '\n');
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return `${Math.floor(diffDays / 7)} 周前`;
}

export default statusCommand;

