# Codia

[English](README.md) | 简体中文

为人类和 API 生成精美的代码图片。

Codia 可以将源代码转换为清晰的图片，适用于文档、博客、社交分享和自动化场景。它在 `/try-it` 提供了一个浏览器 Playground、渲染 API、轻量级渲染统计，以及面向 Agent 的 `llms.txt` 文档端点。

## 功能特性

- 交互式 `/try-it` Playground，支持语言、主题、背景、内边距、宽度、行号、复制和下载等控制项。
- `POST /v1/code/render` API，可从 JSON 数据生成代码图片。
- 基于 SQLite 的渲染与满意操作记录，用于使用统计。
- 在 `/docs` 提供 OpenAPI 文档。
- 提供 Docker Compose 与 OVO 部署脚本。

## 环境要求

- Node.js 24
- npm
- 兼容 SQLite 的文件系统访问权限

## 开发

```bash
npm ci
npm run dev
```

应用默认运行在 `http://localhost:3000`。

常用命令：

```bash
npm run typecheck
npm run build
npm start
```

## 环境变量

```env
PORT=3000
DATABASE_DIR=/root/apps/codia/databases
```

`DATABASE_DIR` 是 Codia 存储 `codia.sqlite` 的目录。

对于 Docker Compose，`DATABASE_DIR` 作为宿主机持久化目录，会被挂载到容器的 `/app/databases`。

## Docker

```bash
docker compose up -d --build
```

使用自定义数据库目录：

```bash
DATABASE_DIR=/root/apps/codia/databases docker compose up -d --build
```

## API

渲染代码图片：

```bash
curl -X POST http://localhost:3000/v1/code/render \
  -H "content-type: application/json" \
  -d '{
    "language": "typescript",
    "theme": "dracula",
    "code": "console.log(\"hello codia\")",
    "bgColor": "#0f172a",
    "borderSize": 12,
    "containerWidth": 600,
    "showLineNumbers": true
  }'
```

更多详情可在 `/docs` 和 `/llms.txt` 查看。

## 部署

仓库包含 OVO 发布工作流，相关脚本位于 `scripts/ovo` 目录下。

数据库持久化的主要部署变量为：

```env
DATABASE_DIR=/root/apps/codia/databases
```

应用会在需要时自动创建该目录，并将 SQLite 文件存储为 `codia.sqlite`。
