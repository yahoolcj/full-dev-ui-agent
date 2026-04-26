import { AppShell } from "@/components/layout/AppShell";
import { ProjectForm } from "@/components/project/ProjectForm";

export default function NewProjectPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">创建项目</h1>
          <p className="mt-2 text-muted-foreground">
            只需要描述一次产品，MVP 会立刻生成一套可编辑的项目设计语言。
          </p>
        </header>
        <section className="rounded-lg border border-border bg-card p-6">
          <ProjectForm />
        </section>
      </div>
    </AppShell>
  );
}
