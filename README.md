# General Lottery

一个基于 Electron + React + TypeScript + Vite 的抽签/锦标赛管理应用。

## 功能特点

-锦标赛管理系统
- 抽签系统
- 动态配置界面
- 键盘快捷键支持

## 开发

### 环境要求

- Node.js 18+
- npm 9+

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
├── electron/          # Electron 主进程代码
│   ├── main.ts        # 主进程入口
│   └── preload.ts    # 预加载脚本
├── src/              # React 源代码
│   ├── components/   # React 组件
│   ├── hooks/        # 自定义 Hooks
│   ├── lib/          # 业务逻辑库
│   ├── store/        # 状态管理
│   └── types/        # TypeScript 类型定义
├── index.html        # 主 HTML 文件
├── package.json      # 项目配置
├── tsconfig.json     # TypeScript 配置
└── vite.config.ts    # Vite 配置
```

## 说明

### 不应提交到仓库的文件/文件夹

以下文件由本地开发环境生成，已通过 `.gitignore` 排除：

| 文件/文件夹 | 说明 |
|------------|------|
| `node_modules/` | npm 安装的依赖包 |
| `dist/` | Vite 构建输出的生产文件 |
| `dist-electron/` | Electron 构建输出的生产文件 |
| `release/` | Electron-builder 打包输出目录 |
| `.claude/` | Claude Code 工作目录 |

### 克隆仓库后的初始化步骤

```bash
# 1. 克隆仓库
git clone https://github.com/B14CKST4r/General-Lottery.git -b Agnesyu
cd General-Lottery

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

## 技术栈

- **框架**: Electron
- **前端**: React + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand