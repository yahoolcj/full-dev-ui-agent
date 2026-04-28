import { NextResponse } from "next/server";
import { compileAssetPrompt } from "@/lib/ai/compileAssetPrompt";
import {
  ImageGenerationError,
  generateImage,
} from "@/lib/ai/generateImage";
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
      { error: "Project or design system not found." },
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

  try {
    const image = await generateImage({
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
      model: image.model,
      input: body,
      output: {
        contentType: image.contentType,
        providerKey: image.providerKey,
        revisedPrompt: image.revisedPrompt,
        storagePath: storedImage.storagePath,
      },
    });

    return NextResponse.json({ asset, compiledPrompt });
  } catch (error) {
    const debug =
      error instanceof ImageGenerationError
        ? error.debug
        : {
            message: error instanceof Error ? error.message : String(error),
          };
    console.error("[asset-generate] image generation failed", debug);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Image generation failed. Check model config.",
        debug,
      },
      { status: 502 },
    );
  }
}
