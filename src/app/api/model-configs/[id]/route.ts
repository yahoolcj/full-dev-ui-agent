import { NextResponse } from "next/server";
import { updateModelConfig } from "@/lib/db/model-configs";
import type { ModelConfigInput } from "@/types/model-config";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const input = (await request.json()) as ModelConfigInput;

  if (!input.role || !input.model_name) {
    return NextResponse.json(
      { error: "请填写模型角色和模型名称。" },
      { status: 400 },
    );
  }

  const config = await updateModelConfig(id, input);
  return NextResponse.json({ config });
}
