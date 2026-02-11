/**
 * sync 命令
 * 调用 Elog 同步，生成报告，更新索引
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { ElogWrapper } from '../core/elog-wrapper.js';
import { ReportGenerator } from '../core/report-generator.js';
import { IndexBuilder } from '../core/index-builder.js';
import type { SyncOptions, DocumentMeta } from '../types/index.js';
import { getOutputDir } from '../utils/config.js';

export async function syncCommand(options: SyncOptions): Promise<void> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, 'elog.config.js');
  const envPath = path.join(cwd, '.elog.env');

  // 检查配置文件
  if (!(await fs.pathExists(configPath))) {
    console.error(chalk.red('❌ 未找到 elog.config.js，请先运行 yuque-sync init'));
    process.exit(1);
  }

  if (!(await fs.pathExists(envPath))) {
    console.error(chalk.red('❌ 未找到 .elog.env，请先运行 yuque-sync init'));
    process.exit(1);
  }

  // 读取配置获取输出目录
  const outputDir = await getOutputDir(configPath);
  
  if (!options.json) {
    console.log(chalk.blue('🔄 开始同步语雀文档...\n'));
  }

  const startTime = new Date();
  const elog = new ElogWrapper(cwd, '.elog.env');
  const reportGen = new ReportGenerator(outputDir);
  const indexBuilder = new IndexBuilder(outputDir);

  // 获取同步前的文档列表
  const existingIndex = await indexBuilder.getExistingIndex();
  const previousDocs: DocumentMeta[] = existingIndex?.documents || [];

  // 清除缓存（如果指定）
  if (options.clean) {
    if (!options.json) {
      console.log(chalk.gray('清除缓存...'));
    }
    await elog.clean();
  }

  // 执行同步
  if (options.verbose && !options.json) {
    console.log(chalk.gray('执行 elog sync...'));
  }

  const result = await elog.sync();

  if (!result.success) {
    const errors = parseErrors(result.stderr);
    
    if (options.json) {
      const report = await reportGen.generateReport(
        startTime,
        false,
        previousDocs,
        previousDocs,
        errors
      );
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.error(chalk.red('\n❌ 同步失败'));
      if (errors.length > 0) {
        console.error(chalk.yellow('\n错误信息:'));
        errors.forEach(e => console.error(`  - ${e}`));
      }
      if (options.verbose) {
        console.error(chalk.gray('\n详细输出:'));
        console.error(result.stderr);
      }
    }
    process.exit(1);
  }

  // 构建新索引
  const newIndex = await indexBuilder.buildIndex();
  const currentDocs = newIndex.documents;

  // 生成报告
  const report = await reportGen.generateReport(
    startTime,
    true,
    previousDocs,
    currentDocs
  );

  // 输出结果
  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(chalk.green('\n✅ 同步完成!\n'));
    console.log(reportGen.formatReportText(report));
    console.log(chalk.gray(`\n索引已更新: ${path.join(outputDir, 'index.json')}`));
  }
}

/**
 * 解析错误信息
 */
function parseErrors(stderr: string): string[] {
  const errors: string[] = [];
  const lines = stderr.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('npm') && !trimmed.startsWith('npx')) {
      if (trimmed.includes('账号') || trimmed.includes('密码') || trimmed.includes('auth')) {
        errors.push('语雀账号或密码错误');
      } else if (trimmed.includes('network') || trimmed.includes('ENOTFOUND')) {
        errors.push('网络连接失败，请检查网络');
      } else if (trimmed.includes('Error') || trimmed.includes('error')) {
        errors.push(trimmed);
      }
    }
  }

  return [...new Set(errors)];
}

export default syncCommand;

