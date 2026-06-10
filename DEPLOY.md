# 🚀 全能个人成长管理平台 — 免费部署指南

## 架构概览

```
┌──────────────────────────────────────────────┐
│                  Vercel (免费)                 │
│  Next.js 前端 + Serverless Functions (API)    │
│  ┌─────────────┐  ┌──────────────────────┐   │
│  │ 静态页面     │  │ /api/* Serverless    │   │
│  │ (CDN 加速)  │  │ (Node.js Runtime)    │   │
│  └─────────────┘  └──────────────────────┘   │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│              Supabase (免费)                   │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Auth     │ │PostgreSQL│ │ Realtime    │  │
│  │ (邮箱登录)│ │ (500MB)  │ │ (WebSocket) │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
└──────────────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│           浏览器端 (IndexedDB)                 │
│  离线模式：所有数据暂存本地，上线后自动同步      │
└──────────────────────────────────────────────┘
```

**全部免费！** Vercel Hobby Plan + Supabase Free Tier 即可运行。

---

## 第一步：Supabase 初始化（5分钟）

### 1.1 创建 Supabase 项目

1. 打开 [supabase.com](https://supabase.com) → 注册/登录
2. 点击 **New Project**
3. 填入项目名称（如 `personal-growth`）
4. 设置数据库密码（**请记下来！**）
5. Region 选择 **Northeast Asia (Tokyo)** — 离你最近
6. 等待数据库创建（约2分钟）

### 1.2 执行数据库迁移

1. 在 Supabase 左侧菜单 → **SQL Editor**
2. 点击 **New Query**
3. 复制粘贴本项目的 `src/lib/db/migration.sql` **全部内容**
4. 点击 **Run**（右下角绿色按钮）
5. 看到 "Success" 即完成

这会创建 21 张表 + RLS 权限 + 自动触发器。

### 1.3 获取 API 密钥

1. Supabase 左侧菜单 → **Settings** → **API**
2. 复制以下两个值：
   - **Project URL** (如 `https://xxxxx.supabase.co`)
   - **anon public key** (以 `eyJ...` 开头)

### 1.4 配置 Auth（可选，如需登录功能）

1. Supabase 左侧菜单 → **Authentication** → **Providers**
2. 确保 **Email** provider 已启用
3. 建议关闭 "Confirm email"（开发阶段），生产环境建议开启

---

## 第二步：Vercel 部署（3分钟）

### 2.1 推送代码到 GitHub

```bash
cd "d:\新建文件夹\personal-growth-platform"

# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库后推送
git remote add origin https://github.com/YOUR_USERNAME/personal-growth-platform.git
git branch -M main
git push -u origin main
```

### 2.2 部署到 Vercel

1. 打开 [vercel.com](https://vercel.com) → 注册/登录（推荐用 GitHub 账号）
2. 点击 **New Project**
3. 导入你的 GitHub 仓库 `personal-growth-platform`
4. 框架自动识别为 Next.js — 无需修改配置
5. **Environment Variables**（关键步骤！）添加：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co`（从 Supabase 复制） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...`（从 Supabase 复制） |
| `SUPABASE_SERVICE_ROLE_KEY` | （可选，仅管理功能需要） |

6. 点击 **Deploy**
7. 等待2分钟 → 获得 `https://your-app.vercel.app` 域名！

### 2.3 自定义域名（可选）

Vercel → Settings → Domains → 添加你自己的域名

---

## 第三步：不使用 Supabase？（纯离线模式）

如果你不想配置 Supabase，项目**开箱即用**：

1. 不要设置 `NEXT_PUBLIC_SUPABASE_URL` 环境变量（或保持占位值）
2. 部署后，所有 API 路由返回 `{ offline: true }`
3. 所有数据存储在浏览器 IndexedDB 中
4. **缺点**：数据只在本地浏览器中，换设备/清除缓存会丢失

---

## 费用预估

| 服务 | 免费额度 | 是否够用 |
|------|---------|---------|
| **Vercel** | 100GB 带宽/月, 100 次部署/天 | ✅ 个人使用完全足够 |
| **Supabase** | 500MB 数据库, 50,000 月活用户, 2GB 存储 | ✅ 远超个人需求 |
| **总计** | **$0/月** | ✅ **永久免费** |

---

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量模板
# 编辑 .env.local，填入 Supabase 凭据（或留空使用离线模式）

# 3. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

---

## 项目结构速查

| 目录 | 内容 |
|------|------|
| `src/app/(main)/` | 8个模块页面 + 设置 |
| `src/components/` | 23个UI组件（9个分类） |
| `src/hooks/` | 12个数据hooks（离线优先） |
| `src/lib/db/` | IndexedDB 数据库 + 同步引擎 |
| `src/lib/supabase/` | Supabase 客户端（浏览器+服务端） |
| `src/stores/` | Zustand 状态管理 |
| `src/app/api/` | Serverless Functions（3组API） |
| `public/locales/` | 9种语言翻译文件 |
| `src/lib/db/migration.sql` | Supabase 数据库建表脚本 |

---

## 常见问题

**Q: 离线模式数据会丢失吗？**
A: IndexedDB 数据存在浏览器本地，清除浏览器数据会丢失。建议定期在设置面板 **导出 JSON 备份**，或配置 Supabase 实现云端同步。

**Q: 如何更换语言？**
A: 点击右上角 ⚙️ → 设置面板 → 选择语言（9种可选，实时切换）。

**Q: 如何切换主题？**
A: 点击导航栏 ☀️ 图标循环切换（日间/暗色/护眼三种模式）。

**Q: 商业板块为什么是灰色的？**
A: 商业模块正在规划中，暂未开放。所有其他7个模块功能完整可用。
