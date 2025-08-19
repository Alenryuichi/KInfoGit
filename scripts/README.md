# KInfoGit Scripts

这个目录包含了项目的模块化 Just 命令，每个文件负责不同的功能领域。

## 📁 文件结构

```
scripts/
├── dev.just      # 开发相关命令
├── git.just      # Git 操作命令
├── content.just  # 内容管理命令
├── utils.just    # 工具和维护命令
└── README.md     # 本说明文件
```

## 🚀 快速开始

```bash
# 安装 Just (如果还没有安装)
brew install just

# 查看所有可用命令
just

# 初始化项目
just setup

# 开始开发
just dev
```

## 📋 命令分类

### 开发命令 (dev.just)
- `just install` - 安装依赖
- `just dev` - 启动开发服务器
- `just build` - 构建生产版本
- `just serve` - 本地服务构建后的网站
- `just clean` - 清理构建文件
- `just check-updates` - 检查依赖更新
- `just update-deps` - 更新依赖

### Git 命令 (git.just)
- `just status` - 显示仓库状态
- `just sync` - 同步远程仓库
- `just quick` - 快速提交
- `just deploy "message"` - 部署到 GitHub Pages
- `just branch name` - 创建新分支
- `just main` - 切换到主分支
- `just log` - 显示提交历史
- `just undo` - 撤销最后一次提交

### 内容管理 (content.just)
- `just new-post "title"` - 创建新博客文章
- `just list-posts` - 列出所有博客文章
- `just new-project name` - 创建新项目条目
- `just update-resume` - 更新简历
- `just validate-json` - 验证 JSON 文件
- `just content-stats` - 显示内容统计

### 工具命令 (utils.just)
- `just stats` - 显示仓库统计
- `just backup` - 创建仓库备份
- `just check-env` - 检查环境依赖
- `just code` - 在 VS Code 中打开项目
- `just find-large` - 查找大文件
- `just clean-temp` - 清理临时文件
- `just health` - 健康检查

## 💡 使用技巧

### 1. 参数传递
```bash
# 带参数的命令
just deploy "Fix navigation bug"
just new-post "My New Article"
just branch feature/new-design
```

### 2. 命令组合
```bash
# 清理后重新构建
just clean && just build

# 快速部署流程
just build && just deploy "Update content"
```

### 3. 查看命令详情
```bash
# 查看特定文件的命令
just --list --justfile scripts/dev.just
```

## 🔧 自定义命令

要添加新命令，编辑对应的 `.just` 文件：

1. **开发相关** → `scripts/dev.just`
2. **Git 操作** → `scripts/git.just`
3. **内容管理** → `scripts/content.just`
4. **工具命令** → `scripts/utils.just`

### 命令格式示例

```just
# 命令描述
command-name param:
    #!/usr/bin/env bash
    echo "执行命令: {{param}}"
    # 命令逻辑
```

## 📝 注意事项

1. **权限**: 确保脚本有执行权限
2. **路径**: 命令假设从项目根目录执行
3. **依赖**: 某些命令需要特定工具 (Node.js, Python, Git)
4. **错误处理**: 脚本包含基本的错误检查

## 🆘 故障排除

### 常见问题

1. **命令找不到**
   ```bash
   # 检查 Just 是否安装
   just --version
   ```

2. **权限错误**
   ```bash
   # 给脚本添加执行权限
   chmod +x scripts/*.just
   ```

3. **路径问题**
   ```bash
   # 确保在项目根目录执行
   pwd  # 应该显示 KInfoGit 目录
   ```

## 🔄 更新说明

当添加新命令时，请更新此 README 文件，保持文档同步。
