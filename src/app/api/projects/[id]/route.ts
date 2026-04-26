import { NextResponse } from "next/server";
import {
  getAssetsByProjectId,
  getDesignSystemByProjectId,
  getProjectById,
} from "@/lib/db/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return NextResponse.json({ error: "项目不存在。" }, { status: 404 });
  }

  return NextResponse.json({
    project,
    designSystem: getDesignSystemByProjectId(id),
    assets: getAssetsByProjectId(id),
  });
}
