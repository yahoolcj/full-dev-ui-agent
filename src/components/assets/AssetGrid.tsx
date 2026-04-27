"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Download, Eye, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Asset, AssetType } from "@/types/asset";
import { formatDateTime, titleForAssetType } from "@/lib/utils";

const filters: ("all" | AssetType)[] = [
  "all",
  "logo_square",
  "logo_square_wordmark",
  "login_background",
  "custom_image",
];

export function AssetGrid({
  projectId,
  assets,
}: {
  projectId: string;
  assets: Asset[];
}) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [openPrompt, setOpenPrompt] = useState<string | null>(null);
  const visibleAssets = useMemo(
    () =>
      filter === "all"
        ? assets
        : assets.filter((asset) => asset.asset_type === filter),
    [assets, filter],
  );

  async function feedback(assetId: string, feedbackType: "like" | "dislike") {
    await fetch(`/api/projects/${projectId}/assets/${assetId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback_type: feedbackType }),
    });
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-md border px-3 py-2 text-sm ${
              filter === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card"
            }`}
          >
            {item === "all" ? "全部" : titleForAssetType(item)}
          </button>
        ))}
      </div>
      {visibleAssets.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-lg border border-dashed border-border bg-card text-sm text-muted-foreground">
          暂无资产。
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleAssets.map((asset) => (
            <article
              key={asset.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
                <Image
                  src={asset.file_url}
                  alt={asset.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="mt-4 grid gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{asset.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {titleForAssetType(asset.asset_type)} ·{" "}
                      {formatDateTime(asset.created_at)}
                    </p>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {asset.user_request}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <a
                    href={asset.file_url}
                    download
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <Download size={15} />
                    下载
                  </a>
                  <button
                    onClick={() =>
                      setOpenPrompt(openPrompt === asset.id ? null : asset.id)
                    }
                    className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <Eye size={15} />
                    Prompt
                  </button>
                  <button
                    aria-label="喜欢"
                    onClick={() => feedback(asset.id, "like")}
                    className="rounded-md border border-border p-2"
                  >
                    <ThumbsUp size={15} />
                  </button>
                  <button
                    aria-label="不喜欢"
                    onClick={() => feedback(asset.id, "dislike")}
                    className="rounded-md border border-border p-2"
                  >
                    <ThumbsDown size={15} />
                  </button>
                </div>
                {openPrompt === asset.id ? (
                  <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                    {asset.compiled_prompt}
                  </pre>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
