import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getAssetsByProjectId, getProjects } from "@/lib/db/data";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">项目列表</h1>
          <p className="mt-2 text-muted-foreground">
            管理项目级设计语言，以及围绕同一风格生成的 UI 视觉资产。
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus size={16} />
          新建项目
        </Link>
      </header>
      {projects.length === 0 ? (
        <div className="grid min-h-96 place-items-center rounded-lg border border-dashed border-border bg-card text-center">
          <div>
            <h2 className="text-xl font-semibold">你还没有项目</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              创建一个项目，让 AI 为它生成统一的设计语言。
            </p>
            <Link
              href="/projects/new"
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            >
              创建项目
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {await Promise.all(
            projects.map(async (project) => {
              const assets = await getAssetsByProjectId(project.id);
              return (
                <article
                  key={project.id}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <h2 className="text-lg font-semibold">{project.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {project.description}
                  </p>
                  <dl className="mt-5 grid gap-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">类型</dt>
                      <dd>{project.product_type}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">资产数量</dt>
                      <dd>{assets.length}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">最近更新</dt>
                      <dd>{formatDateTime(project.updated_at)}</dd>
                    </div>
                  </dl>
                  <Link
                    href={`/projects/${project.id}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary"
                  >
                    进入项目
                    <ArrowRight size={16} />
                  </Link>
                </article>
              );
            }),
          )}
        </div>
      )}
    </AppShell>
  );
}
