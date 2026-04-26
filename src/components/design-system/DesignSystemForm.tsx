"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw, Save } from "lucide-react";
import type { DesignSystem } from "@/types/design-system";

const colorLabels: Record<string, string> = {
  primary: "主色",
  secondary: "辅助色",
  accent: "强调色",
  background: "背景色",
  text: "文字色",
};

export function DesignSystemForm({
  projectId,
  designSystem,
}: {
  projectId: string;
  designSystem: DesignSystem;
}) {
  const router = useRouter();
  const [state, setState] = useState(designSystem);
  const [status, setStatus] = useState("");
  const json = useMemo(() => JSON.stringify(state, null, 2), [state]);

  async function save() {
    setStatus("正在保存...");
    const response = await fetch(`/api/projects/${projectId}/design-system`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    setStatus(response.ok ? "已保存。" : "保存失败。");
    router.refresh();
  }

  async function regenerate() {
    setStatus("正在重新生成...");
    const response = await fetch(
      `/api/projects/${projectId}/design-system/generate`,
      { method: "POST" },
    );
    const data = await response.json();
    if (response.ok) {
      setState(data.designSystem);
      setStatus("已重新生成。");
      router.refresh();
    } else {
      setStatus(data.error ?? "重新生成失败。");
    }
  }

  function update<K extends keyof DesignSystem>(key: K, value: DesignSystem[K]) {
    setState((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="grid gap-5 rounded-lg border border-border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">可编辑设计语言</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={regenerate}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
            >
              <RefreshCcw size={16} />
              重新生成
            </button>
            <button
              onClick={save}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
            >
              <Save size={16} />
              保存
            </button>
          </div>
        </div>
        <InputList
          label="品牌关键词"
          value={state.brand_keywords}
          onChange={(value) => update("brand_keywords", value)}
        />
        <div className="grid gap-4 md:grid-cols-5">
          {Object.entries(state.color_palette).map(([key, value]) => (
            <label key={key} className="grid gap-2 text-sm font-medium">
              {colorLabels[key] ?? key}
              <input
                type="color"
                value={value}
                onChange={(event) =>
                  update("color_palette", {
                    ...state.color_palette,
                    [key]: event.target.value,
                  })
                }
                className="h-10 w-full rounded-md border border-border"
              />
            </label>
          ))}
        </div>
        <Textarea
          label="UI 风格"
          value={state.ui_style}
          onChange={(value) => update("ui_style", value)}
        />
        <Textarea
          label="图标风格"
          value={state.icon_style}
          onChange={(value) => update("icon_style", value)}
        />
        <Textarea
          label="插画风格"
          value={state.illustration_style}
          onChange={(value) => update("illustration_style", value)}
        />
        <InputList
          label="布局规则"
          value={state.layout_rules}
          onChange={(value) => update("layout_rules", value)}
        />
        <InputList
          label="组件规则"
          value={state.component_rules}
          onChange={(value) => update("component_rules", value)}
        />
        <InputList
          label="禁止风格"
          value={state.negative_rules}
          onChange={(value) => update("negative_rules", value)}
        />
        <Textarea
          label="Prompt 模板"
          value={state.prompt_template}
          onChange={(value) => update("prompt_template", value)}
        />
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </section>
      <aside className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-3 text-lg font-semibold">JSON 预览</h2>
        <pre className="max-h-[760px] overflow-auto rounded-md bg-muted p-4 text-xs leading-5">
          {json}
        </pre>
      </aside>
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 rounded-md border border-border bg-background px-3 py-2"
      />
    </label>
  );
}

function InputList({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <textarea
        value={value.join("\n")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
        className="min-h-24 rounded-md border border-border bg-background px-3 py-2"
      />
    </label>
  );
}
