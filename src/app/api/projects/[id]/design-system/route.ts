import { NextResponse } from "next/server";
import {
  getDesignSystemByProjectId,
  getProjectById,
  updateDesignSystem,
} from "@/lib/db/data";
import type { DesignSystemInput } from "@/types/design-system";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const designSystem = await getDesignSystemByProjectId(id);

  if (!designSystem) {
    return NextResponse.json({ error: "设计语言不存在。" }, { status: 404 });
  }

  return NextResponse.json({ designSystem });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!(await getProjectById(id))) {
    return NextResponse.json({ error: "项目不存在。" }, { status: 404 });
  }

  const input = (await request.json()) as DesignSystemInput;
  const designSystem = await updateDesignSystem(id, input);
  return NextResponse.json({ designSystem });
}
