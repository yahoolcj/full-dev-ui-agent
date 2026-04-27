import { NextResponse } from "next/server";
import {
  createModelProvider,
  getModelProviders,
} from "@/lib/db/model-configs";
import type { ModelProviderInput } from "@/types/model-config";

export async function GET() {
  return NextResponse.json({ providers: await getModelProviders() });
}

export async function POST(request: Request) {
  const input = (await request.json()) as ModelProviderInput;

  if (!input.name || !input.provider_key) {
    return NextResponse.json(
      { error: "请填写供应商名称和 provider key。" },
      { status: 400 },
    );
  }

  try {
    const provider = await createModelProvider(input);
    return NextResponse.json({ provider }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "供应商配置保存失败。" },
      { status: 400 },
    );
  }
}
