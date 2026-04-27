import { AppShell } from "@/components/layout/AppShell";
import { ModelSettingsClient } from "@/components/settings/ModelSettingsClient";
import { getModelConfigs, getModelProviders } from "@/lib/db/model-configs";

export const dynamic = "force-dynamic";

export default async function ModelSettingsPage() {
  const [providers, configs] = await Promise.all([
    getModelProviders(),
    getModelConfigs(),
  ]);

  return (
    <AppShell>
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">Settings</p>
        <h1 className="mt-1 text-3xl font-semibold">模型配置</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          配置 Project UI Agent 内部各 AI 节点使用的模型供应商、模型名、Base URL 和 Key。
        </p>
      </header>
      <ModelSettingsClient
        initialProviders={providers}
        initialConfigs={configs}
      />
    </AppShell>
  );
}
