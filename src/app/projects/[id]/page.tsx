import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Boxes, Brush, Library } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectNav } from "@/components/layout/ProjectNav";
import {
  getAssetsByProjectId,
  getDesignSystemByProjectId,
  getProjectById,
} from "@/lib/db/store";
import { formatDateTime } from "@/lib/utils";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();
  const designSystem = getDesignSystemByProjectId(id);
  const assets = getAssetsByProjectId(id);

  return (
    <AppShell>
      <ProjectNav projectId={id} />
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">{project.product_type}</p>
        <h1 className="mt-1 text-3xl font-semibold">{project.name}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          {project.description}
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">设计语言摘要</h2>
          {designSystem ? (
            <div className="mt-5 grid gap-4">
              <div className="flex flex-wrap gap-2">
                {designSystem.brand_keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-md bg-muted px-2 py-1 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {designSystem.ui_style}
              </p>
              <div className="flex gap-2">
                {Object.values(designSystem.color_palette).map((color) => (
                  <span
                    key={color}
                    className="size-9 rounded-md border border-border"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              还没有生成设计语言。
            </p>
          )}
        </section>
        <aside className="grid gap-3">
          {[
            ["编辑设计语言", `/projects/${id}/style`, Brush],
            ["生成新资产", `/projects/${id}/generate`, Boxes],
            ["查看资产库", `/projects/${id}/assets`, Library],
          ].map(([label, href, Icon]) => (
            <Link
              key={label as string}
              href={href as string}
              className="inline-flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-sm font-medium hover:bg-muted"
            >
              <Icon size={18} />
              {label as string}
            </Link>
          ))}
        </aside>
      </div>
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-lg font-semibold">最近生成</h2>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有生成资产。</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            {assets.slice(0, 4).map((asset) => (
              <div key={asset.id}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-muted">
                  <Image
                    src={asset.file_url}
                    alt={asset.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="mt-2 text-sm font-medium">{asset.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(asset.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
