// 仅在本地开发时从 .elog.env 加载环境变量
// GitHub Action 中环境变量已通过 secrets 设置
try {
  require('dotenv').config({ path: '.elog.env' });
} catch (e) {
  // dotenv 不存在或文件不存在时忽略
}

module.exports = {
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
      timeout: 30000,
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
