import type { Asset, AssetFeedback, AssetInput, AssetType } from "@/types/asset";
import type { DesignSystem, DesignSystemInput } from "@/types/design-system";
import type { Project, ProjectInput } from "@/types/project";
import { createAdminClient, hasSupabaseServerConfig } from "@/lib/supabase/admin";
import * as memoryStore from "./store";

const ASSETS_BUCKET = "assets";

function supabaseOrNull() {
  return hasSupabaseServerConfig() ? createAdminClient() : null;
}

function fail(operation: string, error: { message?: string }) {
  throw new Error(`${operation} failed: ${error.message ?? "Unknown Supabase error"}`);
}

export async function createProject(input: ProjectInput) {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore.createProject(input);

  const { data, error } = await supabase
    .from("projects")
    .insert(input)
    .select()
    .single();

  if (error) fail("Create project", error);
  return data as Project;
}

export async function getProjects() {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore.getProjects();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) fail("Load projects", error);
  return (data ?? []) as Project[];
}

export async function getProjectById(projectId: string) {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore.getProjectById(projectId);

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) fail("Load project", error);
  return data as Project | null;
}

export async function createDesignSystem(
  projectId: string,
  input: DesignSystemInput,
) {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore.createDesignSystem(projectId, input);

  const { data, error } = await supabase
    .from("design_systems")
    .upsert({ ...input, project_id: projectId }, { onConflict: "project_id" })
    .select()
    .single();

  if (error) fail("Create design system", error);
  return data as DesignSystem;
}

export async function getDesignSystemByProjectId(projectId: string) {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore.getDesignSystemByProjectId(projectId);

  const { data, error } = await supabase
    .from("design_systems")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) fail("Load design system", error);
  return data as DesignSystem | null;
}

export async function updateDesignSystem(
  projectId: string,
  input: DesignSystemInput | DesignSystem,
) {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore.updateDesignSystem(projectId, input);

  const payload = { ...(input as Partial<DesignSystem>) };
  delete payload.id;
  delete payload.created_at;
  const { data, error } = await supabase
    .from("design_systems")
    .upsert(
      {
        ...payload,
        project_id: projectId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" },
    )
    .select()
    .single();

  if (error) fail("Update design system", error);
  return data as DesignSystem;
}

export async function createAsset(input: AssetInput) {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore.createAsset(input);

  const { data, error } = await supabase.from("assets").insert(input).select().single();

  if (error) fail("Create asset", error);
  return data as Asset;
}

export async function getAssetsByProjectId(projectId: string) {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore.getAssetsByProjectId(projectId);

  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) fail("Load assets", error);
  return (data ?? []) as Asset[];
}

export async function createFeedback(
  assetId: string,
  projectId: string,
  feedbackType: "like" | "dislike",
  feedbackText?: string,
) {
  const supabase = supabaseOrNull();
  if (!supabase) {
    return memoryStore.createFeedback(assetId, projectId, feedbackType, feedbackText);
  }

  const { data, error } = await supabase
    .from("asset_feedback")
    .insert({
      asset_id: assetId,
      project_id: projectId,
      feedback_type: feedbackType,
      feedback_text: feedbackText ?? null,
    })
    .select()
    .single();

  if (error) fail("Create asset feedback", error);
  return data as AssetFeedback;
}

export async function createGenerationLog(input: {
  project_id: string;
  asset_id?: string | null;
  model: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}) {
  const supabase = supabaseOrNull();
  if (!supabase) return null;

  const { error } = await supabase.from("generation_logs").insert(input);
  if (error) fail("Create generation log", error);
  return true;
}

export async function uploadAssetImage(input: {
  projectId: string;
  assetType: AssetType;
  fileUrl: string;
  contentType: string;
  format: string;
}) {
  const supabase = supabaseOrNull();
  if (!supabase || !input.fileUrl.startsWith("data:")) {
    return {
      fileUrl: input.fileUrl,
      storagePath: null,
      thumbnailUrl: input.fileUrl,
    };
  }

  const base64 = input.fileUrl.split(",", 2)[1];
  if (!base64) {
    throw new Error("Generated image is not a valid data URL.");
  }

  const extension = extensionFor(input.contentType, input.format);
  const storagePath = `projects/${input.projectId}/${input.assetType}/${crypto.randomUUID()}.${extension}`;
  const bytes = Uint8Array.from(Buffer.from(base64, "base64"));
  const { error } = await supabase.storage
    .from(ASSETS_BUCKET)
    .upload(storagePath, bytes, {
      contentType: input.contentType,
      upsert: false,
    });

  if (error) fail("Upload asset image", error);

  const { data } = supabase.storage.from(ASSETS_BUCKET).getPublicUrl(storagePath);
  return {
    fileUrl: data.publicUrl,
    storagePath,
    thumbnailUrl: data.publicUrl,
  };
}

function extensionFor(contentType: string, format: string) {
  if (contentType === "image/svg+xml") return "svg";
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  return format.toLowerCase();
}
