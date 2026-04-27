import { NextResponse } from "next/server";
import { createMockDesignSystem } from "@/lib/ai/generateDesignSystem";
import {
  createDesignSystem,
  createProject,
  getProjects,
} from "@/lib/db/data";
import type { ProjectInput } from "@/types/project";

export async function GET() {
  return NextResponse.json({ projects: await getProjects() });
}

export async function POST(request: Request) {
  const input = (await request.json()) as ProjectInput;

  if (!input.name || !input.description) {
    return NextResponse.json(
      { error: "请填写项目名称和产品描述。" },
      { status: 400 },
    );
  }

  const project = await createProject(input);
  const designSystem = await createDesignSystem(
    project.id,
    createMockDesignSystem(project),
  );

  return NextResponse.json({ project, designSystem }, { status: 201 });
}
