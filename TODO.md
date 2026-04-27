# Project UI Agent TODO 清单

## 已完成

- 完成 Next.js App Router + TypeScript + Tailwind CSS MVP 页面：
  - `/`
  - `/projects`
  - `/projects/new`
  - `/projects/[id]`
  - `/projects/[id]/style`
  - `/projects/[id]/generate`
  - `/projects/[id]/assets`
- 完成项目创建、设计语言生成/编辑、Prompt 编译、资产生成、资产库和反馈 API。
- 完成当前阶段资产类型调整：
  - `logo_square`：LOGO 正方
  - `logo_square_wordmark`：LOGO 正方带文字
  - `login_background`：登录页背景
  - `custom_image`：其他图，支持自定义宽高和内容
- 完成 Supabase 接入：
  - 已执行 `supabase/schema.sql`
  - 已创建并验证 `projects`、`design_systems`、`assets`、`asset_feedback`、`generation_logs`
  - 已创建并验证 Storage bucket：`assets`
  - 本地 `.env.local` 已配置 Supabase 连接信息
- 完成全局模型配置中心：
  - 新增页面 `/settings/models`
  - 侧边栏新增“模型配置”
  - 支持配置模型供应商、`base_url`、环境变量 key 引用、手动 API key
  - 手动 API key 使用 `MODEL_CONFIG_ENCRYPTION_KEY` 加密后存入数据库
  - API 响应不返回明文 key 或密文字段
  - 已创建并验证 `model_providers`、`model_configs`、`model_test_runs`
  - 已初始化 7 个供应商和 9 个 AI 节点
- 默认 AI 节点：
  - `product_understander`
  - `design_system_generator`
  - `prompt_compiler`
  - `asset_prompt_optimizer`
  - `image_generator`
  - `style_critic`
  - `feedback_summarizer`
  - `svg_converter`
  - `ui_code_generator`
- 已通过验证：
  - `npm run lint`
  - `npm test`
  - `npx tsc --noEmit`
  - `node node_modules/next/dist/bin/next build`

## 当前实现说明

- 图片生成仍是 mock SVG 预览，还没有接入真实 `gpt-image-2`。
- 模型配置中心已完成持久化和 UI，但生成链路还没有全面改成通过 `modelRole` 调配置。
- `npm run build` 会调用当前 npm 绑定的 Node.js `18.20.0`，不满足 Next.js 16 的 `>=20.9.0` 要求；直接用 `C:\Program Files\nodejs\node.exe` 运行 Next build 已通过。
- 本次开发过程中暴露过 Supabase service-role key 和 Supabase personal access token，建议在 Supabase 控制台轮换/撤销。

## 待办事项

### P0：上线前补强

- 切换本地和部署环境到 Node.js `>=20.9.0`，让 `npm run build` 正常通过。
- 在 Vercel 配置生产环境变量：
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `MODEL_CONFIG_ENCRYPTION_KEY`
  - `NEXT_PUBLIC_APP_URL`
- 接入真实 `gpt-image-2` 图片生成，替换当前 mock 图片。
- 让图片生成链路通过 `image_generator` 的模型配置读取 provider、baseUrl 和 key。
- 增加生成中、失败、重试等状态。
- 增加端到端验证，覆盖创建项目、生成设计语言、生成资产、保存到 Supabase。
- 轮换已经暴露过的 Supabase 高权限 key。

### P1：产品体验增强

- 增加用户登录和项目归属。
- 增加模型配置测试运行功能，写入 `model_test_runs`。
- 增加真实资产缩略图和下载文件名规则。
- 支持基于已有资产重新生成。
- 支持资产反馈影响后续设计偏好。
- 增加 Tailwind Token / CSS 变量导出。
- 将 LOGO / 图标资产转换为 SVG 或 React 组件。

### P2：长期方向

- 增加本地 CLI：`ui-agent init`、`ui-agent generate`、`ui-agent export tokens`。
- 增加 Cursor / VS Code 插件能力。
- 增加 MCP Server。
- 增加团队协作、权限、资产版本管理。
- 增加 Figma 导出或插件能力。
