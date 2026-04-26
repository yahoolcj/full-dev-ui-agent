import Link from "next/link";
import { Boxes, Brush, Grid2X2, LayoutDashboard } from "lucide-react";

const items = [
  { label: "概览", suffix: "", icon: LayoutDashboard },
  { label: "设计语言", suffix: "/style", icon: Brush },
  { label: "生成资产", suffix: "/generate", icon: Boxes },
  { label: "资产库", suffix: "/assets", icon: Grid2X2 },
];

export function ProjectNav({ projectId }: { projectId: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={`/projects/${projectId}${item.suffix}`}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
