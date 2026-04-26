import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="grid min-h-96 place-items-center text-center">
        <div>
          <h1 className="text-2xl font-semibold">页面不存在</h1>
          <p className="mt-2 text-muted-foreground">
            这个项目或页面不存在，可能已经被删除。
          </p>
          <Link
            href="/projects"
            className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            返回项目列表
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
