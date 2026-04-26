import type { DesignSystemInput } from "@/types/design-system";
import type { ProjectInput } from "@/types/project";

function splitKeywords(value: string) {
  return value
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function pickPalette(productType: string) {
  const lower = productType.toLowerCase();

  if (
    lower.includes("finance") ||
    lower.includes("saas") ||
    productType.includes("后台") ||
    productType.includes("工具")
  ) {
    return {
      primary: "#2563EB",
      secondary: "#14B8A6",
      accent: "#F59E0B",
      background: "#F8FAFC",
      text: "#172033",
    };
  }

  if (
    lower.includes("mobile") ||
    lower.includes("app") ||
    productType.includes("移动")
  ) {
    return {
      primary: "#4F46E5",
      secondary: "#06B6D4",
      accent: "#F97316",
      background: "#F7F8FB",
      text: "#1F2937",
    };
  }

  return {
    primary: "#2563EB",
    secondary: "#10B981",
    accent: "#F97316",
    background: "#F8FAFC",
    text: "#1E293B",
  };
}

export function createMockDesignSystem(project: ProjectInput): DesignSystemInput {
  const styleKeywords = splitKeywords(project.style_preference);
  const brandKeywords = [
    ...styleKeywords,
    project.product_type,
    project.target_users.split(/[,，、]/)[0]?.trim(),
  ].filter(Boolean);
  const palette = pickPalette(project.product_type);

  return {
    brand_keywords: Array.from(new Set(brandKeywords)),
    color_palette: palette,
    typography: {
      style: "现代、清晰、易读，适合开发者工具和产品后台界面",
      recommended_fonts: ["Geist", "Inter", "PingFang SC"],
    },
    ui_style: `${project.name} 应呈现清爽、可信赖的 SaaS 工具感：结构清晰、表单直接、预览区域稳定，色彩克制但有明确行动焦点。`,
    icon_style:
      "圆角线性图标，统一 2px 描边，隐喻简单，必要时用少量填充强调重点。",
    illustration_style:
      "扁平产品插画，轻微空间层次，使用抽象产品场景和留白，避免写实摄影感。",
    layout_rules: [
      "项目工作区使用左侧导航和主内容区结构",
      "表单和操作控件保持稳定对齐，便于快速扫描",
      "主色只用于关键行动、状态和生成结果强调",
      "卡片使用 8px 圆角，资产预览保持固定比例",
    ],
    component_rules: [
      "设计语言字段必须全部可编辑",
      "Prompt 预览需要易读、可复制",
      "资产卡片展示类型、需求、生成时间和反馈操作",
      "空状态要指向下一步可执行动作",
    ],
    negative_rules: [
      "避免通用库存图片质感",
      "避免复杂厚重的 3D 场景",
      "避免在生成图片里出现难读的小字",
      "避免偏离项目色彩系统",
    ],
    prompt_template: `${project.name} 的所有生成资产都必须继承项目定位、目标用户、色彩系统、UI 风格、图标风格和禁止风格。`,
  };
}
