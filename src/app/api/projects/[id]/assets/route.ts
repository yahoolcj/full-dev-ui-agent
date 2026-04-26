import { NextResponse } from "next/server";
import { getAssetsByProjectId } from "@/lib/db/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({ assets: getAssetsByProjectId(id) });
}
