import { NextResponse } from "next/server";
import { compileAssetPrompt } from "@/lib/ai/compileAssetPrompt";
import { generateMockImage } from "@/lib/ai/generateImage";
import {
  createAsset,
  getDesignSystemByProjectId,
  getProjectById,
} from "@/lib/db/store";
import { titleForAssetType } from "@/lib/utils";
import type { AssetType } from "@/types/asset";

type GenerateAssetRequest = {
  asset_type: AssetType;
  user_request: string;
  size: string;
  format: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const project = getProjectById(id);
  const designSystem = getDesignSystemByProjectId(id);

  if (!project || !designSystem) {
    return NextResponse.json(
      { error: "项目或设计语言不存在。" },
      { status: 404 },
    );
  }

  const body = (await request.json()) as GenerateAssetRequest;
  const compiledPrompt = compileAssetPrompt({
    project,
    designSystem,
    assetType: body.asset_type,
    userRequest: body.user_request,
    size: body.size,
    format: body.format,
  });
  const image = generateMockImage({
    prompt: compiledPrompt,
    size: body.size,
    format: body.format,
  });
  const asset = createAsset({
    project_id: id,
    asset_type: body.asset_type,
    title: `${titleForAssetType(body.asset_type)} - ${new Date().toLocaleString("zh-CN")}`,
    user_request: body.user_request,
    compiled_prompt: compiledPrompt,
    file_url: image.fileUrl,
    storage_path: null,
    thumbnail_url: image.fileUrl,
    size: body.size,
    format: body.format,
    status: "generated",
  });

  return NextResponse.json({ asset, compiledPrompt });
}
