import { describe, expect, it } from "vitest";
import { compileAssetPrompt } from "./compileAssetPrompt";
import { createMockDesignSystem } from "./generateDesignSystem";

const project = {
  id: "project-1",
  name: "TripMind",
  description: "AI 旅行规划 App",
  product_type: "移动 App",
  target_users: "年轻自由行用户",
  style_preference: "清爽、智能、有探索感",
  reference_style: "Airbnb、Notion",
  created_at: "2026-04-26T00:00:00.000Z",
  updated_at: "2026-04-26T00:00:00.000Z",
};

describe("compileAssetPrompt", () => {
  it("包含项目上下文、设计语言、输出规格和首屏 Banner 规则", () => {
    const designSystem = createMockDesignSystem(project);

    const prompt = compileAssetPrompt({
      project,
      designSystem,
      assetType: "hero_banner",
      userRequest: "展示 AI 路线规划能力的官网首屏",
      size: "1440x600",
      format: "PNG",
    });

    expect(prompt).toContain("TripMind");
    expect(prompt).toContain("AI 旅行规划 App");
    expect(prompt).toContain(designSystem.color_palette.primary);
    expect(prompt).toContain("1440x600");
    expect(prompt).toContain("PNG");
    expect(prompt).toContain("预留干净空间");
  });
});
