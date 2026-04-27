import { randomUUID } from "node:crypto";
import {
  defaultProviderSeeds,
  modelRoleDefinitions,
} from "@/lib/ai/modelRoles";
import { createAdminClient, hasSupabaseServerConfig } from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret } from "@/lib/security/secret-store";
import type {
  ModelConfig,
  ModelConfigInput,
  ModelConfigWithProvider,
  ModelProvider,
  ModelProviderInput,
  SafeModelProvider,
} from "@/types/model-config";

type ModelStore = {
  providers: ModelProvider[];
  configs: ModelConfig[];
};

const globalStore = globalThis as typeof globalThis & {
  __projectUiAgentModelStore?: ModelStore;
};

function supabaseOrNull() {
  return hasSupabaseServerConfig() ? createAdminClient() : null;
}

function now() {
  return new Date().toISOString();
}

function fail(operation: string, error: { message?: string }) {
  throw new Error(`${operation} failed: ${error.message ?? "Unknown Supabase error"}`);
}

function memoryStore() {
  if (!globalStore.__projectUiAgentModelStore) {
    const timestamp = now();
    const providers: ModelProvider[] = defaultProviderSeeds.map((seed) => ({
      id: randomUUID(),
      ...seed,
      encrypted_api_key: null,
      api_key_last4: null,
      is_enabled: true,
      created_at: timestamp,
      updated_at: timestamp,
    }));
    const openaiProvider = providers.find((item) => item.provider_key === "openai");
    const configs: ModelConfig[] = modelRoleDefinitions.map((definition) => ({
      id: randomUUID(),
      role: definition.role,
      provider_id:
        providers.find(
          (item) => item.provider_key === definition.defaultProviderKey,
        )?.id ?? openaiProvider?.id ?? null,
      model_name: definition.defaultModel,
      temperature: definition.temperature,
      max_tokens: null,
      top_p: null,
      response_format: definition.responseFormat,
      is_enabled: true,
      is_default: true,
      notes: definition.notes,
      created_at: timestamp,
      updated_at: timestamp,
    }));

    globalStore.__projectUiAgentModelStore = { providers, configs };
  }

  return globalStore.__projectUiAgentModelStore;
}

export function resetModelConfigStore() {
  globalStore.__projectUiAgentModelStore = undefined;
}

export function safeProvider(provider: ModelProvider): SafeModelProvider {
  const { encrypted_api_key: encryptedApiKey, ...safe } = provider;
  return {
    ...safe,
    has_stored_key: Boolean(encryptedApiKey),
  };
}

export async function getModelProviders() {
  const supabase = supabaseOrNull();
  if (!supabase) return memoryStore().providers.map(safeProvider);

  const { data, error } = await supabase
    .from("model_providers")
    .select("*")
    .order("provider_key", { ascending: true });

  if (error) fail("Load model providers", error);
  return ((data ?? []) as ModelProvider[]).map(safeProvider);
}

export async function createModelProvider(input: ModelProviderInput) {
  const payload = providerPayload(input, { includeEmptySecret: true });
  const supabase = supabaseOrNull();

  if (!supabase) {
    const provider: ModelProvider = {
      id: randomUUID(),
      name: input.name,
      provider_key: input.provider_key,
      base_url: input.base_url || null,
      api_key_env: input.api_key_env || null,
      encrypted_api_key: payload.encrypted_api_key ?? null,
      api_key_last4: payload.api_key_last4 ?? null,
      is_enabled: payload.is_enabled ?? true,
      created_at: now(),
      updated_at: now(),
    };
    memoryStore().providers.unshift(provider);
    return safeProvider(provider);
  }

  const { data, error } = await supabase
    .from("model_providers")
    .insert(payload)
    .select()
    .single();

  if (error) fail("Create model provider", error);
  return safeProvider(data as ModelProvider);
}

export async function updateModelProvider(
  providerId: string,
  input: ModelProviderInput,
) {
  const payload = providerPayload(input, { includeEmptySecret: false });
  const supabase = supabaseOrNull();

  if (!supabase) {
    const store = memoryStore();
    const existing = store.providers.find((item) => item.id === providerId);
    if (!existing) throw new Error("Model provider not found.");

    const updated: ModelProvider = {
      ...existing,
      ...payload,
      id: existing.id,
      created_at: existing.created_at,
      updated_at: now(),
    };
    store.providers = store.providers.map((item) =>
      item.id === providerId ? updated : item,
    );
    return safeProvider(updated);
  }

  const { data, error } = await supabase
    .from("model_providers")
    .update({ ...payload, updated_at: now() })
    .eq("id", providerId)
    .select()
    .single();

  if (error) fail("Update model provider", error);
  return safeProvider(data as ModelProvider);
}

export async function getModelConfigs() {
  const supabase = supabaseOrNull();
  if (!supabase) {
    const store = memoryStore();
    return store.configs.map((config) => withProvider(config, store.providers));
  }

  const { data, error } = await supabase
    .from("model_configs")
    .select(
      "*, provider:model_providers(id,name,provider_key,base_url,api_key_env,encrypted_api_key,api_key_last4,is_enabled,created_at,updated_at)",
    )
    .order("role", { ascending: true });

  if (error) fail("Load model configs", error);
  return ((data ?? []) as Array<ModelConfig & { provider: ModelProvider | null }>).map(
    ({ provider, ...config }) => ({
      ...(config as ModelConfig),
      provider: provider ? safeProvider(provider) : null,
    }),
  );
}

export async function updateModelConfig(configId: string, input: ModelConfigInput) {
  const payload = {
    role: input.role,
    provider_id: input.provider_id ?? null,
    model_name: input.model_name,
    temperature: input.temperature ?? 0.7,
    max_tokens: input.max_tokens ?? null,
    top_p: input.top_p ?? null,
    response_format: input.response_format ?? "text",
    is_enabled: input.is_enabled ?? true,
    is_default: input.is_default ?? false,
    notes: input.notes ?? null,
  };
  const supabase = supabaseOrNull();

  if (!supabase) {
    const store = memoryStore();
    const existing = store.configs.find((item) => item.id === configId);
    if (!existing) throw new Error("Model config not found.");

    const updated: ModelConfig = {
      ...existing,
      ...payload,
      id: existing.id,
      created_at: existing.created_at,
      updated_at: now(),
    };
    store.configs = store.configs.map((item) =>
      item.id === configId ? updated : item,
    );
    return withProvider(updated, store.providers);
  }

  const { data, error } = await supabase
    .from("model_configs")
    .update({ ...payload, updated_at: now() })
    .eq("id", configId)
    .select(
      "*, provider:model_providers(id,name,provider_key,base_url,api_key_env,encrypted_api_key,api_key_last4,is_enabled,created_at,updated_at)",
    )
    .single();

  if (error) fail("Update model config", error);
  const row = data as ModelConfig & { provider: ModelProvider | null };
  return {
    ...(row as ModelConfig),
    provider: row.provider ? safeProvider(row.provider) : null,
  };
}

export async function resolveModelProviderSecret(providerId: string) {
  const supabase = supabaseOrNull();
  const provider = supabase
    ? await loadProviderById(providerId)
    : memoryStore().providers.find((item) => item.id === providerId) ?? null;

  if (!provider) return null;
  if (provider.encrypted_api_key) return decryptSecret(provider.encrypted_api_key);
  if (provider.api_key_env) return process.env[provider.api_key_env] ?? null;
  return null;
}

function providerPayload(
  input: ModelProviderInput,
  options: { includeEmptySecret: boolean },
) {
  const payload: Partial<Omit<ModelProvider, "id" | "created_at" | "updated_at">> = {
    name: input.name,
    provider_key: input.provider_key,
    base_url: input.base_url || null,
    api_key_env: input.api_key_env || null,
    is_enabled: input.is_enabled ?? true,
  };

  if (input.api_key && input.api_key.trim()) {
    const apiKey = input.api_key.trim();
    payload.encrypted_api_key = encryptSecret(apiKey);
    payload.api_key_last4 = apiKey.slice(-4);
  } else if (options.includeEmptySecret) {
    payload.encrypted_api_key = null;
    payload.api_key_last4 = null;
  }

  return payload;
}

function withProvider(
  config: ModelConfig,
  providers: ModelProvider[],
): ModelConfigWithProvider {
  const provider = providers.find((item) => item.id === config.provider_id);
  return {
    ...config,
    provider: provider ? safeProvider(provider) : null,
  };
}

async function loadProviderById(providerId: string) {
  const supabase = supabaseOrNull();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("model_providers")
    .select("*")
    .eq("id", providerId)
    .maybeSingle();

  if (error) fail("Load model provider secret", error);
  return data as ModelProvider | null;
}
