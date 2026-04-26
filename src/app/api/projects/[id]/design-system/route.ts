import { NextResponse } from "next/server";
import {
  getDesignSystemByProjectId,
  getProjectById,
  updateDesignSystem,
} from "@/lib/db/store";
import type { DesignSystemInput } from "@/types/design-system";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const designSystem = getDesignSystemByProjectId(id);

  if (!designSystem) {
    return NextResponse.json(
      { error: "设计语言不存在。" },
      { status: 404 },
    );
  }

  return NextResponse.json({ designSystem });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!getProjectById(id)) {
    return NextResponse.json({ error: "项目不存在。" }, { status: 404 });
  }

  const input = (await request.json()) as DesignSystemInput;
  const designSystem = updateDesignSystem(id, input);
  return NextResponse.json({ designSystem });
}
