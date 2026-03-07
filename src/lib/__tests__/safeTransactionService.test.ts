import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  fetchSafeMessageStatus,
  getSafeTransactionServiceBaseUrl,
} from "@/lib/safeTransactionService";

describe("safeTransactionService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps supported chain ids to the Safe transaction service base URL", () => {
    expect(getSafeTransactionServiceBaseUrl(1)).toBe(
      "https://safe-transaction-mainnet.safe.global/api/v1"
    );
    expect(getSafeTransactionServiceBaseUrl(10)).toBe(
      "https://safe-transaction-optimism.safe.global/api/v1"
    );
    expect(getSafeTransactionServiceBaseUrl(999_999)).toBeNull();
  });

  it("returns null while the Safe transaction service has not indexed the message yet", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 404 })
    );

    await expect(
      fetchSafeMessageStatus(
        1,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      )
    ).resolves.toBeNull();
  });

  it("normalizes Safe message confirmations for the UI", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          safe: "0x1234567890123456789012345678901234567890",
          messageHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          confirmations: [
            {
              owner: "0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD",
              signature:
                "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
              created: "2026-03-07T00:00:00Z",
            },
            {
              owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
              signature:
                "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
              modified: "2026-03-07T00:00:05Z",
            },
          ],
        }),
        { status: 200 }
      )
    );

    await expect(
      fetchSafeMessageStatus(
        1,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      )
    ).resolves.toEqual({
      safeAddress: "0x1234567890123456789012345678901234567890",
      messageHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      confirmations: [
        {
          owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
          signature:
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          submittedAt: "2026-03-07T00:00:00Z",
        },
        {
          owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
          signature:
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          submittedAt: "2026-03-07T00:00:05Z",
        },
      ],
      signedOwners: ["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"],
    });
  });
});
