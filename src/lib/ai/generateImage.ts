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

type OpenAIImageRequestBody = {
  model: string;
  prompt: string;
  size: "1024x1024" | "1536x1024" | "1024x1536";
  quality: "low" | "medium" | "high" | "auto";
  output_format: "png" | "jpeg" | "webp";
};

type GptsapiImageRequestBody = {
  prompt: string;
  aspect_ratio: string;
  output_format: "png" | "jpeg" | "webp";
};

type GptsapiImageResponse = {
  data?: {
    id?: string;
    model?: string;
    outputs?: unknown[];
    urls?: { get?: string };
    status?: string;
  };
  message?: string;
  code?: number;
  urls?: { get?: string };
  outputs?: unknown[];
  status?: string;
  error?: unknown;
};

export type ImageGenerationDebug = {
  providerKey?: string;
  model?: string;
  baseUrl?: string;
  endpoint?: string;
  triedEndpoints?: string[];
  requestBody?: Record<string, unknown>;
  upstreamStatus?: number;
  upstreamStatusText?: string;
  upstreamError?: unknown;
  upstreamBodyPreview?: string;
  responseKeys?: string[];
  predictionId?: string;
  predictionStatus?: string;
  resultUrl?: string;
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
const GPTSAPI_POLL_ATTEMPTS = 30;
const GPTSAPI_POLL_INTERVAL_MS = 2000;

export async function generateImage(input: GenerateImageInput): Promise<GeneratedImage> {
  const config = await resolveImageGeneratorConfig();
  console.log("[image-generator] resolved config", {
    providerKey: config.providerKey,
    model: config.model,
    baseUrl: config.baseUrl,
    hasApiKey: Boolean(config.apiKey),
  });

  if (isGptsapiConfig(config.baseUrl)) {
    return generateGptsapiImage(config, input);
  }

  return generateOpenAIImage(config, input);
}

async function generateGptsapiImage(
  config: Awaited<ReturnType<typeof resolveImageGeneratorConfig>>,
  input: GenerateImageInput,
): Promise<GeneratedImage> {
  const contentType = contentTypeForFormat(input.format);
  const body = {
    prompt: input.prompt,
    aspect_ratio: aspectRatioForSize(input.size),
    output_format: outputFormatFor(input.format),
  } satisfies GptsapiImageRequestBody;
  const endpoint = gptsapiTextToImageEndpoint(config.baseUrl, config.model);
  const debug: ImageGenerationDebug = {
    providerKey: config.providerKey,
    model: config.model,
    baseUrl: config.baseUrl,
    endpoint,
    requestBody: {
      ...body,
      requestedSize: input.size,
      promptLength: input.prompt.length,
    },
  };

  logImageRequest("gptsapi create", endpoint, body);
  const createResponse = await fetch(endpoint, {
    method: "POST",
    headers: imageRequestHeaders(config.apiKey),
    body: JSON.stringify(body),
  });
  const createResponseText = await createResponse.text();
  logImageResponse("gptsapi create", endpoint, createResponse, createResponseText);

  const createPayload = parseJson<GptsapiImageResponse>(createResponseText);
  if (!createResponse.ok || (createPayload.code && createPayload.code !== 200)) {
    throw new ImageGenerationError(
      createPayload.message ??
        `gptsapi image creation failed with status ${createResponse.status}.`,
      {
        ...debug,
        upstreamStatus: createResponse.status,
        upstreamStatusText: createResponse.statusText,
        upstreamError: createPayload.error ?? createPayload.message,
        upstreamBodyPreview: createResponseText.slice(0, 4000),
      },
    );
  }

  const directImage = findImageOutput(createPayload);
  if (directImage) {
    return finalizeGeneratedImage(directImage, contentType, config, "gptsapi direct");
  }

  const resultUrl = createPayload.data?.urls?.get ?? createPayload.urls?.get;
  if (!resultUrl) {
    throw new ImageGenerationError("gptsapi response did not include result URL.", {
      ...debug,
      upstreamStatus: createResponse.status,
      upstreamStatusText: createResponse.statusText,
      upstreamBodyPreview: createResponseText.slice(0, 4000),
      predictionId: createPayload.data?.id,
      predictionStatus: createPayload.data?.status ?? createPayload.status,
    });
  }

  const finalImage = await pollGptsapiResult(resultUrl, config.apiKey, {
    ...debug,
    predictionId: createPayload.data?.id,
    predictionStatus: createPayload.data?.status ?? createPayload.status,
    resultUrl,
  });

  return finalizeGeneratedImage(finalImage, contentType, config, "gptsapi result");
}

async function pollGptsapiResult(
  resultUrl: string,
  apiKey: string,
  debug: ImageGenerationDebug,
) {
  for (let attempt = 1; attempt <= GPTSAPI_POLL_ATTEMPTS; attempt++) {
    console.log("[image-generator] gptsapi poll request", {
      attempt,
      endpoint: resultUrl,
      method: "GET",
      headers: { Authorization: "Bearer [redacted]" },
    });
    const response = await fetch(resultUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const responseText = await response.text();
    logImageResponse(`gptsapi poll ${attempt}`, resultUrl, response, responseText);

    const payload = parseJson<GptsapiImageResponse>(responseText);
    if (!response.ok || (payload.code && payload.code !== 200)) {
      throw new ImageGenerationError(
        payload.message ?? `gptsapi result polling failed with status ${response.status}.`,
        {
          ...debug,
          upstreamStatus: response.status,
          upstreamStatusText: response.statusText,
          upstreamError: payload.error ?? payload.message,
          upstreamBodyPreview: responseText.slice(0, 4000),
          predictionStatus: payload.data?.status ?? payload.status,
        },
      );
    }

    const image = findImageOutput(payload);
    if (image) return image;

    const status = payload.data?.status ?? payload.status;
    if (status && ["failed", "failure", "error", "canceled", "cancelled"].includes(status)) {
      throw new ImageGenerationError(`gptsapi prediction finished with status ${status}.`, {
        ...debug,
        upstreamStatus: response.status,
        upstreamStatusText: response.statusText,
        upstreamBodyPreview: responseText.slice(0, 4000),
        predictionStatus: status,
      });
    }

    await delay(GPTSAPI_POLL_INTERVAL_MS);
  }

  throw new ImageGenerationError("gptsapi image generation timed out.", debug);
}

async function generateOpenAIImage(
  config: Awaited<ReturnType<typeof resolveImageGeneratorConfig>>,
  input: GenerateImageInput,
): Promise<GeneratedImage> {
  const result = await requestOpenAIImageGeneration(config, input);
  const payload = parseJson<OpenAIImageResponse>(result.responseText);

  if (!result.response.ok) {
    throw new ImageGenerationError(
      payload.error?.message ??
        `Image generation failed with status ${result.response.status}.`,
      {
        ...result.debug,
        upstreamStatus: result.response.status,
        upstreamStatusText: result.response.statusText,
        upstreamError: payload.error ?? null,
        upstreamBodyPreview: result.responseText.slice(0, 4000),
      },
    );
  }

  const image = payload.data?.[0];
  if (!image?.b64_json && !image?.url) {
    throw new ImageGenerationError("Image generation response did not include image data.", {
      ...result.debug,
      upstreamStatus: result.response.status,
      upstreamStatusText: result.response.statusText,
      upstreamBodyPreview: result.responseText.slice(0, 4000),
      responseKeys: Object.keys(image ?? payload),
    });
  }

  const contentType = contentTypeForFormat(input.format);
  const fileUrl = image.b64_json
    ? `data:${contentType};base64,${image.b64_json}`
    : image.url;

  if (!fileUrl) {
    throw new ImageGenerationError("Image generation response had no usable image.");
  }

  return finalizeGeneratedImage(fileUrl, contentType, config, "openai");
}

async function requestOpenAIImageGeneration(
  config: Awaited<ReturnType<typeof resolveImageGeneratorConfig>>,
  input: GenerateImageInput,
) {
  const body = {
    model: config.model,
    prompt: input.prompt,
    size: normalizeOpenAIImageSize(input.size),
    quality: "auto",
    output_format: outputFormatFor(input.format),
  } satisfies OpenAIImageRequestBody;
  const request = {
    method: "POST",
    headers: imageRequestHeaders(config.apiKey),
    body: JSON.stringify(body),
  };

  const endpoints = openAIImageGenerationEndpoints(config.baseUrl);
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
  logImageRequest("openai", endpoints[0], body);
  const firstResponse = await fetch(endpoints[0], request);
  const firstResponseText = await firstResponse.text();
  logImageResponse("openai", endpoints[0], firstResponse, firstResponseText);
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
  logImageRequest("openai fallback", endpoints[1], body);
  const secondResponse = await fetch(endpoints[1], request);
  const secondResponseText = await secondResponse.text();
  logImageResponse("openai fallback", endpoints[1], secondResponse, secondResponseText);
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

function isGptsapiConfig(baseUrl: string) {
  return baseUrl.includes("api.gptsapi.net");
}

function gptsapiTextToImageEndpoint(baseUrl: string, model: string) {
  return `${baseUrl.replace(/\/+$/, "")}/api/v3/openai/${encodeURIComponent(
    model,
  )}/text-to-image`;
}

function openAIImageGenerationEndpoints(baseUrl: string) {
  const normalized = baseUrl.replace(/\/+$/, "");
  if (normalized.endsWith("/images/generations")) return [normalized];
  if (normalized.endsWith("/v1")) return [`${normalized}/images/generations`];
  return [`${normalized}/v1/images/generations`, `${normalized}/images/generations`];
}

function imageRequestHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

function contentTypeForFormat(format: string) {
  const normalized = format.toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "image/jpeg";
  if (normalized === "webp") return "image/webp";
  return "image/png";
}

function normalizeOpenAIImageSize(size: string): OpenAIImageRequestBody["size"] {
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

function aspectRatioForSize(size: string) {
  const match = size.match(/^(\d+)x(\d+)$/i);
  if (!match) return "1:1";

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return "1:1";
  }

  const gcd = greatestCommonDivisor(width, height);
  return `${Math.round(width / gcd)}:${Math.round(height / gcd)}`;
}

function outputFormatFor(format: string): GptsapiImageRequestBody["output_format"] {
  const normalized = format.toLowerCase();
  if (normalized === "jpg" || normalized === "jpeg") return "jpeg";
  if (normalized === "webp") return "webp";
  return "png";
}

async function finalizeGeneratedImage(
  source: string,
  contentType: string,
  config: Awaited<ReturnType<typeof resolveImageGeneratorConfig>>,
  sourceType: string,
): Promise<GeneratedImage> {
  const fileUrl = source.startsWith("http")
    ? (await fetchRemoteImageAsDataUrl(source, contentType)) ?? source
    : source;

  console.log("[image-generator] generated image result", {
    contentType,
    providerKey: config.providerKey,
    model: config.model,
    source: sourceType,
    dataUrl: fileUrl.startsWith("data:") ? summarizeDataUrl(fileUrl) : null,
    url: source.startsWith("data:") ? null : source,
    uploadedViaDataUrl: fileUrl.startsWith("data:"),
  });

  return {
    fileUrl,
    contentType,
    model: config.model,
    providerKey: config.providerKey,
  };
}

function findImageOutput(payload: unknown): string | null {
  if (typeof payload === "string") {
    if (payload.startsWith("data:image/")) return payload;
    if (/^https?:\/\//.test(payload)) return payload;
    return null;
  }

  if (!payload || typeof payload !== "object") return null;

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = findImageOutput(item);
      if (found) return found;
    }
    return null;
  }

  const record = payload as Record<string, unknown>;
  for (const key of [
    "url",
    "image",
    "image_url",
    "file_url",
    "output",
    "result",
  ]) {
    const found = findImageOutput(record[key]);
    if (found) return found;
  }

  return findImageOutput(record.outputs) ?? findImageOutput(record.data);
}

function parseJson<T>(responseText: string): T {
  try {
    return JSON.parse(responseText) as T;
  } catch {
    return {} as T;
  }
}

async function fetchRemoteImageAsDataUrl(url: string, fallbackContentType: string) {
  try {
    console.log("[image-generator] download generated image", { url });
    const response = await fetch(url);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!response.ok) {
      console.warn("[image-generator] generated image download failed", {
        url,
        status: response.status,
        statusText: response.statusText,
        bodyPreview: bytes.toString("utf8").slice(0, 1000),
      });
      return null;
    }

    const contentType = response.headers.get("content-type") ?? fallbackContentType;
    return `data:${contentType};base64,${bytes.toString("base64")}`;
  } catch (error) {
    console.warn("[image-generator] generated image download errored", {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

function logImageRequest(
  label: string,
  endpoint: string,
  body: GptsapiImageRequestBody | OpenAIImageRequestBody,
) {
  console.log("[image-generator] request", {
    label,
    endpoint,
    method: "POST",
    headers: {
      Authorization: "Bearer [redacted]",
      "Content-Type": "application/json",
    },
    body: {
      ...body,
      promptLength: body.prompt.length,
    },
  });
}

function logImageResponse(
  label: string,
  endpoint: string,
  response: Response,
  responseText: string,
) {
  console.log("[image-generator] response", {
    label,
    endpoint,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: summarizeImageResponse(responseText),
  });
}

function summarizeImageResponse(responseText: string) {
  const payload = parseJson<unknown>(responseText);
  if (!payload || typeof payload !== "object") return responseText;
  return redactLargeImagePayload(payload);
}

function redactLargeImagePayload(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.startsWith("data:image/")) return summarizeDataUrl(value);
    if (value.length > 1000) {
      return { length: value.length, prefix: value.slice(0, 120) };
    }
    return value;
  }

  if (Array.isArray(value)) return value.map(redactLargeImagePayload);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === "b64_json" ? redactLargeImagePayload(String(child)) : redactLargeImagePayload(child),
    ]),
  );
}

function summarizeDataUrl(dataUrl: string) {
  return {
    length: dataUrl.length,
    prefix: dataUrl.slice(0, 120),
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function greatestCommonDivisor(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
