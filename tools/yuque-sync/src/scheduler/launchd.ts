/**
 * macOS launchd 调度器
 * 管理 launchd 定时任务
 */

import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import os from 'os';
import type { LaunchdConfig } from '../types/index.js';

const PLIST_LABEL = 'com.yuque-sync.scheduler';

export class LaunchdScheduler {
  public workingDir: string;
  private launchAgentsDir: string;

  constructor(workingDir: string) {
    this.workingDir = workingDir;
    this.launchAgentsDir = path.join(os.homedir(), 'Library', 'LaunchAgents');
  }

  getPlistPath(): string {
    return path.join(this.launchAgentsDir, `${PLIST_LABEL}.plist`);
  }

  getLogPath(): string {
    return path.join(this.workingDir, '.yuque-sync.log');
  }

  async enable(hour: number = 8, minute: number = 0): Promise<void> {
    await fs.ensureDir(this.launchAgentsDir);

    const config: LaunchdConfig = {
      label: PLIST_LABEL,
      programArguments: ['npx', 'yuque-sync', 'sync'],
      workingDirectory: this.workingDir,
      startCalendarInterval: { Hour: hour, Minute: minute },
      standardOutPath: this.getLogPath(),
      standardErrorPath: this.getLogPath(),
      runAtLoad: false,
    };

    const plistContent = this.generatePlist(config);
    await fs.writeFile(this.getPlistPath(), plistContent);
    await this.launchctl('load', this.getPlistPath());
  }

  async disable(): Promise<void> {
    const plistPath = this.getPlistPath();

    if (await fs.pathExists(plistPath)) {
      try {
        await this.launchctl('unload', plistPath);
      } catch {
        // 忽略卸载错误
      }
      await fs.remove(plistPath);
    }
  }

  async isEnabled(): Promise<boolean> {
    return fs.pathExists(this.getPlistPath());
  }

  async getConfig(): Promise<{ hour?: number; minute?: number } | null> {
    const plistPath = this.getPlistPath();
    
    if (!(await fs.pathExists(plistPath))) {
      return null;
    }

    try {
      const content = await fs.readFile(plistPath, 'utf-8');
      const hourMatch = content.match(/<key>Hour<\/key>\s*<integer>(\d+)<\/integer>/);
      const minuteMatch = content.match(/<key>Minute<\/key>\s*<integer>(\d+)<\/integer>/);

      return {
        hour: hourMatch ? parseInt(hourMatch[1], 10) : undefined,
        minute: minuteMatch ? parseInt(minuteMatch[1], 10) : undefined,
      };
    } catch {
      return null;
    }
  }

  private launchctl(action: string, plistPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('launchctl', [action, plistPath]);

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`launchctl ${action} failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  private generatePlist(config: LaunchdConfig): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${config.label}</string>
    <key>ProgramArguments</key>
    <array>
        ${config.programArguments.map(arg => `<string>${arg}</string>`).join('\n        ')}
    </array>
    <key>WorkingDirectory</key>
    <string>${config.workingDirectory}</string>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>${config.startCalendarInterval.Hour}</integer>
        <key>Minute</key>
        <integer>${config.startCalendarInterval.Minute}</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>${config.standardOutPath}</string>
    <key>StandardErrorPath</key>
    <string>${config.standardErrorPath}</string>
    <key>RunAtLoad</key>
    <${config.runAtLoad}/>
</dict>
</plist>`;
  }
}

export default LaunchdScheduler;

