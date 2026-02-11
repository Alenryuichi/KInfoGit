/**
 * schedule 命令
 * 配置/启用/禁用 macOS launchd 定时任务
 */

import chalk from 'chalk';
import { LaunchdScheduler } from '../scheduler/launchd.js';
import type { ScheduleOptions } from '../types/index.js';
import { DEFAULT_SCHEDULE_HOUR, DEFAULT_SCHEDULE_MINUTE, validateScheduleParams } from '../utils/config.js';

export async function scheduleCommand(
  action: 'enable' | 'disable' | 'status',
  options: ScheduleOptions
): Promise<void> {
  const cwd = process.cwd();
  const scheduler = new LaunchdScheduler(cwd);

  switch (action) {
    case 'enable':
      await enableSchedule(scheduler, options);
      break;
    case 'disable':
      await disableSchedule(scheduler);
      break;
    case 'status':
      await showScheduleStatus(scheduler);
      break;
    default:
      console.error(chalk.red(`未知操作: ${action}`));
      console.log('可用操作: enable, disable, status');
      process.exit(1);
  }
}

async function enableSchedule(
  scheduler: LaunchdScheduler,
  options: ScheduleOptions
): Promise<void> {
  const hour = options.hour ?? DEFAULT_SCHEDULE_HOUR;
  const minute = options.minute ?? DEFAULT_SCHEDULE_MINUTE;

  // 验证参数范围
  const validation = validateScheduleParams(hour, minute);
  if (!validation.valid) {
    console.error(chalk.red(`❌ 参数错误: ${validation.error}`));
    process.exit(1);
  }

  console.log(chalk.blue('⏰ 配置定时同步任务...\n'));

  try {
    if (await scheduler.isEnabled()) {
      console.log(chalk.yellow('⚠️  定时任务已存在，将更新配置'));
      await scheduler.disable();
    }

    await scheduler.enable(hour, minute);

    console.log(chalk.green('✅ 定时任务已启用!\n'));
    console.log(`执行时间: 每天 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    console.log(`工作目录: ${scheduler.workingDir}`);
    console.log(`日志文件: ${scheduler.getLogPath()}`);
    console.log(chalk.gray('\n提示: 使用 yuque-sync schedule disable 可禁用定时任务'));
  } catch (error) {
    console.error(chalk.red('❌ 启用定时任务失败'));
    if (error instanceof Error) {
      console.error(chalk.gray(error.message));
    }
    process.exit(1);
  }
}

async function disableSchedule(scheduler: LaunchdScheduler): Promise<void> {
  console.log(chalk.blue('⏰ 禁用定时同步任务...\n'));

  try {
    if (!(await scheduler.isEnabled())) {
      console.log(chalk.yellow('⚠️  定时任务未启用'));
      return;
    }

    await scheduler.disable();

    console.log(chalk.green('✅ 定时任务已禁用'));
  } catch (error) {
    console.error(chalk.red('❌ 禁用定时任务失败'));
    if (error instanceof Error) {
      console.error(chalk.gray(error.message));
    }
    process.exit(1);
  }
}

async function showScheduleStatus(scheduler: LaunchdScheduler): Promise<void> {
  console.log(chalk.blue('\n⏰ 定时任务状态\n'));
  console.log('─'.repeat(40));

  const enabled = await scheduler.isEnabled();
  console.log(`状态: ${enabled ? chalk.green('已启用') : chalk.gray('未启用')}`);

  if (enabled) {
    const config = await scheduler.getConfig();
    if (config) {
      const hour = config.hour?.toString().padStart(2, '0') || '00';
      const minute = config.minute?.toString().padStart(2, '0') || '00';
      console.log(`执行时间: 每天 ${hour}:${minute}`);
    }
    console.log(`plist 文件: ${scheduler.getPlistPath()}`);
    console.log(`日志文件: ${scheduler.getLogPath()}`);
  }

  console.log('\n' + '─'.repeat(40) + '\n');
}

export default scheduleCommand;

