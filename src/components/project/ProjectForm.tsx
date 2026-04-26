"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, WandSparkles } from "lucide-react";

const example = {
  name: "TripMind",
  description:
    "一个 AI 旅行攻略 App，可以根据预算、天数和兴趣生成旅行路线。",
  product_type: "移动 App",
  target_users: "20-35 岁年轻自由行用户、情侣、城市周末游用户",
  style_preference: "清爽、智能、年轻、有探索感",
  reference_style: "Airbnb、Notion、Duolingo 的轻松感",
};

export function ProjectForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(example);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "创建项目失败。");
      setPending(false);
      return;
    }

    router.push(`/projects/${data.project.id}/style`);
    router.refresh();
  }

  function update(name: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <Field label="项目名称">
        <input
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          className="w-full rounded-md border border-border bg-card px-3 py-2"
          required
        />
      </Field>
      <Field label="产品描述">
        <textarea
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          className="min-h-28 w-full rounded-md border border-border bg-card px-3 py-2"
          required
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="产品类型">
          <input
            value={form.product_type}
            onChange={(event) => update("product_type", event.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2"
          />
        </Field>
        <Field label="目标用户">
          <input
            value={form.target_users}
            onChange={(event) => update("target_users", event.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2"
          />
        </Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="希望风格">
          <input
            value={form.style_preference}
            onChange={(event) => update("style_preference", event.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2"
          />
        </Field>
        <Field label="参考产品或关键词">
          <input
            value={form.reference_style}
            onChange={(event) => update("reference_style", event.target.value)}
            className="w-full rounded-md border border-border bg-card px-3 py-2"
          />
        </Field>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <button
        disabled={pending}
        className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <WandSparkles size={16} />
        )}
        创建并生成设计语言
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
