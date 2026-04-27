import type { ModelRole } from "@/types/model-config";

export type ModelRoleDefinition = {
  role: ModelRole;
  label: string;
  description: string;
  defaultProviderKey: string;
  defaultModel: string;
  responseFormat: "text" | "json" | "image";
  temperature: number;
  notes: string;
};

export const modelRoleDefinitions: ModelRoleDefinition[] = [
  {
    role: "product_understander",
    label: "产品理解",
    description: "从用户产品描述中提取定位、目标用户、关键词和约束。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-5.4-mini",
    responseFormat: "json",
    temperature: 0.4,
    notes: "低成本结构化理解节点。",
  },
  {
    role: "design_system_generator",
    label: "设计语言生成",
    description: "生成项目级设计语言 JSON，需要产品理解、审美和结构化输出。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-5.4",
    responseFormat: "json",
    temperature: 0.8,
    notes: "核心质量节点，优先使用强文本模型。",
  },
  {
    role: "prompt_compiler",
    label: "Prompt 编译",
    description: "把项目上下文、设计语言和用户需求编译成完整图片 Prompt。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-5.4-mini",
    responseFormat: "text",
    temperature: 0.4,
    notes: "稳定、低成本、可控输出。",
  },
  {
    role: "asset_prompt_optimizer",
    label: "图片 Prompt 优化",
    description: "针对 LOGO、登录页背景、自定义图等资产类型优化生成提示词。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-5.4-mini",
    responseFormat: "text",
    temperature: 0.6,
    notes: "可按成本切换到更强模型。",
  },
  {
    role: "image_generator",
    label: "真实图片生成",
    description: "生成实际图片资产，并保存到 Supabase Storage。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-image-2",
    responseFormat: "image",
    temperature: 0.7,
    notes: "用于 LOGO、登录页背景和自定义图片。",
  },
  {
    role: "style_critic",
    label: "风格一致性检查",
    description: "基于图像输入检查生成结果是否符合项目设计语言。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-5.4",
    responseFormat: "json",
    temperature: 0.2,
    notes: "需要视觉理解能力。",
  },
  {
    role: "feedback_summarizer",
    label: "反馈总结",
    description: "汇总用户喜欢/不喜欢反馈，形成后续生成偏好。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-5.4-mini",
    responseFormat: "json",
    temperature: 0.3,
    notes: "低成本文本总结节点。",
  },
  {
    role: "svg_converter",
    label: "图片/图标转 SVG",
    description: "把 LOGO 或图标资产转换为可编辑 SVG 代码。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-5.4",
    responseFormat: "text",
    temperature: 0.2,
    notes: "需要代码和视觉理解能力。",
  },
  {
    role: "ui_code_generator",
    label: "UI 转代码",
    description: "把设计语言或视觉稿转换为 React/Tailwind 页面代码。",
    defaultProviderKey: "openai",
    defaultModel: "gpt-5.4",
    responseFormat: "text",
    temperature: 0.3,
    notes: "代码生成节点。",
  },
];

export const defaultProviderSeeds = [
  {
    name: "OpenAI",
    provider_key: "openai",
    base_url: "https://api.openai.com/v1",
    api_key_env: "OPENAI_API_KEY",
  },
  {
    name: "Anthropic",
    provider_key: "anthropic",
    base_url: "https://api.anthropic.com",
    api_key_env: "ANTHROPIC_API_KEY",
  },
  {
    name: "Google Gemini",
    provider_key: "google",
    base_url: "https://generativelanguage.googleapis.com/v1beta",
    api_key_env: "GOOGLE_GENERATIVE_AI_API_KEY",
  },
  {
    name: "Vercel AI Gateway",
    provider_key: "vercel_ai_gateway",
    base_url: "https://ai-gateway.vercel.sh/v1",
    api_key_env: "AI_GATEWAY_API_KEY",
  },
  {
    name: "fal",
    provider_key: "fal",
    base_url: "https://fal.run",
    api_key_env: "FAL_KEY",
  },
  {
    name: "Replicate",
    provider_key: "replicate",
    base_url: "https://api.replicate.com/v1",
    api_key_env: "REPLICATE_API_TOKEN",
  },
  {
    name: "Custom",
    provider_key: "custom",
    base_url: null,
    api_key_env: null,
  },
] as const;

export function modelRoleLabel(role: ModelRole) {
  return modelRoleDefinitions.find((item) => item.role === role)?.label ?? role;
}
