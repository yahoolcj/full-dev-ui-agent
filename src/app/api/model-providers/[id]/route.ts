import { NextResponse } from "next/server";
import { updateModelProvider } from "@/lib/db/model-configs";
import type { ModelProviderInput } from "@/types/model-config";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const input = (await request.json()) as ModelProviderInput;

  if (!input.name || !input.provider_key) {
    return NextResponse.json(
      { error: "请填写供应商名称和 provider key。" },
      { status: 400 },
    );
  }

  try {
    const provider = await updateModelProvider(id, input);
    return NextResponse.json({ provider });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "供应商配置保存失败。" },
      { status: 400 },
    );
  }
}
