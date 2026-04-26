import { notFound } from "next/navigation";
import { DesignSystemForm } from "@/components/design-system/DesignSystemForm";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectNav } from "@/components/layout/ProjectNav";
import {
  getDesignSystemByProjectId,
  getProjectById,
} from "@/lib/db/store";

export default async function StylePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);
  const designSystem = getDesignSystemByProjectId(id);
  if (!project || !designSystem) notFound();

  return (
    <AppShell>
      <ProjectNav projectId={id} />
      <header className="mb-6">
        <h1 className="text-3xl font-semibold">设计语言</h1>
        <p className="mt-2 text-muted-foreground">
          编辑 {project.name} 的项目级视觉记忆，后续所有资产都会继承这里的规则。
        </p>
      </header>
      <DesignSystemForm projectId={id} designSystem={designSystem} />
    </AppShell>
  );
}
