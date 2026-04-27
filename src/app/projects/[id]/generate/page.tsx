import { notFound } from "next/navigation";
import { AssetGenerator } from "@/components/assets/AssetGenerator";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectNav } from "@/components/layout/ProjectNav";
import {
  getDesignSystemByProjectId,
  getProjectById,
} from "@/lib/db/data";

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, designSystem] = await Promise.all([
    getProjectById(id),
    getDesignSystemByProjectId(id),
  ]);
  if (!project || !designSystem) notFound();

  return (
    <AppShell>
      <ProjectNav projectId={id} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">生成资产</h1>
        <p className="mt-2 text-muted-foreground">
          根据当前设计语言编译完整图片 Prompt，并把生成结果保存到资产库。
        </p>
      </header>
      <AssetGenerator
        projectId={id}
        styleSummary={`${designSystem.brand_keywords.join("、")} · ${designSystem.ui_style}`}
      />
    </AppShell>
  );
}
