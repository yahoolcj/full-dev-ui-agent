import type { AssetType } from "@/types/asset";
import type { DesignSystem } from "@/types/design-system";
import type { Project } from "@/types/project";

type CompileInput = {
  project: Project;
  designSystem: DesignSystem;
  assetType: AssetType;
  userRequest: string;
  size: string;
  format: string;
};

const assetRules: Record<AssetType, string> = {
  logo_square:
    "生成正方形品牌 LOGO。画面应以图形标识为主体，适合头像、应用入口、社交媒体和产品导航使用。避免小字、复杂背景和过多装饰。",
  logo_square_wordmark:
    "生成正方形构图的品牌 LOGO，并包含清晰品牌文字。图形标识与文字需要组合紧凑、可读、适合在产品首页或品牌卡片中使用。",
  login_background:
    "生成登录页背景图。画面需要有产品氛围和空间层次，但应预留足够干净区域承载登录表单，避免让文字、人物或高对比元素干扰表单可读性。",
  custom_image:
    "根据用户指定内容生成自定义图片。优先满足用户描述的画面主体、用途、构图和尺寸，同时继承项目设计语言和品牌风格。",
};

export function compileAssetPrompt({
  project,
  designSystem,
  assetType,
  userRequest,
  size,
  format,
}: CompileInput) {
  const palette = designSystem.color_palette;

  return [
    `项目名称：${project.name}`,
    `产品类型：${project.product_type}`,
    `产品描述：${project.description}`,
    `目标用户：${project.target_users}`,
    `用户需求：${userRequest}`,
    "",
    "需要继承的项目设计语言：",
    `品牌关键词：${designSystem.brand_keywords.join("、")}`,
    `UI 风格：${designSystem.ui_style}`,
    `色彩系统：主色 ${palette.primary}，辅助色 ${palette.secondary}，强调色 ${palette.accent}，背景色 ${palette.background}，文字色 ${palette.text}`,
    `字体方向：${designSystem.typography.style}；推荐字体 ${designSystem.typography.recommended_fonts.join("、")}`,
    `图标风格：${designSystem.icon_style}`,
    `插画风格：${designSystem.illustration_style}`,
    `布局规则：${designSystem.layout_rules.join("；")}`,
    `组件规则：${designSystem.component_rules.join("；")}`,
    `禁止风格：${designSystem.negative_rules.join("；")}`,
    "",
    `资产类型规则：${assetRules[assetType]}`,
    `输出规格：${size}，${format}`,
    "请生成一张可直接用于产品项目的高质量视觉资产，并确保它像同一套长期项目设计语言的一部分。",
  ].join("\n");
}
