/**
 * init 命令
 * 交互式初始化配置，生成 elog.config.js 和 .elog.env 文件
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline';
import type { InitOptions } from '../types/index.js';
import { DEFAULT_OUTPUT_DIR, validateRequired } from '../utils/config.js';

const CONFIG_TEMPLATE = `module.exports = {
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
`;

const ENV_TEMPLATE = `# 语雀账号配置
YUQUE_USERNAME=
YUQUE_PASSWORD=
YUQUE_HOST=https://www.yuque.com
YUQUE_LOGIN=
YUQUE_REPO=
`;

export async function initCommand(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  const configPath = path.join(cwd, 'elog.config.js');
  const envPath = path.join(cwd, '.elog.env');

  console.log(chalk.blue('🚀 初始化 yuque-sync 配置...\n'));

  // 检查文件是否存在
  const configExists = await fs.pathExists(configPath);
  const envExists = await fs.pathExists(envPath);

  if ((configExists || envExists) && !options.force) {
    console.log(chalk.yellow('⚠️  检测到已存在的配置文件:'));
    if (configExists) console.log(`   - ${configPath}`);
    if (envExists) console.log(`   - ${envPath}`);
    
    const confirm = await askQuestion('\n是否覆盖? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log(chalk.gray('已取消初始化'));
      return;
    }
  }

  // 收集配置信息
  console.log(chalk.cyan('\n📝 请输入语雀配置信息:\n'));

  const username = await askRequiredQuestion('语雀账号 (手机号): ', '语雀账号');
  const password = await askPasswordQuestion('语雀密码: ');
  const login = await askRequiredQuestion('个人路径 (如: your-login): ', '个人路径');
  const repo = await askRequiredQuestion('知识库路径 (如: your-repo): ', '知识库路径');
  const outputDir = options.outputDir || await askQuestion(`输出目录 (默认: ${DEFAULT_OUTPUT_DIR}): `) || DEFAULT_OUTPUT_DIR;

  // 生成配置文件
  const configContent = CONFIG_TEMPLATE.replace(
    "outputDir: './docs'",
    `outputDir: '${outputDir}'`
  ).replace(
    "outputDir: './docs/images'",
    `outputDir: '${outputDir}/images'`
  );

  // 生成环境变量文件
  const envContent = ENV_TEMPLATE
    .replace('YUQUE_USERNAME=', `YUQUE_USERNAME=${username}`)
    .replace('YUQUE_PASSWORD=', `YUQUE_PASSWORD=${password}`)
    .replace('YUQUE_LOGIN=', `YUQUE_LOGIN=${login}`)
    .replace('YUQUE_REPO=', `YUQUE_REPO=${repo}`);

  // 写入文件
  await fs.writeFile(configPath, configContent);
  await fs.writeFile(envPath, envContent);

  // 创建输出目录
  await fs.ensureDir(path.join(cwd, outputDir));
  await fs.ensureDir(path.join(cwd, outputDir, 'images'));

  // 添加 .elog.env 到 .gitignore
  const gitignorePath = path.join(cwd, '.gitignore');
  if (await fs.pathExists(gitignorePath)) {
    const gitignore = await fs.readFile(gitignorePath, 'utf-8');
    if (!gitignore.includes('.elog.env')) {
      await fs.appendFile(gitignorePath, '\n# Elog 环境变量\n.elog.env\n');
    }
  } else {
    await fs.writeFile(gitignorePath, '# Elog 环境变量\n.elog.env\n');
  }

  console.log(chalk.green('\n✅ 初始化完成!\n'));
  console.log('已创建文件:');
  console.log(`  - ${chalk.cyan('elog.config.js')} - Elog 配置文件`);
  console.log(`  - ${chalk.cyan('.elog.env')} - 环境变量文件 (已添加到 .gitignore)`);
  console.log(`  - ${chalk.cyan(outputDir + '/')} - 文档输出目录`);
  console.log('\n下一步:');
  console.log(`  运行 ${chalk.yellow('yuque-sync sync')} 开始同步文档`);
}

/**
 * 交互式询问
 */
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * 必填字段询问（带验证）
 */
async function askRequiredQuestion(question: string, fieldName: string): Promise<string> {
  let value = '';
  while (true) {
    value = await askQuestion(question);
    const validation = validateRequired(value, fieldName);
    if (validation.valid) {
      return value;
    }
    console.log(chalk.red(`❌ ${validation.error}`));
  }
}

/**
 * 密码输入（隐藏显示）
 */
function askPasswordQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // 隐藏输入
    process.stdout.write(question);
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;

    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    let password = '';

    const onData = (char: Buffer) => {
      const c = char.toString('utf8');

      switch (c) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          if (stdin.isTTY) {
            stdin.setRawMode(wasRaw ?? false);
          }
          stdin.removeListener('data', onData);
          rl.close();
          process.stdout.write('\n');

          // 验证密码不为空
          if (!password.trim()) {
            console.log(chalk.red('❌ 密码不能为空'));
            resolve(askPasswordQuestion(question) as unknown as string);
            return;
          }
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit(1);
          break;
        case '\u007F': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.clearLine(0);
            process.stdout.cursorTo(0);
            process.stdout.write(question + '*'.repeat(password.length));
          }
          break;
        default:
          password += c;
          process.stdout.write('*');
          break;
      }
    };

    stdin.on('data', onData);
  });
}

export default initCommand;

