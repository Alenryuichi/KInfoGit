/**
 * Elog 配置文件模板
 * 复制为 elog.config.js 并配置 .elog.env 后使用
 *
 * 使用方法:
 * 1. 复制此文件为 elog.config.js
 * 2. 创建 .elog.env 文件（参考 .elog.env.example）
 * 3. 运行 npx yuque-sync sync
 */

export default {
  write: {
    platform: 'yuque-pwd',
    'yuque-pwd': {
      username: process.env.YUQUE_USERNAME,
      password: process.env.YUQUE_PASSWORD,
      host: process.env.YUQUE_HOST || 'https://www.yuque.com',
      login: process.env.YUQUE_LOGIN,
      repo: process.env.YUQUE_REPO,
      linebreak: false,
      onlyPublic: false,
      onlyPublished: false,
    },
  },
  deploy: {
    platform: 'local',
    local: {
      outputDir: './docs',
      filename: 'title',
      format: 'markdown',
      catalog: true,
    },
  },
  image: {
    enable: true,
    platform: 'local',
    local: {
      outputDir: './docs/images',
      prefixKey: 'images',
    },
  },
};

