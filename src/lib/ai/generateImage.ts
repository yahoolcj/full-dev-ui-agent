import {
  getModelConfigs,
  resolveModelProviderSecret,
} from "@/lib/db/model-configs";

type GenerateImageInput = {
  prompt: string;
  size: string;
  format: string;
};

type GeneratedImage = {
  fileUrl: string;
  contentType: string;
  model: string;
  providerKey: string;
  revisedPrompt?: string;
};

type OpenAIImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
    revised_prompt?: string;
  }>;
  error?: {
    message?: string;
    code?: string;
    param?: string;
    type?: string;
  };
};

type ImageRequestBody = {
  model: string;
  prompt: string;
  size: "1024x1024" | "1536x1024" | "1024x1536";
  quality: "low" | "medium" | "high" | "auto";
  output_format: "png" | "jpeg" | "webp";
};

export type ImageGenerationDebug = {
  providerKey?: string;
  model?: string;
  baseUrl?: string;
  endpoint?: string;
  triedEndpoints?: string[];
  requestBody?: Omit<ImageRequestBody, "prompt"> & {
    promptLength: number;
    promptPreview: string;
    requestedSize: string;
  };
  upstreamStatus?: number;
  upstreamStatusText?: string;
  upstreamError?: OpenAIImageResponse["error"] | null;
  upstreamBodyPreview?: string;
  responseKeys?: string[];
};

export class ImageGenerationError extends Error {
  debug: ImageGenerationDebug;

  constructor(message: string, debug: ImageGenerationDebug = {}) {
    super(message);
    this.name = "ImageGenerationError";
    this.debug = debug;
  }
}

const DEFAULT_IMAGE_BASE_URL = "https://api.openai.com/v1";

export async function generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
  const config = await resolveImageGeneratorConfig();
  console.log("[image-generator] resolved config", {
    providerKey: config.providerKey,
    model: config.model,
    baseUrl: config.baseUrl,
    hasApiKey: Boolean(config.apiKey),
  });

  const result = await requestImageGeneration(config, input);

  const payload = parseOpenAIImageResponse(result.responseText);

  if (!result.response.ok) {
    throw new ImageGenerationError(
      payload.error?.message ??
        `Image generation failed with status ${result.response.status}.`,
      {
        ...result.debug,
        upstreamStatus: result.response.status,
        upstreamStatusText: result.response.statusText,
        upstreamError: payload.error ?? null,
        upstreamBodyPreview: result.responseText.slice(0, 2000),
      },
    );
  }

  const image = payload.data?.[0];
  if (!image?.b64_json && !image?.url) {
    throw new ImageGenerationError(
      "Image generation response did not include image data.",
      {
        ...result.debug,
        upstreamStatus: result.response.status,
        upstreamStatusText: result.response.statusText,
        upstreamBodyPreview: result.responseText.slice(0, 2000),
        responseKeys: Object.keys(image ?? payload),
      },
    );
  }

  const contentType = contentTypeForFormat(input.format);
  const fileUrl = image.b64_json
    ? `data:${contentType};base64,${image.b64_json}`
    : image.url;

  if (!fileUrl) {
    throw new ImageGenerationError("Image generation response had no usable image.");
  }

  console.log("[image-generator] generated image result", {
    contentType,
    providerKey: config.providerKey,
    model: config.model,
    source: image.b64_json ? "b64_json" : "url",
    b64Length: image.b64_json?.length ?? null,
    url: image.url ?? null,
    revisedPrompt: image.revised_prompt,
  });

  return {
    fileUrl,
    contentType,
    model: config.model,
    providerKey: config.providerKey,
    revisedPrompt: image.revised_prompt,
  };
}

async function requestImageGeneration(
  config: Awaited<ReturnType<typeof resolveImageGeneratorConfig>>,
  input: GenerateImageInput,
) {
  const body = {
    model: config.model,
    prompt: input.prompt,
    size: normalizeOpenAIImageSize(input.size),
    quality: "auto",
    output_format: outputFormatFor(input.format),
  } satisfies ImageRequestBody;
  const request = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  };

  const endpoints = imageGenerationEndpoints(config.baseUrl);
  const debug: ImageGenerationDebug = {
    providerKey: config.providerKey,
    model: config.model,
    baseUrl: config.baseUrl,
    triedEndpoints: endpoints,
    requestBody: {
      model: body.model,
      size: body.size,
      quality: body.quality,
      output_format: body.output_format,
      promptLength: body.prompt.length,
      promptPreview: body.prompt.slice(0, 500),
      requestedSize: input.size,
    },
  };
  logOpenAIImageRequest(endpoints[0], body, input.size);
  const firstResponse = await fetch(endpoints[0], request);
  const firstResponseText = await firstResponse.text();
  logOpenAIImageResponse(endpoints[0], firstResponse, firstResponseText);
  if (firstResponse.status !== 404 || endpoints.length === 1) {
    return {
      response: firstResponse,
      responseText: firstResponseText,
      debug: { ...debug, endpoint: endpoints[0] },
    };
  }

  console.log("[image-generator] first endpoint returned 404, retrying fallback", {
    firstEndpoint: endpoints[0],
    fallbackEndpoint: endpoints[1],
  });
  logOpenAIImageRequest(endpoints[1], body, input.size);
  const secondResponse = await fetch(endpoints[1], request);
  const secondResponseText = await secondResponse.text();
  logOpenAIImageResponse(endpoints[1], secondResponse, secondResponseText);
  return {
    response: secondResponse,
    responseText: secondResponseText,
    debug: { ...debug, endpoint: endpoints[1] },
  };
}

export function generateMockImage({ prompt, size }: GenerateImageInput) {
  const [width = "1024", height = "1024"] = size.split("x");
  const summary = prompt.split("\n").slice(0, 4).join(" ").slice(0, 160);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  <rect x="6%" y="8%" width="88%" height="84%" rx="32" fill="#ffffff" stroke="#d9dde5"/>
  <circle cx="24%" cy="34%" r="12%" fill="#2563eb" opacity="0.92"/>
  <rect x="42%" y="25%" width="36%" height="8%" rx="12" fill="#172033"/>
  <rect x="42%" y="39%" width="29%" height="5%" rx="10" fill="#10b981"/>
  <rect x="16%" y="62%" width="68%" height="4%" rx="8" fill="#cbd5e1"/>
  <rect x="16%" y="72%" width="48%" height="4%" rx="8" fill="#e2e8f0"/>
  <text x="16%" y="87%" fill="#475569" font-family="Arial, sans-serif" font-size="22">${escapeXml(summary)}</text>
</svg>`;

  return {
    fileUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    contentType: "image/svg+xml",
  };
}

async function resolveImageGeneratorConfig() {
  const configs = await getModelConfigs();
  const config = configs.find(
    (item) => item.role === "image_generator" && item.is_enabled,
  );

  if (!config) {
    throw new Error("Image generator model config is not enabled.");
  }

  if (!config.provider_id || !config.provider || !config.provider.is_enabled) {
    throw new Error("Image generator provider is not configured or enabled.");
  }

  const apiKey = await resolveModelProviderSecret(config.provider_id);
  if (!apiKey) {
    throw new Error(
      "Image generator provider key is missing. Configure a stored key or api_key_env.",
    );
  }

  return {
    apiKey,
    baseUrl: config.provider.base_url ?? DEFAULT_IMAGE_BASE_URL,
    model: config.model_name,
    providerKey: config.provider.provider_key,
  };
}

function imageGenerationEndpoints(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/images/generations")) return [normalized];
  if (normalized.endsWith("/v1")) return [`${normalized}/images/generations`];
  return [`${normalized}/v1/images/generations`, `${normalized}/images/generations`];
}

function contentTypeForFormat(format: string) {
  const normalized = format.toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "image/jpeg";
  if (normalized === "webp") return "image/webp";
  return "image/png";
}

function normalizeOpenAIImageSize(size: string): ImageRequestBody["size"] {
  const match = size.match(/^(\d+)x(\d+)$/i);
  if (!match) return "1024x1024";

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "1024x1024";
  }

  const ratio = width / height;
  if (ratio >= 1.25) return "1536x1024";
  if (ratio <= 0.8) return "1024x1536";
  return "1024x1024";
}

function outputFormatFor(format: string): ImageRequestBody["output_format"] {
  const normalized = format.toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "jpeg";
  if (normalized === "webp") return "webp";
  return "png";
}

function parseOpenAIImageResponse(responseText: string): OpenAIImageResponse {
  try {
    return JSON.parse(responseText) as OpenAIImageResponse;
  } catch {
    return {};
  }
}

function logOpenAIImageRequest(
  endpoint: string,
  body: ImageRequestBody,
  requestedSize: string,
) {
  console.log("[image-generator] request", {
    endpoint,
    method: "POST",
    headers: {
      Authorization: "Bearer [redacted]",
      "Content-Type": "application/json",
    },
    body: {
      ...body,
      requestedSize,
      promptLength: body.prompt.length,
    },
  });
}

function logOpenAIImageResponse(
  endpoint: string,
  response: Response,
  responseText: string,
) {
  console.log("[image-generator] response", {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: summarizeOpenAIImageResponse(responseText),
  });
}

function summarizeOpenAIImageResponse(responseText: string) {
  const payload = parseOpenAIImageResponse(responseText);
  if (!payload.data) return responseText;

  return {
    ...payload,
    data: payload.data.map((item) => ({
      ...item,
      b64_json: item.b64_json
        ? {
            length: item.b64_json.length,
            prefix: item.b64_json.slice(0, 80),
          }
        : undefined,
    })),
  };
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
