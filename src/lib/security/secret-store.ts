import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

export function canEncryptSecrets() {
  return Boolean(process.env.MODEL_CONFIG_ENCRYPTION_KEY);
}

export function encryptSecret(secret: string) {
  const key = encryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(secret, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    v: 1,
    alg: ALGORITHM,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: ciphertext.toString("base64"),
  });
}

export function decryptSecret(payload: string) {
  const key = encryptionKey();
  const parsed = JSON.parse(payload) as {
    v: number;
    alg: string;
    iv: string;
    tag: string;
    data: string;
  };

  if (parsed.v !== 1 || parsed.alg !== ALGORITHM) {
    throw new Error("Unsupported encrypted secret payload.");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(parsed.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(parsed.tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(parsed.data, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function encryptionKey() {
  const raw = process.env.MODEL_CONFIG_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "MODEL_CONFIG_ENCRYPTION_KEY is required to store API keys in the database.",
    );
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("MODEL_CONFIG_ENCRYPTION_KEY must decode to 32 bytes.");
  }

  return key;
}
