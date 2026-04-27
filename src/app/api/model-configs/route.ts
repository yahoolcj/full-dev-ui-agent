import { NextResponse } from "next/server";
import { getModelConfigs } from "@/lib/db/model-configs";

export async function GET() {
  return NextResponse.json({ configs: await getModelConfigs() });
}
