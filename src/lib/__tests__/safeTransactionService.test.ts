import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  encodeSafeMessageConfirmations,
  fetchSafeMessageStatus,
  fetchSafeMultisigTransactionStatus,
  normalizeSafeMessageStatusApiResponse,
  normalizeSafeMultisigTransactionApiResponse,
} from "@/lib/safeTransactionService";

describe("safeTransactionService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("loads Safe message status from the internal API route", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: null,
          nextPollMs: 5_000,
        }),
        { status: 200 }
      )
    );

    await expect(
      fetchSafeMessageStatus(
        1,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0x1234567890123456789012345678901234567890"
      )
    ).resolves.toEqual({
      status: null,
      nextPollMs: 5_000,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/internal/safe/message-status?chainId=1&messageHash=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa&safeAddress=0x1234567890123456789012345678901234567890",
      { cache: "no-store" }
    );
  });

  it("normalizes Safe message confirmations for the UI", () => {
    expect(
      normalizeSafeMessageStatusApiResponse(
        {
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
        },
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      )
    ).toEqual({
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

  it("loads Safe multisig transaction status from the internal API route", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          found: true,
          status: {
            safeAddress: "0x1234567890123456789012345678901234567890",
            safeTxHash:
              "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            confirmations: [],
            signedOwners: [],
            threshold: 2,
            isExecuted: false,
            isSuccessful: true,
            transactionHash:
              "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          },
          isSuccessful: true,
          transactionHash:
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          nextPollMs: 5_000,
        }),
        { status: 200 }
      )
    );

    await expect(
      fetchSafeMultisigTransactionStatus(
        1,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      )
    ).resolves.toEqual({
      found: true,
      status: {
        safeAddress: "0x1234567890123456789012345678901234567890",
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        confirmations: [],
        signedOwners: [],
        threshold: 2,
        isExecuted: false,
        isSuccessful: true,
        transactionHash:
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      },
      isSuccessful: true,
      transactionHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      nextPollMs: 5_000,
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/internal/safe/multisig-transaction?chainId=1&safeTxHash=0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      { cache: "no-store" }
    );
  });

  it("fails fast on unsupported Safe tx-service chains", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      fetchSafeMessageStatus(
        59141,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "0x1234567890123456789012345678901234567890"
      )
    ).rejects.toThrow(
      "Safe proposal flows are not supported on this chain yet."
    );

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("encodes Safe confirmation signatures in owner order", () => {
    expect(
      encodeSafeMessageConfirmations([
        {
          owner: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          signature:
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        },
        {
          owner: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          signature:
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        },
      ])
    ).toBe(
      "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
    );
  });

  it("normalizes Safe multisig confirmations for the UI", () => {
    expect(
      normalizeSafeMultisigTransactionApiResponse(
        {
          safe: "0x1234567890123456789012345678901234567890",
          safeTxHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          confirmationsRequired: "2",
          isExecuted: false,
          isSuccessful: null,
          transactionHash:
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          confirmations: [
            {
              owner: "0xABCDEFabcdefABCDEFabcdefABCDEFabcdefABCD",
              signature:
                "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
              submissionDate: "2026-03-07T00:00:00Z",
            },
          ],
        },
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      )
    ).toEqual({
      safeAddress: "0x1234567890123456789012345678901234567890",
      safeTxHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      confirmations: [
        {
          owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
          signature:
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
          submittedAt: "2026-03-07T00:00:00Z",
        },
      ],
      signedOwners: ["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"],
      threshold: 2,
      isExecuted: false,
      isSuccessful: null,
      transactionHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    });
  });
});
