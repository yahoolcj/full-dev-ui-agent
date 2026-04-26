"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, WandSparkles } from "lucide-react";
import type { Asset, AssetType } from "@/types/asset";

const assetTypes: { value: AssetType; label: string }[] = [
  { value: "logo", label: "Logo" },
  { value: "app_icon", label: "App 图标" },
  { value: "hero_banner", label: "首屏 Banner" },
  { value: "icon_set", label: "图标集" },
];

const sizes = ["1024x1024", "1440x600", "440x600"];

export function AssetGenerator({
  projectId,
  styleSummary,
}: {
  projectId: string;
  styleSummary: string;
}) {
  const router = useRouter();
  const [assetType, setAssetType] = useState<AssetType>("hero_banner");
  const [userRequest, setUserRequest] = useState(
    "为官网首页生成一张展示 AI 旅行路线规划能力的首屏 Banner。",
  );
  const [size, setSize] = useState("1440x600");
  const [format, setFormat] = useState("PNG");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [asset, setAsset] = useState<Asset | null>(null);

  async function generate() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/projects/${projectId}/assets/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        asset_type: assetType,
        user_request: userRequest,
        size,
        format,
      }),
    });
    const data = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(data.error ?? "生成失败。");
      return;
    }

    setPrompt(data.compiledPrompt);
    setAsset(data.asset);
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <section className="grid h-fit gap-5 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold">生成视觉资产</h2>
          <p className="mt-1 text-sm text-muted-foreground">{styleSummary}</p>
        </div>
        <label className="grid gap-2 text-sm font-medium">
          资产类型
          <select
            value={assetType}
            onChange={(event) => setAssetType(event.target.value as AssetType)}
            className="rounded-md border border-border bg-background px-3 py-2"
          >
            {assetTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          生成需求
          <textarea
            value={userRequest}
            onChange={(event) => setUserRequest(event.target.value)}
            className="min-h-32 rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-2 text-sm font-medium">
            尺寸
            <select
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              {sizes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            格式
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option>PNG</option>
            </select>
          </label>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button
          onClick={generate}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <WandSparkles size={16} />
          )}
          生成
        </button>
      </section>
      <section className="grid gap-5">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">编译后的 Prompt</h2>
            <button
              onClick={() => navigator.clipboard.writeText(prompt)}
              disabled={!prompt}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
            >
              <Copy size={16} />
              复制
            </button>
          </div>
          <pre className="min-h-56 whitespace-pre-wrap rounded-md bg-muted p-4 text-xs leading-5 text-foreground">
            {prompt || "生成后会在这里显示完整 Prompt。"}
          </pre>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-lg font-semibold">生成结果预览</h2>
          {asset ? (
            <div className="grid gap-3">
              <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
                <Image
                  src={asset.file_url}
                  alt={asset.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="text-sm font-medium">{asset.title}</p>
              <a href={asset.file_url} download className="text-sm text-primary">
                下载资产
              </a>
            </div>
          ) : (
            <div className="grid aspect-video place-items-center rounded-md border border-dashed border-border bg-muted text-sm text-muted-foreground">
              还没有生成资产。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
