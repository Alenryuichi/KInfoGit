/**
 * 类型定义
 */

// 同步配置
export interface SyncConfig {
  yuqueUsername: string;
  yuquePassword: string;
  yuqueHost?: string;
  yuqueLogin: string;
  yuqueRepo: string;
  outputDir: string;
}

// 同步报告
export interface SyncReport {
  timestamp: string;
  success: boolean;
  duration: number;
  summary: {
    total: number;
    added: number;
    updated: number;
    deleted: number;
  };
  changes: DocumentChange[];
  errors?: string[];
}

// 文档变更
export interface DocumentChange {
  type: 'added' | 'updated' | 'deleted';
  title: string;
  path: string;
  slug?: string;
}

// 文档元数据
export interface DocumentMeta {
  id: string;
  title: string;
  slug: string;
  path: string;
  createdAt: string;
  updatedAt: string;
  wordCount?: number;
  tags?: string[];
}

// 文档索引
export interface DocumentIndex {
  generatedAt: string;
  totalDocuments: number;
  documents: DocumentMeta[];
}

// 同步状态
export interface SyncState {
  lastSyncAt: string;
  lastSyncSuccess: boolean;
  totalDocuments: number;
  outputDir: string;
}

// 命令选项
export interface InitOptions {
  force?: boolean;
  outputDir?: string;
}

export interface SyncOptions {
  json?: boolean;
  verbose?: boolean;
  clean?: boolean;
}

export interface StatusOptions {
  json?: boolean;
}

export interface ScheduleOptions {
  hour?: number;
  minute?: number;
}

// Elog 配置
export interface ElogConfig {
  write: {
    platform: string;
    'yuque-pwd': {
      username: string;
      password: string;
      host: string;
      login: string;
      repo: string;
    };
  };
  deploy: {
    platform: string;
    local: {
      outputDir: string;
      filename: string;
      format: string;
    };
  };
}

// Elog 执行结果
export interface ElogResult {
  success: boolean;
  stdout: string;
  stderr: string;
  code: number;
}

// launchd 配置
export interface LaunchdConfig {
  label: string;
  programArguments: string[];
  workingDirectory: string;
  startCalendarInterval: {
    Hour: number;
    Minute: number;
  };
  standardOutPath: string;
  standardErrorPath: string;
  runAtLoad: boolean;
}

