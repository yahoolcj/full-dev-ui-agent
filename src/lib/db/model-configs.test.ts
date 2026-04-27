import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { modelRoleDefinitions } from "@/lib/ai/modelRoles";
import {
  createModelProvider,
  getModelConfigs,
  getModelProviders,
  resetModelConfigStore,
  updateModelConfig,
} from "./model-configs";

const encryptionKey = Buffer.alloc(32, 9).toString("base64");

describe("model config store", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.MODEL_CONFIG_ENCRYPTION_KEY;
    resetModelConfigStore();
  });

  afterEach(() => {
    delete process.env.MODEL_CONFIG_ENCRYPTION_KEY;
  });

  it("exposes all default model roles", async () => {
    const configs = await getModelConfigs();

    expect(configs).toHaveLength(modelRoleDefinitions.length);
    expect(configs.map((config) => config.role).sort()).toEqual(
      modelRoleDefinitions.map((definition) => definition.role).sort(),
    );
  });

  it("stores provider keys encrypted and never returns ciphertext", async () => {
    process.env.MODEL_CONFIG_ENCRYPTION_KEY = encryptionKey;

    const provider = await createModelProvider({
      name: "Test Provider",
      provider_key: "test",
      base_url: "https://example.com/v1",
      api_key_env: "TEST_API_KEY",
      api_key: "sk-test-secret",
      is_enabled: true,
    });

    expect(provider.has_stored_key).toBe(true);
    expect(provider.api_key_last4).toBe("cret");
    expect(JSON.stringify(provider)).not.toContain("sk-test-secret");
    expect(JSON.stringify(provider)).not.toContain("encrypted_api_key");
  });

  it("rejects plaintext provider keys when encryption is not configured", async () => {
    await expect(
      createModelProvider({
        name: "Unsafe Provider",
        provider_key: "unsafe",
        api_key: "sk-test-secret",
      }),
    ).rejects.toThrow("MODEL_CONFIG_ENCRYPTION_KEY");
  });

  it("updates model binding details", async () => {
    const providers = await getModelProviders();
    const configs = await getModelConfigs();
    const imageConfig = configs.find((config) => config.role === "image_generator");
    const openai = providers.find((provider) => provider.provider_key === "openai");

    expect(imageConfig).toBeDefined();
    expect(openai).toBeDefined();

    const updated = await updateModelConfig(imageConfig!.id, {
      role: "image_generator",
      provider_id: openai!.id,
      model_name: "gpt-image-2",
      temperature: 0.5,
      response_format: "image",
      is_enabled: true,
      is_default: true,
      notes: "Updated in test",
    });

    expect(updated.model_name).toBe("gpt-image-2");
    expect(updated.temperature).toBe(0.5);
    expect(updated.provider?.provider_key).toBe("openai");
  });
});
