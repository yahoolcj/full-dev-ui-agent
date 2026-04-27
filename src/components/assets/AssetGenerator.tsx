"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, WandSparkles } from "lucide-react";
import type { Asset, AssetType } from "@/types/asset";

const assetTypes: {
  value: AssetType;
  label: string;
  defaultSize: [number, number];
  defaultRequest: string;
}[] = [
  {
    value: "logo_square",
    label: "LOGO 正方",
    defaultSize: [1024, 1024],
    defaultRequest: "生成一个正方形品牌 LOGO，突出产品核心隐喻，图形简洁、可识别。",
  },
  {
    value: "logo_square_wordmark",
    label: "LOGO 正方带文字",
    defaultSize: [1024, 1024],
    defaultRequest:
      "生成一个正方形品牌 LOGO，包含图形标识和清晰品牌文字，适合品牌展示。",
  },
  {
    value: "login_background",
    label: "登录页背景",
    defaultSize: [1440, 900],
    defaultRequest:
      "生成一张登录页背景图，保留右侧或中央干净区域用于放置登录表单。",
  },
  {
    value: "custom_image",
    label: "其他图",
    defaultSize: [1024, 768],
    defaultRequest: "生成一张用于当前产品的自定义视觉图，请按这里填写具体内容。",
  },
];

const initialAssetType = assetTypes[0];

export function AssetGenerator({
  projectId,
  styleSummary,
}: {
  projectId: string;
  styleSummary: string;
}) {
  const router = useRouter();
  const [assetType, setAssetType] = useState<AssetType>(initialAssetType.value);
  const [userRequest, setUserRequest] = useState(initialAssetType.defaultRequest);
  const [width, setWidth] = useState(initialAssetType.defaultSize[0]);
  const [height, setHeight] = useState(initialAssetType.defaultSize[1]);
  const [format, setFormat] = useState("PNG");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [asset, setAsset] = useState<Asset | null>(null);

  function changeAssetType(value: AssetType) {
    const next = assetTypes.find((item) => item.value === value) ?? initialAssetType;
    setAssetType(next.value);
    setUserRequest(next.defaultRequest);
    setWidth(next.defaultSize[0]);
    setHeight(next.defaultSize[1]);
  }

  async function generate() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/projects/${projectId}/assets/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        asset_type: assetType,
        user_request: userRequest,
        size: `${width}x${height}`,
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
            onChange={(event) => changeAssetType(event.target.value as AssetType)}
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
          生成内容
          <textarea
            value={userRequest}
            onChange={(event) => setUserRequest(event.target.value)}
            className="min-h-32 rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-3 gap-4">
          <label className="grid gap-2 text-sm font-medium">
            宽度
            <input
              type="number"
              min={256}
              max={4096}
              step={64}
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            高度
            <input
              type="number"
              min={256}
              max={4096}
              step={64}
              value={height}
              onChange={(event) => setHeight(Number(event.target.value))}
              className="rounded-md border border-border bg-background px-3 py-2"
            />
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
