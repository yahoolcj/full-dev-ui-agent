# Project UI Agent TODO 清单

## 本次已完成

- 完成 Next.js App Router + TypeScript + Tailwind CSS 项目初始化。
- 按 MVP 文档实现核心页面：
  - 首页 `/`
  - 项目列表 `/projects`
  - 创建项目 `/projects/new`
  - 项目概览 `/projects/[id]`
  - 设计语言编辑 `/projects/[id]/style`
  - 资产生成 `/projects/[id]/generate`
  - 资产库 `/projects/[id]/assets`
- 实现项目创建流程：输入产品信息后自动生成项目设计语言。
- 实现可编辑设计语言表单，支持保存、重新生成和 JSON 预览。
- 实现 Prompt Compiler：根据项目、设计语言、资产类型和用户需求生成完整图片 Prompt。
- 实现 mock 图片生成流程，支持生成并保存视觉资产。
- 实现资产库：支持筛选、下载、查看 Prompt、喜欢和不喜欢反馈。
- 实现 API 路由：
  - `/api/projects`
  - `/api/projects/[id]`
  - `/api/projects/[id]/design-system`
  - `/api/projects/[id]/design-system/generate`
  - `/api/projects/[id]/assets`
  - `/api/projects/[id]/assets/generate`
  - `/api/projects/[id]/assets/[assetId]/feedback`
- 添加 Supabase schema 草稿：`supabase/schema.sql`。
- 添加 Supabase client/server 接入边界。
- 将整体界面文案改为中文版本。
- 将 mock 设计语言和生成页 Prompt 输出改为中文。
- 完成基础测试覆盖：
  - 设计语言生成
  - Prompt 编译
  - mock 数据层
- 已通过验证：
  - `npm test`
  - `npm run lint`
  - `npm run build`
- 已部署到 Vercel：
  - 生产地址：https://pd-ui-agent.vercel.app
  - 部署详情：https://vercel.com/yahoolcjs-projects/pd-ui-agent/EdnK4ZiTYcZtK8Wu8nuCjGMLbF8V

## 当前实现说明

- 当前 MVP 使用内存 mock 数据层，刷新服务或重新部署后数据不会持久保存。
- 当前图片生成是 mock SVG 预览，不是真实 AI 图片生成。
- 当前 Supabase 和 OpenAI 代码边界已预留，但还没有接入真实环境变量与生产数据流。
- 当前项目已连接到 Vercel，并可通过生产地址访问。

## 待办事项

### P0：上线前补强

- 接入 Supabase Postgres，将项目、设计语言、资产、反馈从内存数据迁移到数据库。
- 接入 Supabase Storage，将生成图片保存到 `assets` bucket。
- 接入真实 OpenAI 图片生成 API，替换当前 mock 图片生成。
- 为生产环境配置必要环境变量：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_APP_URL`
- 增加 API 错误处理和用户可恢复提示。
- 增加生成中、失败、重试等状态。
- 增加基础端到端验证，覆盖创建项目到生成资产的完整 Demo 流程。

### P1：产品体验增强

- 增加用户登录和项目归属。
- 增加真实资产缩略图和下载文件名规则。
- 支持基于已有资产重新生成。
- 支持资产反馈影响后续设计偏好。
- 增加 Tailwind Token / CSS 变量导出。
- 将 Icon Set 从图片预览升级为 SVG / React 组件导出。

### P2：长期方向

- 增加本地 CLI：`ui-agent init`、`ui-agent generate`、`ui-agent export tokens`。
- 增加 Cursor / VS Code 插件能力。
- 增加 MCP Server。
- 增加团队协作、权限、资产版本管理。
- 增加 Figma 导出或插件能力。
