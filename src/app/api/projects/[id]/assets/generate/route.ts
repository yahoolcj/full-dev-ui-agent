import { NextResponse } from "next/server";
import { compileAssetPrompt } from "@/lib/ai/compileAssetPrompt";
import { generateMockImage } from "@/lib/ai/generateImage";
import {
  createAsset,
  createGenerationLog,
  getDesignSystemByProjectId,
  getProjectById,
  uploadAssetImage,
} from "@/lib/db/data";
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
  const [project, designSystem] = await Promise.all([
    getProjectById(id),
    getDesignSystemByProjectId(id),
  ]);

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
  const storedImage = await uploadAssetImage({
    projectId: id,
    assetType: body.asset_type,
    fileUrl: image.fileUrl,
    contentType: image.contentType,
    format: body.format,
  });
  const asset = await createAsset({
    project_id: id,
    asset_type: body.asset_type,
    title: `${titleForAssetType(body.asset_type)} - ${new Date().toLocaleString("zh-CN")}`,
    user_request: body.user_request,
    compiled_prompt: compiledPrompt,
    file_url: storedImage.fileUrl,
    storage_path: storedImage.storagePath,
    thumbnail_url: storedImage.thumbnailUrl,
    size: body.size,
    format: body.format,
    status: "generated",
  });

  await createGenerationLog({
    project_id: id,
    asset_id: asset.id,
    model: "mock-image-generator",
    input: body,
    output: {
      contentType: image.contentType,
      storagePath: storedImage.storagePath,
    },
  });

  return NextResponse.json({ asset, compiledPrompt });
}
