import Link from "next/link";
import { ArrowRight, Boxes, Brush, Library, WandSparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function Home() {
  return (
    <AppShell>
      <section className="grid min-h-[calc(100vh-3rem)] content-center gap-10">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-medium text-primary">
            项目级 AI UI 视觉资产工作台
          </p>
          <h1 className="text-4xl font-semibold tracking-normal sm:text-6xl">
            Project UI Agent
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            输入产品想法，AI 自动生成项目设计语言。后续 Logo、App
            图标、首屏 Banner、图标集都会继承同一套视觉风格。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              创建第一个项目
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              查看项目
            </Link>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["设计语言记忆", Brush, "每个项目都有独立、可编辑的视觉语言。"],
            ["Prompt 编译器", WandSparkles, "把一句需求扩展成完整生成提示词。"],
            ["资产生成", Boxes, "支持 Logo、App 图标、Banner 和图标集。"],
            ["资产库", Library, "保存、下载、查看 Prompt，并记录反馈。"],
          ].map(([title, Icon, text]) => (
            <article
              key={title as string}
              className="rounded-lg border border-border bg-card p-5"
            >
              <Icon className="mb-4 text-primary" size={22} />
              <h2 className="font-semibold">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text as string}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
