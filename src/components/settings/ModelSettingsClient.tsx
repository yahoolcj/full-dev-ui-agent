"use client";

import { useState } from "react";
import { KeyRound, Save, Server, SlidersHorizontal } from "lucide-react";
import { modelRoleDefinitions } from "@/lib/ai/modelRoles";
import type {
  ModelConfigWithProvider,
  SafeModelProvider,
} from "@/types/model-config";

type ProviderDraft = SafeModelProvider & { api_key?: string };

export function ModelSettingsClient({
  initialProviders,
  initialConfigs,
}: {
  initialProviders: SafeModelProvider[];
  initialConfigs: ModelConfigWithProvider[];
}) {
  const [providers, setProviders] = useState<ProviderDraft[]>(initialProviders);
  const [configs, setConfigs] = useState(initialConfigs);
  const [status, setStatus] = useState("");

  function updateProvider(
    providerId: string,
    patch: Partial<ProviderDraft>,
  ) {
    setProviders((current) =>
      current.map((provider) =>
        provider.id === providerId ? { ...provider, ...patch } : provider,
      ),
    );
  }

  function updateConfig(
    configId: string,
    patch: Partial<ModelConfigWithProvider>,
  ) {
    setConfigs((current) =>
      current.map((config) =>
        config.id === configId ? { ...config, ...patch } : config,
      ),
    );
  }

  async function saveProvider(provider: ProviderDraft) {
    setStatus("正在保存供应商配置...");
    const response = await fetch(`/api/model-providers/${provider.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: provider.name,
        provider_key: provider.provider_key,
        base_url: provider.base_url,
        api_key_env: provider.api_key_env,
        api_key: provider.api_key,
        is_enabled: provider.is_enabled,
      }),
    });
    const data = (await response.json().catch(() => ({
      error: "供应商配置保存失败。",
    }))) as { error?: string; provider?: SafeModelProvider };

    if (!response.ok || !data.provider) {
      setStatus(data.error ?? "供应商配置保存失败。");
      return;
    }

    setProviders((current) =>
      current.map((item) =>
        item.id === provider.id ? { ...data.provider!, api_key: "" } : item,
      ),
    );
    setStatus("供应商配置已保存。");
  }

  async function saveConfig(config: ModelConfigWithProvider) {
    setStatus("正在保存模型绑定...");
    const response = await fetch(`/api/model-configs/${config.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: config.role,
        provider_id: config.provider_id,
        model_name: config.model_name,
        temperature: Number(config.temperature),
        max_tokens: config.max_tokens,
        top_p: config.top_p,
        response_format: config.response_format,
        is_enabled: config.is_enabled,
        is_default: config.is_default,
        notes: config.notes,
      }),
    });
    const data = (await response.json().catch(() => ({
      error: "模型绑定保存失败。",
    }))) as { error?: string; config?: ModelConfigWithProvider };

    if (!response.ok || !data.config) {
      setStatus(data.error ?? "模型绑定保存失败。");
      return;
    }

    setConfigs((current) =>
      current.map((item) => (item.id === config.id ? data.config! : item)),
    );
    setStatus("模型绑定已保存。");
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <SlidersHorizontal className="text-primary" size={20} />
          <div>
            <h2 className="text-lg font-semibold">AI 能力节点</h2>
            <p className="text-sm text-muted-foreground">
              每个节点都通过 modelRole 读取配置，后续生成链路不直接写死模型名。
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modelRoleDefinitions.map((definition) => {
            const config = configs.find((item) => item.role === definition.role);
            return (
              <article
                key={definition.role}
                className="rounded-md border border-border bg-background p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{definition.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {definition.role}
                    </p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs">
                    {config?.provider?.provider_key ?? definition.defaultProviderKey}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {definition.description}
                </p>
                <p className="mt-3 text-sm">
                  当前模型：{config?.model_name ?? definition.defaultModel}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <Server className="text-primary" size={20} />
          <div>
            <h2 className="text-lg font-semibold">模型供应商</h2>
            <p className="text-sm text-muted-foreground">
              API Key 可使用环境变量引用；手动填写的 key 只会发送到服务端加密保存。
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {providers.map((provider) => (
            <article
              key={provider.id}
              className="grid gap-4 rounded-md border border-border bg-background p-4"
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="供应商名称">
                  <input
                    value={provider.name}
                    onChange={(event) =>
                      updateProvider(provider.id, { name: event.target.value })
                    }
                    className="w-full rounded-md border border-border bg-card px-3 py-2"
                  />
                </Field>
                <Field label="Provider Key">
                  <input
                    value={provider.provider_key}
                    onChange={(event) =>
                      updateProvider(provider.id, {
                        provider_key: event.target.value,
                      })
                    }
                    className="w-full rounded-md border border-border bg-card px-3 py-2"
                  />
                </Field>
                <Field label="Base URL">
                  <input
                    value={provider.base_url ?? ""}
                    onChange={(event) =>
                      updateProvider(provider.id, {
                        base_url: event.target.value,
                      })
                    }
                    placeholder="https://api.example.com/v1"
                    className="w-full rounded-md border border-border bg-card px-3 py-2"
                  />
                </Field>
                <Field label="环境变量 Key">
                  <input
                    value={provider.api_key_env ?? ""}
                    onChange={(event) =>
                      updateProvider(provider.id, {
                        api_key_env: event.target.value,
                      })
                    }
                    placeholder="OPENAI_API_KEY"
                    className="w-full rounded-md border border-border bg-card px-3 py-2"
                  />
                </Field>
              </div>
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_160px_120px]">
                <Field label="覆盖 API Key">
                  <input
                    type="password"
                    value={provider.api_key ?? ""}
                    onChange={(event) =>
                      updateProvider(provider.id, { api_key: event.target.value })
                    }
                    placeholder={
                      provider.has_stored_key
                        ? `已保存，尾号 ${provider.api_key_last4 ?? "****"}`
                        : "留空则使用环境变量"
                    }
                    className="w-full rounded-md border border-border bg-card px-3 py-2"
                  />
                </Field>
                <label className="flex items-end gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={provider.is_enabled}
                    onChange={(event) =>
                      updateProvider(provider.id, {
                        is_enabled: event.target.checked,
                      })
                    }
                  />
                  启用
                </label>
                <button
                  onClick={() => saveProvider(provider)}
                  className="inline-flex items-center justify-center gap-2 self-end rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                >
                  <Save size={15} />
                  保存
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <KeyRound className="text-primary" size={20} />
          <div>
            <h2 className="text-lg font-semibold">模型绑定</h2>
            <p className="text-sm text-muted-foreground">
              为每个 AI 节点选择供应商、模型名和输出格式。
            </p>
          </div>
        </div>
        <div className="grid gap-4">
          {configs.map((config) => {
            const definition = modelRoleDefinitions.find(
              (item) => item.role === config.role,
            );
            return (
              <article
                key={config.id}
                className="grid gap-4 rounded-md border border-border bg-background p-4"
              >
                <div>
                  <h3 className="font-medium">
                    {definition?.label ?? config.role}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {definition?.description}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <Field label="供应商">
                    <select
                      value={config.provider_id ?? ""}
                      onChange={(event) =>
                        updateConfig(config.id, {
                          provider_id: event.target.value || null,
                        })
                      }
                      className="w-full rounded-md border border-border bg-card px-3 py-2"
                    >
                      <option value="">未绑定</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="模型名">
                    <input
                      value={config.model_name}
                      onChange={(event) =>
                        updateConfig(config.id, {
                          model_name: event.target.value,
                        })
                      }
                      className="w-full rounded-md border border-border bg-card px-3 py-2"
                    />
                  </Field>
                  <Field label="Temperature">
                    <input
                      type="number"
                      min={0}
                      max={2}
                      step={0.1}
                      value={config.temperature}
                      onChange={(event) =>
                        updateConfig(config.id, {
                          temperature: Number(event.target.value),
                        })
                      }
                      className="w-full rounded-md border border-border bg-card px-3 py-2"
                    />
                  </Field>
                  <Field label="Max Tokens">
                    <input
                      type="number"
                      min={0}
                      value={config.max_tokens ?? ""}
                      onChange={(event) =>
                        updateConfig(config.id, {
                          max_tokens: event.target.value
                            ? Number(event.target.value)
                            : null,
                        })
                      }
                      className="w-full rounded-md border border-border bg-card px-3 py-2"
                    />
                  </Field>
                  <Field label="输出格式">
                    <select
                      value={config.response_format}
                      onChange={(event) =>
                        updateConfig(config.id, {
                          response_format: event.target.value as
                            | "text"
                            | "json"
                            | "image",
                        })
                      }
                      className="w-full rounded-md border border-border bg-card px-3 py-2"
                    >
                      <option value="text">text</option>
                      <option value="json">json</option>
                      <option value="image">image</option>
                    </select>
                  </Field>
                </div>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_120px_120px]">
                  <Field label="备注">
                    <input
                      value={config.notes ?? ""}
                      onChange={(event) =>
                        updateConfig(config.id, { notes: event.target.value })
                      }
                      className="w-full rounded-md border border-border bg-card px-3 py-2"
                    />
                  </Field>
                  <label className="flex items-end gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={config.is_enabled}
                      onChange={(event) =>
                        updateConfig(config.id, {
                          is_enabled: event.target.checked,
                        })
                      }
                    />
                    启用
                  </label>
                  <button
                    onClick={() => saveConfig(config)}
                    className="inline-flex items-center justify-center gap-2 self-end rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
                  >
                    <Save size={15} />
                    保存
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
      {status ? (
        <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {status}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
