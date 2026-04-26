# Project UI Agent Web MVP 项目文档

## 0. 文档目的

本文档用于指导 Codex 或 AI 编程助手开发一个 Web 端 MVP 产品。

产品暂定名：**Project UI Agent**

一句话定位：

> 面向独立开发者和全栈工程师的项目级 AI UI 资产管家。用户输入产品想法，系统生成项目设计语言，并持续生成统一风格的 Logo、Icon、Banner 等 UI 视觉资产。

本 MVP 的目标不是做完整设计平台，也不是替代 Figma，而是验证一个核心假设：

> 用户愿意为“项目级设计语言记忆 + 统一风格素材生成”使用或付费。

---

## 1. 产品背景

全栈开发者在做产品时，经常需要在多个 AI 工具之间切换：

- UI 稿生成工具
- Logo 生成工具
- Icon 生成工具
- Banner 生成工具
- 插画生成工具
- Figma / Canva / 图片生成平台

问题是：

1. 每个平台生成的素材风格不统一。
2. 单个图片生成工具不知道完整产品上下文。
3. UI、Logo、Icon、Banner、插画之间缺少统一设计语言。
4. 全栈工程师更想要“能直接用到项目里的视觉资产”，而不是一次性图片。

Project UI Agent 要解决的是：

> 每个项目都有独立的设计语言和视觉记忆。后续所有素材生成都基于该项目的产品定位、目标用户和设计语言。

---

## 2. MVP 核心目标

MVP 只验证一个闭环：

```txt
创建项目
  ↓
输入产品点子 / PRD
  ↓
AI 生成项目设计语言
  ↓
用户确认 / 编辑设计语言
  ↓
基于项目设计语言生成 Logo / App Icon / Hero Banner / Icon Set
  ↓
保存到资产库
  ↓
用户下载 / 重新生成 / 标记反馈
```

MVP 必须完成：

- 用户可以创建项目。
- AI 可以生成项目设计语言卡。
- 用户可以编辑和保存设计语言。
- 用户可以选择资产类型并输入需求。
- 系统可以根据项目设计语言编译完整 prompt。
- 系统可以调用图片生成模型生成视觉资产。
- 生成结果可以保存到资产库。
- 用户可以查看、下载、重新生成资产。

MVP 暂时不做：

- 在线图片编辑器
- Figma 插件
- Cursor 插件
- 多人协作
- 复杂权限系统
- 复杂版本管理
- 完整设计系统市场
- 高级 AI 风格评分
- 复杂 UI 页面代码生成

---

## 3. 目标用户

### 3.1 第一批用户

- 独立开发者
- 全栈工程师
- 前端开发者
- AI 产品开发者
- 小型 SaaS 创业者
- 用 Cursor / Codex / Claude Code 开发产品的人

### 3.2 用户典型痛点

用户会写代码，但不想花大量时间做设计系统。

他们需要：

- 快速确定产品视觉方向
- 快速生成 Logo、Icon、Banner
- 保持同一个项目内素材风格统一
- 后续可以接入本地代码项目
- 最终希望素材能导出给前端直接使用

---

## 4. 产品命名

MVP 暂定名：

```txt
Project UI Agent
```

备选名称：

```txt
UI Asset Copilot
Project Style Agent
AI Design System Agent
VisualKit AI
StyleOS for Developers
```

中文描述：

```txt
项目级 AI UI 资产管家
开发者视觉资产工作台
项目设计语言智能体
```

---

## 5. MVP 页面结构

MVP 使用 Next.js App Router。

### 5.1 页面路由

```txt
/
/projects
/projects/new
/projects/[id]
/projects/[id]/style
/projects/[id]/generate
/projects/[id]/assets
```

---

## 6. 页面功能说明

### 6.1 首页 `/`

首页用于解释产品价值，并引导用户创建第一个项目。

核心文案：

```txt
为你的软件项目生成统一风格的 UI 视觉资产

输入产品想法，AI 自动生成项目设计语言。
后续 Logo、Icon、Banner、插画都会保持同一套视觉风格。
```

页面模块：

- Hero 区
- 产品价值说明
- MVP 支持的资产类型
- CTA：创建我的第一个项目

CTA 跳转：

```txt
/projects/new
```

---

### 6.2 项目列表页 `/projects`

展示用户所有项目。

每个项目卡片包含：

- 项目名称
- 产品类型
- 目标用户
- 风格关键词
- 资产数量
- 最近更新时间
- 进入项目按钮

空状态：

```txt
你还没有项目。创建一个项目，让 AI 为它生成统一的设计语言。
```

---

### 6.3 创建项目页 `/projects/new`

表单字段：

```txt
项目名称 name
产品描述 description
产品类型 product_type
目标用户 target_users
希望风格 style_preference
参考产品或参考关键词 reference_style
```

示例输入：

```txt
项目名称：TripMind
产品描述：一个 AI 旅行攻略 App，可以根据用户预算、天数和兴趣生成旅行路线。
产品类型：Mobile App
目标用户：20-35 岁年轻自由行用户、情侣、城市周末游用户。
希望风格：清爽、智能、年轻、有探索感。
参考产品：Notion、Airbnb、Duolingo 的轻松感。
```

提交逻辑：

1. 创建 project 记录。
2. 调用 AI 生成设计语言。
3. 保存 design_system 记录。
4. 跳转到 `/projects/[id]/style`。

---

### 6.4 项目详情页 `/projects/[id]`

作为项目 Dashboard。

展示：

- 项目基本信息
- 当前设计语言摘要
- 最近生成的资产
- 快捷操作按钮

快捷操作：

```txt
编辑设计语言
生成新资产
查看资产库
```

---

### 6.5 设计语言页 `/projects/[id]/style`

这是产品核心页面。

展示并允许编辑：

- 品牌关键词
- 色彩系统
- 字体建议
- UI 风格
- 图标风格
- 插画风格
- 布局规则
- 组件规则
- 禁止风格
- Prompt 模板

用户可以修改后保存。

建议 UI：

- 左侧：设计语言表单
- 右侧：设计语言 JSON 预览
- 顶部：保存按钮、重新生成按钮

---

### 6.6 资产生成页 `/projects/[id]/generate`

用户选择资产类型并输入需求。

资产类型：

```txt
logo
app_icon
hero_banner
icon_set
```

字段：

```txt
asset_type
user_request
size
format
```

示例：

```txt
资产类型：Hero Banner
需求：给首页生成一张 Hero Banner，突出 AI 旅行路线规划能力
尺寸：1440x600
```

生成流程：

1. 读取 project。
2. 读取 design_system。
3. 根据 asset_type 和 user_request 编译 prompt。
4. 调用图片生成模型。
5. 将生成图片保存到 storage。
6. 写入 assets 表。
7. 返回生成结果。

页面应展示：

- 当前项目风格摘要
- 资产类型选择器
- 用户需求输入框
- 尺寸选择器
- 生成按钮
- 编译后的 Prompt 预览
- 生成结果预览
- 保存状态

---

### 6.7 资产库页 `/projects/[id]/assets`

展示项目下所有生成资产。

资产卡片包含：

- 图片预览
- 资产类型
- 标题
- 用户原始需求
- 生成时间
- 下载按钮
- 重新生成按钮
- 喜欢 / 不喜欢按钮
- 查看 Prompt 按钮

筛选：

```txt
全部
Logo
App Icon
Hero Banner
Icon Set
```

---

## 7. MVP 支持的资产类型

第一版只支持 4 类。

### 7.1 Logo

用途：品牌标识。

默认规格：

```txt
1024x1024
PNG
```

Prompt 要求：

- 体现产品定位
- 适合 App / Web 品牌
- 简洁、可识别
- 尽量避免复杂文字
- 可以包含抽象符号
- 需要继承项目色彩和风格

---

### 7.2 App Icon

用途：移动 App 图标。

默认规格：

```txt
1024x1024
PNG
```

Prompt 要求：

- 适合圆角方形图标
- 中心图形清晰
- 小尺寸可识别
- 使用项目主色
- 避免复杂背景

---

### 7.3 Hero Banner

用途：官网首页首屏、产品页头图。

默认规格：

```txt
1440x600
PNG
```

Prompt 要求：

- 适合 Web 首屏
- 可以预留文案区域
- 体现产品核心场景
- 包含产品相关视觉元素
- 继承项目插画和 UI 风格

---

### 7.4 Icon Set

MVP 第一版可以先用图片模型生成一张图标集预览图。

后续 P1 再升级为 SVG Icon 生成。

默认规格：

```txt
1024x1024
PNG
```

Prompt 要求：

- 6 到 8 个图标
- 同一风格
- 同一描边粗细
- 同一圆角规则
- 白底或透明背景感
- 适合 Web / App UI 使用

---

## 8. 技术选型

### 8.1 推荐技术栈

```txt
Next.js
TypeScript
Tailwind CSS
shadcn/ui
Supabase Postgres
Supabase Auth
Supabase Storage
Vercel AI SDK
OpenAI API
Vercel
```

### 8.2 选择理由

- Next.js 适合做全栈 Web MVP，App Router 便于组织页面和 API。
- TypeScript 保证数据结构和 API 类型稳定。
- Tailwind CSS + shadcn/ui 可以快速做出清爽后台和表单页面。
- Supabase 同时提供 Postgres、Auth、Storage，适合快速验证产品。
- Vercel AI SDK 适合在 TypeScript 项目中接入不同 AI 模型。
- OpenAI 图片生成 API 可用于生成 Logo、Banner、Icon 概念图。
- Vercel 适合快速部署 Next.js 项目。

---

## 9. 系统架构

```txt
Next.js Web App
  ↓
Project Workspace
  ↓
Design Language Generator
  ↓
Design System JSON
  ↓
Prompt Compiler
  ↓
Image Generation API
  ↓
Supabase Storage
  ↓
Asset Library
```

核心模块：

```txt
1. Project Module
2. Design System Module
3. Prompt Compiler Module
4. Image Generation Module
5. Asset Library Module
6. Feedback Module
```

---

## 10. 项目目录结构

```txt
app/
  page.tsx
  projects/
    page.tsx
    new/
      page.tsx
    [id]/
      page.tsx
      style/
        page.tsx
      generate/
        page.tsx
      assets/
        page.tsx

  api/
    projects/
      route.ts
    projects/[id]/
      route.ts
    projects/[id]/design-system/
      route.ts
    projects/[id]/design-system/generate/
      route.ts
    projects/[id]/assets/
      route.ts
    projects/[id]/assets/generate/
      route.ts

components/
  layout/
    AppShell.tsx
    Sidebar.tsx
    Header.tsx
  project/
    ProjectCard.tsx
    ProjectForm.tsx
    ProjectDashboard.tsx
  design-system/
    DesignSystemForm.tsx
    DesignSystemCard.tsx
    ColorPaletteEditor.tsx
    JsonPreview.tsx
  assets/
    AssetGenerator.tsx
    AssetGrid.tsx
    AssetCard.tsx
    AssetTypeSelector.tsx
    PromptPreview.tsx
  ui/
    // shadcn/ui components

lib/
  supabase/
    client.ts
    server.ts
  ai/
    generateDesignSystem.ts
    compileAssetPrompt.ts
    generateImage.ts
  db/
    projects.ts
    designSystems.ts
    assets.ts
    feedback.ts
  utils/
    format.ts
    storage.ts

types/
  project.ts
  design-system.ts
  asset.ts
  api.ts

supabase/
  schema.sql
```

---

## 11. 环境变量

`.env.local` 示例：

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

注意：

- `SUPABASE_SERVICE_ROLE_KEY` 只能在服务端使用。
- `OPENAI_API_KEY` 只能在服务端使用。
- 图片生成、数据库写入、Storage 上传都应走服务端 API。

---

## 12. 数据库设计

### 12.1 projects

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  description text,
  product_type text,
  target_users text,
  style_preference text,
  reference_style text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

### 12.2 design_systems

```sql
create table design_systems (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  brand_keywords jsonb,
  color_palette jsonb,
  typography jsonb,
  ui_style text,
  icon_style text,
  illustration_style text,
  layout_rules jsonb,
  component_rules jsonb,
  negative_rules jsonb,
  prompt_template text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

### 12.3 assets

```sql
create table assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  asset_type text not null,
  title text,
  user_request text,
  compiled_prompt text,
  file_url text,
  storage_path text,
  thumbnail_url text,
  size text,
  format text,
  status text default 'generated',
  style_score int,
  created_at timestamptz default now()
);
```

---

### 12.4 asset_feedback

```sql
create table asset_feedback (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  feedback_type text,
  feedback_text text,
  created_at timestamptz default now()
);
```

---

### 12.5 generation_logs

```sql
create table generation_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  asset_id uuid references assets(id),
  model text,
  input jsonb,
  output jsonb,
  created_at timestamptz default now()
);
```

---

## 13. TypeScript 类型定义

### 13.1 Project

```ts
export type Project = {
  id: string;
  user_id?: string | null;
  name: string;
  description?: string | null;
  product_type?: string | null;
  target_users?: string | null;
  style_preference?: string | null;
  reference_style?: string | null;
  created_at: string;
  updated_at: string;
};
```

---

### 13.2 DesignSystem

```ts
export type DesignSystem = {
  id: string;
  project_id: string;
  brand_keywords: string[];
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    style: string;
    recommended_fonts: string[];
  };
  ui_style: string;
  icon_style: string;
  illustration_style: string;
  layout_rules: string[];
  component_rules: string[];
  negative_rules: string[];
  prompt_template: string;
  created_at: string;
  updated_at: string;
};
```

---

### 13.3 Asset

```ts
export type AssetType = 'logo' | 'app_icon' | 'hero_banner' | 'icon_set';

export type Asset = {
  id: string;
  project_id: string;
  asset_type: AssetType;
  title?: string | null;
  user_request?: string | null;
  compiled_prompt?: string | null;
  file_url?: string | null;
  storage_path?: string | null;
  thumbnail_url?: string | null;
  size?: string | null;
  format?: string | null;
  status: 'generating' | 'generated' | 'failed';
  style_score?: number | null;
  created_at: string;
};
```

---

## 14. API 设计

### 14.1 创建项目

```txt
POST /api/projects
```

Request：

```json
{
  "name": "TripMind",
  "description": "一个 AI 旅行攻略 App，可以根据用户预算、天数和兴趣生成旅行路线。",
  "product_type": "Mobile App",
  "target_users": "20-35 岁年轻自由行用户、情侣、城市周末游用户",
  "style_preference": "清爽、智能、年轻、有探索感",
  "reference_style": "Notion、Airbnb、Duolingo"
}
```

Response：

```json
{
  "project": {},
  "design_system": {}
}
```

逻辑：

1. 创建项目。
2. 调用 `generateDesignSystem(project)`。
3. 保存设计语言。
4. 返回项目和设计语言。

---

### 14.2 获取项目列表

```txt
GET /api/projects
```

Response：

```json
{
  "projects": []
}
```

---

### 14.3 获取项目详情

```txt
GET /api/projects/[id]
```

Response：

```json
{
  "project": {},
  "design_system": {},
  "recent_assets": []
}
```

---

### 14.4 获取设计语言

```txt
GET /api/projects/[id]/design-system
```

---

### 14.5 更新设计语言

```txt
PATCH /api/projects/[id]/design-system
```

Request：

```json
{
  "brand_keywords": [],
  "color_palette": {},
  "typography": {},
  "ui_style": "",
  "icon_style": "",
  "illustration_style": "",
  "layout_rules": [],
  "component_rules": [],
  "negative_rules": [],
  "prompt_template": ""
}
```

---

### 14.6 重新生成设计语言

```txt
POST /api/projects/[id]/design-system/generate
```

逻辑：

1. 读取 project。
2. 调用 AI 生成新的 design_system。
3. 更新数据库。
4. 返回新的 design_system。

---

### 14.7 生成资产

```txt
POST /api/projects/[id]/assets/generate
```

Request：

```json
{
  "asset_type": "hero_banner",
  "user_request": "给首页生成一张 Hero Banner，突出 AI 旅行路线规划能力",
  "size": "1440x600",
  "format": "png"
}
```

Response：

```json
{
  "asset": {},
  "compiled_prompt": "",
  "image_url": ""
}
```

逻辑：

1. 读取 project。
2. 读取 design_system。
3. 调用 `compileAssetPrompt()`。
4. 调用 `generateImage()`。
5. 上传图片到 Supabase Storage。
6. 写入 assets 表。
7. 写入 generation_logs 表。
8. 返回结果。

---

### 14.8 获取资产列表

```txt
GET /api/projects/[id]/assets
```

支持 query：

```txt
?type=logo
?type=hero_banner
```

---

### 14.9 添加资产反馈

```txt
POST /api/projects/[id]/assets/[assetId]/feedback
```

Request：

```json
{
  "feedback_type": "like",
  "feedback_text": "这个风格很符合项目"
}
```

---

## 15. 模型层与在线配置

这是本项目最重要的工程层之一：**不要把模型写死在代码里**。

MVP 应该从第一版开始支持“模型在线配置”，让开发者可以在后台针对不同 Agent 测试不同模型能力、成本和稳定性。

核心设计原则：

```txt
不同 Agent 使用不同模型
不同任务可以在线切换模型
每次生成都记录使用的模型
模型配置存数据库，不写死在代码中
图片模型和文本模型分开配置
```

---

### 15.1 为什么要做模型在线配置

Project UI Agent 内部至少有几类不同任务：

```txt
1. 产品理解
2. 设计语言生成
3. Prompt 编译
4. 图片生成
5. 风格一致性检查
6. 资产反馈总结
7. 后续 UI 代码生成
```

这些任务对模型能力的要求不同。

例如：

- 设计语言生成需要审美、产品理解、结构化 JSON 输出。
- Prompt 编译需要稳定、便宜、可控。
- 风格一致性检查需要图像理解能力。
- UI 代码生成需要强代码能力。
- 图片生成需要单独的图像生成模型。

所以第一版就应该抽象出模型配置层。

---

### 15.2 Agent 与模型角色设计

系统内部不要直接写：

```ts
model: 'xxx-model-name'
```

而应该写：

```ts
modelRole: 'design_system_generator'
```

再通过数据库读取当前角色绑定的模型。

推荐模型角色：

```txt
design_system_generator
prompt_compiler
asset_prompt_optimizer
image_generator
style_critic
feedback_summarizer
ui_code_generator
```

---

### 15.3 MVP 推荐默认模型组合

第一版可以用下面的默认配置。

```txt
design_system_generator：强文本 / 强审美 / 支持结构化输出的模型
prompt_compiler：速度快、成本低、稳定输出的模型
asset_prompt_optimizer：中高能力文本模型
image_generator：图片生成模型
style_critic：支持图像理解的多模态模型
feedback_summarizer：低成本文本模型
ui_code_generator：强代码模型
```

如果使用 OpenAI 作为第一版主供应商，推荐：

```txt
design_system_generator：GPT-5.5 / GPT-5.1 / GPT-4.1 级别文本模型
prompt_compiler：GPT-5 mini / GPT-4.1 mini 级别模型
asset_prompt_optimizer：GPT-5.5 / GPT-5.1 级别模型
image_generator：gpt-image-2
style_critic：支持视觉输入的多模态模型
feedback_summarizer：mini 级别低成本模型
ui_code_generator：GPT-5.5 / Claude Opus / Claude Sonnet / Gemini Pro 级别代码模型
```

注意：具体模型名称应在后台配置，不要写死。

---

### 15.4 模型供应商设计

MVP 建议至少预留这些 provider：

```txt
openai
anthropic
google
vercel_ai_gateway
fal
replicate
custom
```

含义：

- openai：文本、结构化输出、图像生成。
- anthropic：复杂文本推理、长上下文、代码生成。
- google：长上下文、多模态和性价比测试。
- vercel_ai_gateway：统一接入多个模型供应商。
- fal / replicate：接入其他图片生成模型。
- custom：允许用户后续配置自定义 API endpoint。

---

### 15.5 数据库表：model_providers

```sql
create table model_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider_key text not null,
  base_url text,
  api_key_env text,
  is_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

示例：

```txt
name: OpenAI
provider_key: openai
api_key_env: OPENAI_API_KEY

name: Anthropic
provider_key: anthropic
api_key_env: ANTHROPIC_API_KEY

name: Google Gemini
provider_key: google
api_key_env: GOOGLE_GENERATIVE_AI_API_KEY
```

---

### 15.6 数据库表：model_configs

```sql
create table model_configs (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  provider text not null,
  model_name text not null,
  temperature numeric default 0.7,
  max_tokens int,
  top_p numeric,
  response_format text,
  is_enabled boolean default true,
  is_default boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

示例数据：

```sql
insert into model_configs (
  role,
  provider,
  model_name,
  temperature,
  response_format,
  is_default,
  notes
) values
(
  'design_system_generator',
  'openai',
  'gpt-5.5',
  0.8,
  'json',
  true,
  '用于生成项目设计语言，要求审美和结构化输出能力强'
),
(
  'prompt_compiler',
  'openai',
  'gpt-5-mini',
  0.4,
  'text',
  true,
  '用于将用户一句话需求编译成完整图片生成 prompt'
),
(
  'image_generator',
  'openai',
  'gpt-image-2',
  0.7,
  'image',
  true,
  '用于生成 Logo、Banner、App Icon、Icon Set'
);
```

---

### 15.7 数据库表：model_test_runs

用于记录不同模型的测试结果。

```sql
create table model_test_runs (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  provider text not null,
  model_name text not null,
  input jsonb,
  output jsonb,
  latency_ms int,
  cost_estimate numeric,
  quality_score int,
  notes text,
  created_at timestamptz default now()
);
```

这个表的作用：

```txt
1. 对比不同模型输出质量
2. 记录成本和延迟
3. 为后续自动模型路由提供依据
4. 帮助开发者选择默认模型
```

---

### 15.8 后台模型配置页面

MVP 可以加一个隐藏管理页：

```txt
/admin/models
```

页面功能：

```txt
1. 查看所有模型角色
2. 为每个角色选择 provider
3. 填写 model_name
4. 配置 temperature / max_tokens / response_format
5. 启用 / 禁用模型配置
6. 设置默认模型
7. 运行测试
8. 查看最近测试结果
```

页面结构：

```txt
Model Role          Provider       Model Name        Default
设计语言生成         OpenAI         gpt-5.5          Yes
Prompt 编译          OpenAI         gpt-5-mini       Yes
图片生成             OpenAI         gpt-image-2      Yes
风格检查             OpenAI         vision model     No
UI 代码生成          Anthropic      claude-sonnet    No
```

---

### 15.9 模型解析函数

新增文件：

```txt
lib/ai/modelRegistry.ts
```

职责：

```txt
根据 role 从数据库读取启用的默认模型配置。
```

示例：

```ts
export type ModelRole =
  | 'design_system_generator'
  | 'prompt_compiler'
  | 'asset_prompt_optimizer'
  | 'image_generator'
  | 'style_critic'
  | 'feedback_summarizer'
  | 'ui_code_generator';

export async function getModelConfig(role: ModelRole) {
  // 1. 从 model_configs 查询 role 对应的默认配置
  // 2. 如果没有配置，返回 fallback 默认配置
  // 3. 不在业务代码中写死具体模型
}
```

---

### 15.10 AI SDK Provider Adapter

新增文件：

```txt
lib/ai/providerAdapter.ts
```

职责：

```txt
把数据库里的 provider + model_name 转成实际可调用的模型对象。
```

伪代码：

```ts
export function resolveTextModel(config: ModelConfig) {
  switch (config.provider) {
    case 'openai':
      return openai(config.model_name);
    case 'anthropic':
      return anthropic(config.model_name);
    case 'google':
      return google(config.model_name);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
```

图片模型单独处理：

```ts
export async function generateImageWithConfig(config, prompt, options) {
  switch (config.provider) {
    case 'openai':
      return generateOpenAIImage(config.model_name, prompt, options);
    case 'fal':
      return generateFalImage(config.model_name, prompt, options);
    case 'replicate':
      return generateReplicateImage(config.model_name, prompt, options);
    default:
      throw new Error(`Unsupported image provider: ${config.provider}`);
  }
}
```

---

### 15.11 在线模型测试功能

新增 API：

```txt
POST /api/admin/models/test
```

Request：

```json
{
  "role": "design_system_generator",
  "provider": "openai",
  "model_name": "gpt-5.5",
  "test_input": {
    "name": "TripMind",
    "description": "AI 旅行攻略 App",
    "target_users": "年轻自由行用户",
    "style_preference": "清爽、智能、年轻、有探索感"
  }
}
```

Response：

```json
{
  "output": {},
  "latency_ms": 3200,
  "quality_score": null,
  "saved_test_run_id": "uuid"
}
```

---

### 15.12 模型调用日志

现有 generation_logs 需要补充模型字段。

建议字段：

```sql
alter table generation_logs add column provider text;
alter table generation_logs add column model_name text;
alter table generation_logs add column role text;
alter table generation_logs add column latency_ms int;
alter table generation_logs add column cost_estimate numeric;
```

每次 AI 调用都要记录：

```txt
使用哪个 role
使用哪个 provider
使用哪个 model_name
输入是什么
输出是什么
耗时多少
是否失败
```

---

### 15.13 推荐的模型调用策略

MVP 默认策略：

```txt
高价值生成：用强模型
高频编译：用便宜模型
图片生成：单独配置图片模型
测试阶段：允许手动切换模型
生产阶段：每个 role 有默认模型
```

具体建议：

```txt
设计语言生成：优先质量
Prompt 编译：优先稳定和成本
图片生成：优先视觉质量
风格检查：优先多模态理解
反馈总结：优先低成本
UI 代码生成：优先代码质量
```

---

### 15.14 P0 / P1 实施建议

P0 必须做：

```txt
1. model_configs 表
2. getModelConfig(role)
3. generateDesignSystem 使用 model_configs
4. compileAssetPrompt 使用 model_configs
5. generateImage 使用 model_configs
6. generation_logs 记录 provider 和 model_name
```

P1 再做：

```txt
1. /admin/models 管理页面
2. 在线测试模型
3. model_test_runs 表
4. 不同模型输出对比
5. 成本和延迟统计
```

P0 阶段即使没有后台页面，也要确保模型配置来自数据库或环境配置，而不是散落在业务代码里。

---

## 16. AI 模块设计

### 15.1 generateDesignSystem

文件：

```txt
lib/ai/generateDesignSystem.ts
```

输入：

```ts
{
  name: string;
  description: string;
  product_type?: string;
  target_users?: string;
  style_preference?: string;
  reference_style?: string;
}
```

输出：

```ts
DesignSystem
```

系统 Prompt：

```txt
你是一个资深产品设计师和品牌视觉设计师。

用户会提供一个产品想法、目标用户和期望风格。
你的任务是为这个产品生成一套项目级设计语言。

请输出严格 JSON，不要输出多余解释。

JSON 字段包括：
- brand_keywords: string[]
- color_palette: {
    primary: string,
    secondary: string,
    accent: string,
    background: string,
    text: string
  }
- typography: {
    style: string,
    recommended_fonts: string[]
  }
- ui_style: string
- icon_style: string
- illustration_style: string
- layout_rules: string[]
- component_rules: string[]
- negative_rules: string[]
- prompt_template: string

要求：
1. 设计语言要适合真实 Web / App 产品。
2. 风格要具体，不要只说“高级”“简洁”。
3. 色彩需要给出合理 hex 值。
4. 图标、插画、UI 布局要保持一致。
5. negative_rules 要明确指出不应该出现的风格。
6. prompt_template 要能用于后续生成 Logo、Icon、Banner、插画。
```

---

### 15.2 compileAssetPrompt

文件：

```txt
lib/ai/compileAssetPrompt.ts
```

输入：

```ts
{
  project: Project;
  designSystem: DesignSystem;
  assetType: AssetType;
  userRequest: string;
  size?: string;
  format?: string;
}
```

输出：

```ts
string
```

逻辑：

根据项目、设计语言和资产需求，生成完整图片 prompt。

Prompt 编译原则：

- 必须继承项目设计语言。
- 必须体现产品定位。
- 必须适配资产类型。
- 必须包含画面元素建议。
- 必须包含风格约束。
- 必须包含 negative prompt。
- 输出只返回最终 prompt。

通用模板：

```txt
为 {project.name} 这个 {project.product_type} 生成 {assetTypeLabel}。

产品定位：
{project.description}

目标用户：
{project.target_users}

用户需求：
{userRequest}

品牌关键词：
{designSystem.brand_keywords}

视觉风格：
{designSystem.ui_style}

色彩系统：
主色 {primary}，辅助色 {secondary}，强调色 {accent}，背景色 {background}，文本色 {text}

图标风格：
{designSystem.icon_style}

插画风格：
{designSystem.illustration_style}

布局规则：
{designSystem.layout_rules}

组件规则：
{designSystem.component_rules}

画面建议：
根据产品定位和用户需求，设计适合该资产类型的视觉元素。

禁止风格：
{designSystem.negative_rules}

输出规格：
{size}，{format}
```

不同 asset_type 的补充规则：

#### logo

```txt
需要简洁、可识别，适合作为品牌标识。避免复杂细节和大段文字。可以使用抽象符号、产品隐喻和品牌主色。
```

#### app_icon

```txt
需要适合移动 App 图标，圆角方形构图，中心图形清晰，小尺寸仍可识别。避免复杂背景和细小文字。
```

#### hero_banner

```txt
需要适合官网首页 Hero 区，横向构图，可以预留标题文案区域。画面应体现产品核心价值和使用场景。
```

#### icon_set

```txt
生成一套 6 到 8 个统一风格图标，保持一致的描边、圆角、透视和视觉复杂度。图标应该适合产品功能入口使用。
```

---

### 15.3 generateImage

文件：

```txt
lib/ai/generateImage.ts
```

输入：

```ts
{
  prompt: string;
  size: string;
  format: string;
}
```

输出：

```ts
{
  buffer: Buffer;
  contentType: string;
}
```

注意：

- MVP 可先统一使用 PNG。
- 需要处理生成失败、超时、API 错误。
- 生成成功后上传到 Supabase Storage。
- 不要在前端暴露 API Key。

---

## 16. Storage 设计

Supabase Storage bucket：

```txt
assets
```

路径规则：

```txt
projects/{projectId}/{assetType}/{assetId}.png
```

示例：

```txt
projects/123/logo/asset-456.png
projects/123/hero_banner/asset-789.png
```

第一版可以使用 public bucket，方便预览和下载。

后续如果做登录和订阅，需要改成私有 bucket + signed URL。

---

## 17. UI 风格建议

产品本身应该简洁、开发者友好、偏 SaaS 工具风。

建议：

- 浅色背景
- 左侧导航
- 卡片式布局
- 大圆角
- 清晰表单
- 资产网格展示
- Prompt 可折叠预览
- JSON 可复制

页面布局：

```txt
Sidebar + Main Content
```

导航项：

```txt
Projects
Create Project
```

项目内导航：

```txt
Overview
Design Language
Generate
Assets
```

---

## 18. P0 开发任务清单

### 18.1 初始化项目

- 创建 Next.js + TypeScript 项目
- 安装 Tailwind CSS
- 安装 shadcn/ui
- 配置基础布局
- 配置 Supabase client
- 配置环境变量

验收：

- 本地项目可以启动
- 首页可以访问
- 基础 UI 样式正常

---

### 18.2 数据库和类型

- 创建 Supabase 表
- 添加 TypeScript 类型
- 编写 db helper

需要实现：

```txt
createProject
getProjects
getProjectById
createDesignSystem
getDesignSystemByProjectId
updateDesignSystem
createAsset
getAssetsByProjectId
createFeedback
```

---

### 18.3 项目创建流程

- 完成 `/projects/new` 表单
- 提交后创建项目
- 自动生成设计语言
- 保存设计语言
- 跳转设计语言页

验收：

- 用户输入项目描述后，可以看到 AI 生成的设计语言卡。

---

### 18.4 设计语言页

- 展示设计语言
- 支持编辑
- 支持保存
- 支持重新生成
- 支持 JSON 预览

验收：

- 用户可以修改主色、风格描述、禁止风格等字段。
- 保存后生成资产时使用最新风格。

---

### 18.5 Prompt Compiler

- 实现 `compileAssetPrompt`
- 根据不同 asset_type 追加不同规则
- 在生成页展示 compiled prompt

验收：

- 用户只输入一句简单需求，系统能生成完整 prompt。

---

### 18.6 资产生成

- 完成 `/projects/[id]/generate` 页面
- 支持 asset_type 选择
- 支持 user_request 输入
- 支持 size 选择
- 调用图片生成 API
- 上传结果到 Supabase Storage
- 写入 assets 表

验收：

- 可以生成 Logo 或 Banner，并在页面展示生成结果。

---

### 18.7 资产库

- 完成 `/projects/[id]/assets`
- 展示资产网格
- 支持按类型筛选
- 支持下载
- 支持查看 prompt
- 支持喜欢 / 不喜欢

验收：

- 生成过的资产可以被持久化查看。

---

## 19. P1 功能

P0 完成后再做。

### 19.1 SVG Icon 生成

将 Icon Set 从图片升级为 SVG / React 组件。

输出：

```txt
components/icons/*.tsx
icons.json
```

---

### 19.2 Tailwind Token 导出

根据设计语言导出：

```txt
tailwind.config snippet
CSS variables
Design token JSON
```

---

### 19.3 用户反馈影响风格

用户对资产反馈后，可以更新设计偏好：

```txt
这个项目更喜欢低饱和色
这个项目不要人物插画
这个项目 Icon 要更极简
```

---

### 19.4 重新生成优化

用户可以基于某张资产继续修改：

```txt
颜色更亮一点
图标更简洁
Banner 右侧留更多空间
```

---

## 20. P2 功能

后续版本。

- Web UI Mockup 生成
- React + Tailwind 页面生成
- 本地 CLI
- Cursor / VS Code 插件
- MCP Server
- 团队协作
- 资产版本管理
- Figma 导出

---

## 21. Codex 开发执行建议

建议让 Codex 按阶段执行，不要一次生成整个项目。

### 阶段 1：初始化项目

给 Codex 的任务：

```txt
请基于 Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui 初始化项目结构。
实现首页、项目列表页、创建项目页、项目详情页的基础布局。
按照文档中的目录结构创建文件，不需要实现 AI 调用。
```

---

### 阶段 2：Supabase 数据层

给 Codex 的任务：

```txt
请根据项目文档创建 Supabase schema.sql，并实现 lib/supabase/client.ts、lib/supabase/server.ts，以及 lib/db 下的 projects、designSystems、assets、feedback 数据访问函数。
要求所有函数使用 TypeScript 类型，并处理错误。
```

---

### 阶段 3：设计语言生成

给 Codex 的任务：

```txt
请实现 lib/ai/generateDesignSystem.ts。
该函数接收项目信息，调用 AI 文本模型，返回严格 DesignSystem JSON。
同时实现 /api/projects 的 POST 逻辑：创建项目后自动生成并保存设计语言。
```

---

### 阶段 4：设计语言编辑页

给 Codex 的任务：

```txt
请实现 /projects/[id]/style 页面。
页面读取项目设计语言，使用表单展示所有字段，支持编辑、保存、重新生成，并显示 JSON 预览。
```

---

### 阶段 5：Prompt Compiler

给 Codex 的任务：

```txt
请实现 lib/ai/compileAssetPrompt.ts。
它接收 project、designSystem、assetType、userRequest、size、format，返回完整图片生成 prompt。
需要为 logo、app_icon、hero_banner、icon_set 四种类型追加不同生成规则。
```

---

### 阶段 6：图片生成和资产保存

给 Codex 的任务：

```txt
请实现 lib/ai/generateImage.ts 和 /api/projects/[id]/assets/generate。
接口需要读取 project 和 design_system，调用 compileAssetPrompt，生成图片，上传到 Supabase Storage，保存 assets 和 generation_logs 记录，并返回生成结果。
```

---

### 阶段 7：资产库页面

给 Codex 的任务：

```txt
请实现 /projects/[id]/assets 页面。
页面展示项目所有资产，支持按类型筛选、查看 prompt、下载图片、喜欢和不喜欢反馈。
```

---

## 22. 开发注意事项

### 22.1 不要让 Codex 一次性做太多

每次只让 Codex 做一个模块。

推荐顺序：

```txt
页面骨架 → 数据库 → 项目创建 → 设计语言 → Prompt Compiler → 图片生成 → 资产库
```

---

### 22.2 先跑通假数据

在接 AI API 前，可以先用 mock 数据生成设计语言。

mock 示例：

```ts
export const mockDesignSystem = {
  brand_keywords: ['年轻', '智能', '探索感', '轻松'],
  color_palette: {
    primary: '#4F8CFF',
    secondary: '#6EE7B7',
    accent: '#FFB86B',
    background: '#F8FAFC',
    text: '#1E293B',
  },
  typography: {
    style: '现代、圆润、易读',
    recommended_fonts: ['Inter', 'Nunito', 'PingFang SC'],
  },
  ui_style: '清爽科技感，大圆角卡片，浅色背景，柔和阴影',
  icon_style: '圆角线性图标，2px 描边，端点圆润',
  illustration_style: '扁平插画，年轻人物，低复杂度，轻科技感',
  layout_rules: ['大留白', '卡片式布局', '柔和阴影', '清晰层级'],
  component_rules: ['按钮使用大圆角', '卡片使用轻阴影', '输入框保持简洁'],
  negative_rules: ['不要写实摄影', '不要复杂 3D', '不要厚重商务风', '不要暗黑风'],
  prompt_template: '保持清爽、年轻、智能、探索感的视觉风格',
};
```

---

### 22.3 Prompt 先可见

MVP 中建议把 compiled prompt 展示给用户。

原因：

- 方便调试
- 用户可以理解系统如何继承项目风格
- 用户可以复制 prompt 到其他工具验证

---

### 22.4 图片生成失败要可恢复

需要处理：

- API 超时
- 额度不足
- 图片生成失败
- Storage 上传失败
- 数据库写入失败

页面上显示明确错误：

```txt
生成失败，请稍后重试。
```

---

### 22.5 资产命名规则

默认标题：

```txt
{assetTypeLabel} - {YYYY-MM-DD HH:mm}
```

示例：

```txt
Hero Banner - 2026-04-26 20:30
```

---

## 23. MVP 验收标准

MVP 完成后，应该可以完整演示以下流程：

### Demo 流程

1. 打开首页。
2. 点击创建项目。
3. 输入一个产品想法，例如 AI 旅行攻略 App。
4. 系统生成设计语言卡。
5. 用户修改主色或风格描述并保存。
6. 进入资产生成页。
7. 选择 Hero Banner。
8. 输入：给首页生成一张展示 AI 旅行路线规划能力的 Banner。
9. 系统生成完整 prompt。
10. 系统生成图片。
11. 图片保存到资产库。
12. 用户进入资产库查看、下载、反馈。
13. 再生成 Logo，结果仍然继承同一套项目风格。

验收重点：

- 同一项目下不同资产有统一风格。
- 用户能感受到系统理解产品上下文。
- 资产生成不是孤立的，而是项目级的。

---

## 24. 后续商业化方向

MVP 验证通过后，可以考虑：

```txt
Free：1 个项目，每月 20 次生成
Pro：无限项目，每月 500 次生成，支持高清导出
Team：团队协作、品牌资产库、权限管理
Developer：CLI、Cursor 插件、MCP Server
```

最有潜力的付费点：

- 更多项目
- 更多生成次数
- 高清图片
- SVG Icon 导出
- Tailwind Token 导出
- React 组件生成
- Cursor 插件
- 团队共享设计语言

---

## 25. 未来插件路线

Web MVP 成功后，下一步不是直接做复杂编辑器，而是：

```txt
Web 平台
  ↓
API
  ↓
CLI
  ↓
Cursor / VS Code 插件
  ↓
MCP Server
```

CLI 功能：

```bash
ui-agent init
ui-agent pull
ui-agent generate logo
ui-agent generate banner
ui-agent generate icons
ui-agent export tokens
```

Cursor 插件功能：

- 读取当前项目设计语言
- 生成并写入本地 assets
- 生成 React 图标组件
- 生成 Tailwind theme
- 从 Cursor 侧边栏访问项目资产库

---

## 26. 当前版本最终结论

第一版只做一个最小但完整的 Web 闭环：

```txt
项目 → 设计语言 → Prompt 编译 → 资产生成 → 资产库
```

不要追求功能多，而要把这个核心体验做清楚：

> 用户不是在生成一张图，而是在为一个软件项目维护一套长期一致的视觉语言。

