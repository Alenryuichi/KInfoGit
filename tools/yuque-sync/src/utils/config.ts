/**
 * 配置工具函数
 * 共享的配置读取和常量定义
 */

import chalk from 'chalk';

// 默认常量
export const DEFAULT_OUTPUT_DIR = './docs';
export const DEFAULT_SCHEDULE_HOUR = 8;
export const DEFAULT_SCHEDULE_MINUTE = 0;
export const ELOG_TIMEOUT_MS = 5 * 60 * 1000; // 5 分钟超时

/**
 * 从配置文件获取输出目录
 */
export async function getOutputDir(configPath: string): Promise<string> {
  try {
    const configUrl = `file://${configPath}`;
    const config = await import(configUrl);
    return config.default?.deploy?.local?.outputDir || DEFAULT_OUTPUT_DIR;
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  读取配置文件失败，使用默认输出目录: ${DEFAULT_OUTPUT_DIR}`));
    if (process.env.DEBUG) {
      console.warn(chalk.gray(`   错误详情: ${error instanceof Error ? error.message : String(error)}`));
    }
    return DEFAULT_OUTPUT_DIR;
  }
}

/**
 * 验证 schedule 参数范围
 */
export function validateScheduleParams(hour: number, minute: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return { valid: false, error: `hour 必须是 0-23 之间的整数，当前值: ${hour}` };
  }
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    return { valid: false, error: `minute 必须是 0-59 之间的整数，当前值: ${minute}` };
  }
  return { valid: true };
}

/**
 * 验证必填字段
 */
export function validateRequired(value: string, fieldName: string): { valid: boolean; error?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} 不能为空` };
  }
  return { valid: true };
}

