require('dotenv').config({ path: '.elog.env' });

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
