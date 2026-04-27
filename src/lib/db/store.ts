import type { Asset, AssetFeedback, AssetInput } from "@/types/asset";
import type { DesignSystem, DesignSystemInput } from "@/types/design-system";
import type { Project, ProjectInput } from "@/types/project";
import { randomUUID } from "node:crypto";

type Store = {
  projects: Project[];
  designSystems: DesignSystem[];
  assets: Asset[];
  feedback: AssetFeedback[];
};

const globalStore = globalThis as typeof globalThis & {
  __projectUiAgentStore?: Store;
};

function store() {
  if (!globalStore.__projectUiAgentStore) {
    globalStore.__projectUiAgentStore = {
      projects: [],
      designSystems: [],
      assets: [],
      feedback: [],
    };
  }

  return globalStore.__projectUiAgentStore;
}

function now() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export function resetStore() {
  globalStore.__projectUiAgentStore = {
    projects: [],
    designSystems: [],
    assets: [],
    feedback: [],
  };
}

export function createProject(input: ProjectInput) {
  const timestamp = now();
  const project: Project = {
    id: id("project"),
    ...input,
    user_id: null,
    created_at: timestamp,
    updated_at: timestamp,
  };
  store().projects.unshift(project);
  return project;
}

export function getProjects() {
  return store().projects;
}

export function getProjectById(projectId: string) {
  return store().projects.find((project) => project.id === projectId) ?? null;
}

export function createDesignSystem(projectId: string, input: DesignSystemInput) {
  const timestamp = now();
  const designSystem: DesignSystem = {
    id: id("design"),
    project_id: projectId,
    ...input,
    created_at: timestamp,
    updated_at: timestamp,
  };
  store().designSystems = store().designSystems.filter(
    (item) => item.project_id !== projectId,
  );
  store().designSystems.unshift(designSystem);
  return designSystem;
}

export function getDesignSystemByProjectId(projectId: string) {
  return (
    store().designSystems.find((item) => item.project_id === projectId) ?? null
  );
}

export function updateDesignSystem(
  projectId: string,
  input: DesignSystemInput | DesignSystem,
) {
  const existing = getDesignSystemByProjectId(projectId);
  if (!existing) {
    return createDesignSystem(projectId, input);
  }

  const updated: DesignSystem = {
    ...existing,
    ...input,
    id: existing.id,
    project_id: projectId,
    created_at: existing.created_at,
    updated_at: now(),
  };
  store().designSystems = store().designSystems.map((item) =>
    item.project_id === projectId ? updated : item,
  );
  return updated;
}

export function createAsset(input: AssetInput) {
  const asset: Asset = {
    id: id("asset"),
    status: input.status ?? "generated",
    created_at: now(),
    ...input,
  };
  store().assets.unshift(asset);
  return asset;
}

export function getAssetsByProjectId(projectId: string) {
  return store().assets.filter((asset) => asset.project_id === projectId);
}

export function createFeedback(
  assetId: string,
  projectId: string,
  feedbackType: "like" | "dislike",
  feedbackText?: string,
) {
  const feedback: AssetFeedback = {
    id: id("feedback"),
    asset_id: assetId,
    project_id: projectId,
    feedback_type: feedbackType,
    feedback_text: feedbackText ?? null,
    created_at: now(),
  };
  store().feedback.unshift(feedback);
  return feedback;
}
