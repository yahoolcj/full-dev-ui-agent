import { describe, expect, it } from "vitest";
import { createMockDesignSystem } from "./generateDesignSystem";

describe("createMockDesignSystem", () => {
  it("根据项目输入生成完整可编辑的设计语言", () => {
    const designSystem = createMockDesignSystem({
      name: "CodeLedger",
      description: "面向独立开发者的财务仪表盘",
      product_type: "SaaS 工具",
      target_users: "独立开发者",
      style_preference: "冷静、精确、可信赖",
      reference_style: "Stripe",
    });

    expect(designSystem.brand_keywords).toContain("冷静");
    expect(designSystem.color_palette.primary).toMatch(/^#[0-9A-F]{6}$/i);
    expect(designSystem.typography.recommended_fonts.length).toBeGreaterThan(0);
    expect(designSystem.prompt_template).toContain("CodeLedger");
    expect(designSystem.negative_rules.length).toBeGreaterThan(2);
  });
});
