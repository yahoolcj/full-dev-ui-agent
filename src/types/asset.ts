export type AssetType = "logo" | "app_icon" | "hero_banner" | "icon_set";

export type AssetInput = {
  project_id: string;
  asset_type: AssetType;
  title: string;
  user_request: string;
  compiled_prompt: string;
  file_url: string;
  storage_path?: string | null;
  thumbnail_url?: string | null;
  size: string;
  format: string;
  status?: "generated" | "failed";
  style_score?: number | null;
};

export type Asset = AssetInput & {
  id: string;
  created_at: string;
  status: "generated" | "failed";
};

export type AssetFeedback = {
  id: string;
  asset_id: string;
  project_id: string;
  feedback_type: "like" | "dislike";
  feedback_text?: string | null;
  created_at: string;
};
