export type AssetType =
  | "logo_square"
  | "logo_square_wordmark"
  | "login_background"
  | "custom_image";

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
