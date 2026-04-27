import { beforeEach, describe, expect, it } from "vitest";
import {
  createAsset,
  createDesignSystem,
  createFeedback,
  createProject,
  getAssetsByProjectId,
  getDesignSystemByProjectId,
  getProjects,
  resetStore,
  updateDesignSystem,
} from "./store";
import { createMockDesignSystem } from "../ai/generateDesignSystem";

describe("mock store", () => {
  beforeEach(() => resetStore());

  it("creates a project, stores its design system, updates it, and persists assets with feedback", () => {
    const project = createProject({
      name: "TripMind",
      description: "AI travel itinerary app",
      product_type: "Mobile App",
      target_users: "Young travelers",
      style_preference: "Fresh, exploratory",
      reference_style: "Airbnb",
    });
    const designSystem = createDesignSystem(
      project.id,
      createMockDesignSystem(project),
    );

    const updated = updateDesignSystem(project.id, {
      ...designSystem,
      ui_style: "清爽产品界面，使用明亮地图强调色",
    });

    const asset = createAsset({
      project_id: project.id,
      asset_type: "logo_square",
      title: "LOGO 正方 - test",
      user_request: "生成一个简洁 Logo",
      compiled_prompt: "提示词",
      file_url: "data:image/svg+xml;base64,abc",
      size: "1024x1024",
      format: "PNG",
    });
    const feedback = createFeedback(asset.id, project.id, "like");

    expect(getProjects()).toHaveLength(1);
    expect(getDesignSystemByProjectId(project.id)?.ui_style).toBe(updated.ui_style);
    expect(getAssetsByProjectId(project.id)).toEqual([asset]);
    expect(feedback.feedback_type).toBe("like");
  });
});
