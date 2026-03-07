import { describe, expect, it, vi, beforeEach } from "vitest";

import { getCanonicalSafeMessageHash } from "../safeMessages";
import { getPublicClient } from "@/lib/viem";

vi.mock("@/lib/viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/viem")>();
  return {
    ...actual,
    getPublicClient: vi.fn(),
  };
});

describe("getCanonicalSafeMessageHash", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("derives the canonical Safe message hash from the Safe domain separator", async () => {
    (getPublicClient as any).mockReturnValue({
      readContract: vi
        .fn()
        .mockResolvedValue(
          "0x8b53d4b7d1f2212f0d7b0bfa4a1a9ec5d0b7c3f54f5db16d2c6b0f9b8e5f1a6c"
        ),
    });

    const result = await getCanonicalSafeMessageHash({
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      message: "hello world",
    });

    expect(result).toBe(
      "0x1665ec16a9bd923115ae0a5574ffa9310c381315584d15bde8ddc3f2dd8d7e33"
    );
  });
});
