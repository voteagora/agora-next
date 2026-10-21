import { describe, expect, it } from "vitest";

import {
  ALLOWED_PROFILE_IMAGE_CONTENT_TYPES,
  sniffImageContentType,
  validateUploadRateLimit,
} from "./uploadValidation";

function withPadding(header: number[] | Buffer, length = 32): Buffer {
  const buffer = Buffer.alloc(length);
  Buffer.from(header).copy(buffer);
  return buffer;
}

describe("sniffImageContentType", () => {
  it("detects JPEG", () => {
    expect(sniffImageContentType(withPadding([0xff, 0xd8, 0xff, 0xe0]))).toBe(
      "image/jpeg"
    );
  });

  it("detects PNG", () => {
    expect(
      sniffImageContentType(
        withPadding([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      )
    ).toBe("image/png");
  });

  it("detects GIF", () => {
    expect(sniffImageContentType(withPadding(Buffer.from("GIF89a")))).toBe(
      "image/gif"
    );
    expect(sniffImageContentType(withPadding(Buffer.from("GIF87a")))).toBe(
      "image/gif"
    );
  });

  it("detects WebP", () => {
    const header = Buffer.concat([
      Buffer.from("RIFF"),
      Buffer.from([0x10, 0x00, 0x00, 0x00]),
      Buffer.from("WEBP"),
    ]);
    expect(sniffImageContentType(withPadding(header))).toBe("image/webp");
  });

  it("returns null for unrecognized content", () => {
    expect(sniffImageContentType(withPadding(Buffer.from("<svg xmlns")))).toBe(
      null
    );
    expect(sniffImageContentType(Buffer.from([0xff, 0xd8, 0xff]))).toBeNull();
    expect(sniffImageContentType(Buffer.alloc(0))).toBeNull();
  });
});

describe("profile image limits", () => {
  it("only allows raster image types", () => {
    expect([...ALLOWED_PROFILE_IMAGE_CONTENT_TYPES].sort()).toEqual([
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);
  });

  it("rate limits the profile-image scope after 10 uploads", () => {
    const address = `0x${"1".repeat(40)}`;
    for (let i = 0; i < 10; i += 1) {
      expect(
        validateUploadRateLimit({ address, scope: "profile-image" })
      ).toBeNull();
    }
    expect(
      validateUploadRateLimit({ address, scope: "profile-image" })
    ).toMatch(/rate limit/i);
  });
});
