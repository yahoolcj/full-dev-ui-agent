import { notFound } from "next/navigation";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectNav } from "@/components/layout/ProjectNav";
import { getAssetsByProjectId, getProjectById } from "@/lib/db/data";

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();
  const assets = await getAssetsByProjectId(id);

  return (
    <AppShell>
      <ProjectNav projectId={id} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">资产库</h1>
        <p className="mt-2 text-muted-foreground">
          查看 {project.name} 下生成过的视觉资产，支持下载、查看 Prompt 和记录反馈。
        </p>
      </header>
      <AssetGrid projectId={id} assets={assets} />
    </AppShell>
  );
}
