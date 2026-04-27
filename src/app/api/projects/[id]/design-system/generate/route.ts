import { NextResponse } from "next/server";
import { createMockDesignSystem } from "@/lib/ai/generateDesignSystem";
import { getProjectById, updateDesignSystem } from "@/lib/db/data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: "项目不存在。" }, { status: 404 });
  }

  const designSystem = await updateDesignSystem(id, createMockDesignSystem(project));
  return NextResponse.json({ designSystem });
}
