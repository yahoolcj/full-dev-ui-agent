import { NextResponse } from "next/server";
import {
  getAssetsByProjectId,
  getDesignSystemByProjectId,
  getProjectById,
} from "@/lib/db/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: "项目不存在。" }, { status: 404 });
  }

  const [designSystem, assets] = await Promise.all([
    getDesignSystemByProjectId(id),
    getAssetsByProjectId(id),
  ]);

  return NextResponse.json({
    project,
    designSystem,
    assets,
  });
}
