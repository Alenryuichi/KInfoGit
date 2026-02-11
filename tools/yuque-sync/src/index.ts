#!/usr/bin/env node
/**
 * yuque-sync CLI 入口
 * 语雀文档定时同步工具
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init.js';
import { syncCommand } from './commands/sync.js';
import { statusCommand } from './commands/status.js';
import { scheduleCommand } from './commands/schedule.js';

const program = new Command();

program
  .name('yuque-sync')
  .description('语雀文档定时同步工具 - 基于 Elog 的 CLI 包装器')
  .version('1.0.0');

program
  .command('init')
  .description('初始化配置，生成 elog.config.js 和 .elog.env')
  .option('-f, --force', '强制覆盖已存在的配置文件')
  .option('-o, --output-dir <dir>', '指定文档输出目录', './docs')
  .action(async (options) => {
    try {
      await initCommand(options);
    } catch (error) {
      console.error(chalk.red('初始化失败:'), error);
      process.exit(1);
    }
  });

program
  .command('sync')
  .description('同步语雀文档到本地')
  .option('-j, --json', '以 JSON 格式输出同步报告')
  .option('-v, --verbose', '显示详细输出')
  .option('-c, --clean', '同步前清除缓存')
  .action(async (options) => {
    try {
      await syncCommand(options);
    } catch (error) {
      console.error(chalk.red('同步失败:'), error);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('显示同步状态和统计信息')
  .option('-j, --json', '以 JSON 格式输出')
  .action(async (options) => {
    try {
      await statusCommand(options);
    } catch (error) {
      console.error(chalk.red('获取状态失败:'), error);
      process.exit(1);
    }
  });

program
  .command('schedule <action>')
  .description('管理定时同步任务 (enable/disable/status)')
  .option('-H, --hour <hour>', '执行小时 (0-23)', '8')
  .option('-M, --minute <minute>', '执行分钟 (0-59)', '0')
  .action(async (action, options) => {
    try {
      const hour = parseInt(options.hour, 10);
      const minute = parseInt(options.minute, 10);
      
      if (action === 'enable' && (isNaN(hour) || hour < 0 || hour > 23)) {
        console.error(chalk.red('无效的小时值，请输入 0-23'));
        process.exit(1);
      }
      if (action === 'enable' && (isNaN(minute) || minute < 0 || minute > 59)) {
        console.error(chalk.red('无效的分钟值，请输入 0-59'));
        process.exit(1);
      }

      await scheduleCommand(action as 'enable' | 'disable' | 'status', { hour, minute });
    } catch (error) {
      console.error(chalk.red('定时任务操作失败:'), error);
      process.exit(1);
    }
  });

program.addHelpText('after', `
示例:
  $ yuque-sync init                    # 初始化配置
  $ yuque-sync sync                    # 同步文档
  $ yuque-sync sync --json             # 同步并输出 JSON 报告
  $ yuque-sync status                  # 查看同步状态
  $ yuque-sync schedule enable         # 启用每日定时同步 (默认 8:00)
  $ yuque-sync schedule enable -H 9    # 启用每日 9:00 定时同步
  $ yuque-sync schedule disable        # 禁用定时同步
`);

program.parse();

