import { describe, expect, it } from "vitest";
import { compileAssetPrompt } from "./compileAssetPrompt";
import { createMockDesignSystem } from "./generateDesignSystem";
import type { DesignSystem } from "@/types/design-system";
import type { Project } from "@/types/project";

const project: Project = {
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
  it("includes project context, design language, output size, and login background rules", () => {
    const designSystem: DesignSystem = {
      ...createMockDesignSystem(project),
      id: "design-1",
      project_id: project.id,
      created_at: "2026-04-26T00:00:00.000Z",
      updated_at: "2026-04-26T00:00:00.000Z",
    };

    const prompt = compileAssetPrompt({
      project,
      designSystem,
      assetType: "login_background",
      userRequest: "展示 AI 路线规划能力的登录页背景",
      size: "1440x900",
      format: "PNG",
    });

    expect(prompt).toContain("TripMind");
    expect(prompt).toContain("AI 旅行规划 App");
    expect(prompt).toContain(designSystem.color_palette.primary);
    expect(prompt).toContain("1440x900");
    expect(prompt).toContain("PNG");
    expect(prompt).toContain("登录表单");
  });
});
