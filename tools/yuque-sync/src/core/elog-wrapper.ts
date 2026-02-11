/**
 * Elog CLI 包装器
 * 封装 elog 命令行调用
 */

import { spawn, ChildProcess } from 'child_process';
import type { ElogResult } from '../types/index.js';
import { ELOG_TIMEOUT_MS } from '../utils/config.js';

export class ElogWrapper {
  private workingDir: string;
  private envFile: string;

  constructor(workingDir: string, envFile: string = '.elog.env') {
    this.workingDir = workingDir;
    this.envFile = envFile;
  }

  /**
   * 初始化 Elog 配置
   */
  async init(): Promise<ElogResult> {
    return this.runCommand(['init']);
  }

  /**
   * 执行同步
   */
  async sync(): Promise<ElogResult> {
    return this.runCommand(['sync', '--env', this.envFile]);
  }

  /**
   * 清除缓存
   */
  async clean(): Promise<ElogResult> {
    return this.runCommand(['clean']);
  }

  /**
   * 检查 Elog 是否已安装
   */
  async checkInstalled(): Promise<boolean> {
    try {
      const result = await this.runCommand(['--version']);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * 获取 Elog 版本
   */
  async getVersion(): Promise<string | null> {
    try {
      const result = await this.runCommand(['--version']);
      if (result.success) {
        return result.stdout.trim();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 解析同步输出
   */
  parseSyncOutput(output: string): { synced: number; errors: string[] } {
    const lines = output.split('\n');
    let synced = 0;
    const errors: string[] = [];

    for (const line of lines) {
      // 匹配成功同步的文档
      if (line.includes('同步成功') || line.includes('sync success') || line.includes('✔')) {
        synced++;
      }
      // 匹配错误信息
      if (line.toLowerCase().includes('error') || line.includes('错误')) {
        errors.push(line.trim());
      }
    }

    return { synced, errors };
  }

  /**
   * 执行 Elog 命令（带超时）
   */
  private runCommand(args: string[], timeoutMs: number = ELOG_TIMEOUT_MS): Promise<ElogResult> {
    return new Promise((resolve) => {
      const child: ChildProcess = spawn('npx', ['elog', ...args], {
        cwd: this.workingDir,
        env: { ...process.env },
        shell: true,
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      // 设置超时
      const timeout = setTimeout(() => {
        killed = true;
        child.kill('SIGTERM');
        // 给进程一点时间优雅退出，否则强制杀死
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 5000);
      }, timeoutMs);

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (killed) {
          resolve({
            success: false,
            stdout,
            stderr: `命令执行超时 (${timeoutMs / 1000}秒)，已终止进程`,
            code: -1,
          });
        } else {
          resolve({
            success: code === 0,
            stdout,
            stderr,
            code: code ?? 1,
          });
        }
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        resolve({
          success: false,
          stdout,
          stderr: err.message,
          code: 1,
        });
      });
    });
  }
}

export default ElogWrapper;

