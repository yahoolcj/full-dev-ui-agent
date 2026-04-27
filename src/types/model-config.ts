export type ModelRole =
  | "product_understander"
  | "design_system_generator"
  | "prompt_compiler"
  | "asset_prompt_optimizer"
  | "image_generator"
  | "style_critic"
  | "feedback_summarizer"
  | "svg_converter"
  | "ui_code_generator";

export type ModelProvider = {
  id: string;
  name: string;
  provider_key: string;
  base_url: string | null;
  api_key_env: string | null;
  encrypted_api_key?: string | null;
  api_key_last4: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type SafeModelProvider = Omit<ModelProvider, "encrypted_api_key"> & {
  has_stored_key: boolean;
};

export type ModelConfig = {
  id: string;
  role: ModelRole;
  provider_id: string | null;
  model_name: string;
  temperature: number;
  max_tokens: number | null;
  top_p: number | null;
  response_format: "text" | "json" | "image";
  is_enabled: boolean;
  is_default: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ModelConfigWithProvider = ModelConfig & {
  provider: SafeModelProvider | null;
};

export type ModelProviderInput = {
  name: string;
  provider_key: string;
  base_url?: string | null;
  api_key_env?: string | null;
  api_key?: string;
  is_enabled?: boolean;
};

export type ModelConfigInput = {
  role: ModelRole;
  provider_id?: string | null;
  model_name: string;
  temperature?: number;
  max_tokens?: number | null;
  top_p?: number | null;
  response_format?: "text" | "json" | "image";
  is_enabled?: boolean;
  is_default?: boolean;
  notes?: string | null;
};
