import Link from "next/link";
import { FolderKanban, Plus, Settings2, Sparkles } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card px-5 py-6 lg:block">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles size={18} />
          </span>
          Project UI Agent
        </Link>
        <nav className="mt-8 space-y-2 text-sm">
          <Link
            href="/projects"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <FolderKanban size={17} />
            项目列表
          </Link>
          <Link
            href="/projects/new"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Plus size={17} />
            创建项目
          </Link>
          <Link
            href="/settings/models"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Settings2 size={17} />
            模型配置
          </Link>
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto min-h-screen max-w-7xl px-5 py-6 sm:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
