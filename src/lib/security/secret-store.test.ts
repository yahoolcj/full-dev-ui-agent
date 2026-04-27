import { afterEach, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./secret-store";

const encryptionKey = Buffer.alloc(32, 7).toString("base64");

describe("secret-store", () => {
  afterEach(() => {
    delete process.env.MODEL_CONFIG_ENCRYPTION_KEY;
  });

  it("encrypts and decrypts API keys", () => {
    process.env.MODEL_CONFIG_ENCRYPTION_KEY = encryptionKey;

    const encrypted = encryptSecret("sk-test-secret");

    expect(encrypted).not.toContain("sk-test-secret");
    expect(decryptSecret(encrypted)).toBe("sk-test-secret");
  });

  it("rejects database key storage without an encryption key", () => {
    expect(() => encryptSecret("sk-test-secret")).toThrow(
      "MODEL_CONFIG_ENCRYPTION_KEY",
    );
  });
});
