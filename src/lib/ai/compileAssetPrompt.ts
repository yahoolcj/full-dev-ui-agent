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
  logo:
    "生成简洁、可识别的品牌标识，适合 Web 和 App 品牌使用。避免复杂细节和大段文字，可以使用抽象符号、产品隐喻和品牌主色。",
  app_icon:
    "生成适合移动 App 的圆角方形图标，中心图形清晰，小尺寸仍可识别，避免复杂背景和细小文字。",
  hero_banner:
    "生成适合官网首页首屏的横向 Banner，体现产品核心价值和使用场景，并为标题文案和主要 CTA 预留干净空间。",
  icon_set:
    "生成 6 到 8 个统一风格的 UI 图标预览图，保持一致的描边粗细、圆角、透视关系和视觉复杂度，背景保持干净。",
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
