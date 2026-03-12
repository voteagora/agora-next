import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn<typeof fetch>();

vi.stubGlobal("fetch", fetchMock);

describe("safeApi.server", () => {
  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
  });

  it("falls back to the gateway when the legacy Safe transaction service returns 404 for a message", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            safe: "0x1234567890123456789012345678901234567890",
            confirmations: [
              {
                owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
                signature:
                  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                created: "2026-03-10T00:00:00Z",
              },
            ],
          }),
          { status: 200 }
        )
      );

    const { getSafeMessageStatusForClient } = await import(
      "@/lib/safeApi.server"
    );

    await expect(
      getSafeMessageStatusForClient(
        1,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      )
    ).resolves.toEqual({
      status: {
        safeAddress: "0x1234567890123456789012345678901234567890",
        messageHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        confirmations: [
          {
            owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            signature:
              "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            submittedAt: "2026-03-10T00:00:00Z",
          },
        ],
        signedOwners: ["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"],
      },
      nextPollMs: 3000,
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://safe-transaction-mainnet.safe.global/api/v1/messages/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      expect.objectContaining({
        cache: "no-store",
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.safe.global/tx-service/eth/api/v1/messages/0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      expect.objectContaining({
        cache: "no-store",
      })
    );
  });

  it("returns recent Safe messages and multisig transactions for a debug snapshot", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                messageHash:
                  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                created: "2026-03-10T00:00:00Z",
                modified: "2026-03-10T00:01:00Z",
              },
            ],
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                safeTxHash:
                  "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
                transactionHash:
                  "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
                nonce: 7,
                created: "2026-03-10T00:02:00Z",
                modified: "2026-03-10T00:03:00Z",
                isExecuted: false,
                isSuccessful: null,
              },
            ],
          }),
          { status: 200 }
        )
      );

    const { getSafeDebugSnapshotForClient } = await import("@/lib/safeApi.server");

    await expect(
      getSafeDebugSnapshotForClient(
        1,
        "0x1234567890123456789012345678901234567890",
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
      )
    ).resolves.toEqual({
      chainId: 1,
      safeAddress: "0x1234567890123456789012345678901234567890",
      trackedMessageHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      matchingRecentMessage: {
        messageHash:
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        created: "2026-03-10T00:00:00Z",
        modified: "2026-03-10T00:01:00Z",
      },
      recentMessages: {
        status: 200,
        attempts: [
          {
            url: "https://safe-transaction-mainnet.safe.global/api/v1/safes/0x1234567890123456789012345678901234567890/messages/?limit=5&ordering=-modified",
            status: 200,
          },
        ],
        items: [
          {
            messageHash:
              "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            created: "2026-03-10T00:00:00Z",
            modified: "2026-03-10T00:01:00Z",
          },
        ],
      },
      recentMultisigTransactions: {
        status: 200,
        attempts: [
          {
            url: "https://safe-transaction-mainnet.safe.global/api/v1/safes/0x1234567890123456789012345678901234567890/multisig-transactions/?limit=5&ordering=-modified",
            status: 200,
          },
        ],
        items: [
          {
            safeTxHash:
              "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
            transactionHash:
              "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
            nonce: 7,
            created: "2026-03-10T00:02:00Z",
            modified: "2026-03-10T00:03:00Z",
            isExecuted: false,
            isSuccessful: null,
          },
        ],
      },
    });
  });

  it("normalizes Safe multisig transaction details for signer status polling", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          safe: "0x1234567890123456789012345678901234567890",
          safeTxHash:
            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          confirmationsRequired: 2,
          isExecuted: false,
          isSuccessful: null,
          transactionHash:
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          confirmations: [
            {
              owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
              signature:
                "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
              submissionDate: "2026-03-10T00:04:00Z",
            },
          ],
        }),
        { status: 200 }
      )
    );

    const { getSafeMultisigTransactionForClient } = await import(
      "@/lib/safeApi.server"
    );

    await expect(
      getSafeMultisigTransactionForClient(
        1,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      )
    ).resolves.toEqual({
      found: true,
      status: {
        safeAddress: "0x1234567890123456789012345678901234567890",
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        confirmations: [
          {
            owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
            signature:
              "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
            submittedAt: "2026-03-10T00:04:00Z",
          },
        ],
        signedOwners: ["0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"],
        threshold: 2,
        isExecuted: false,
        isSuccessful: null,
        transactionHash:
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      },
      isSuccessful: null,
      transactionHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      nextPollMs: 3000,
    });
  });

  it("classifies a missing multisig transaction as removed when it is gone from the Safe queue after the grace period", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [],
          }),
          { status: 200 }
        )
      );

    const { getSafeMultisigTransactionForClient } = await import(
      "@/lib/safeApi.server"
    );

    await expect(
      getSafeMultisigTransactionForClient(
        1,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        {
          safeAddress: "0x1234567890123456789012345678901234567890",
          createdAt: Date.now() - 60_000,
        }
      )
    ).resolves.toEqual({
      found: false,
      status: null,
      isSuccessful: null,
      nextPollMs: 30_000,
      missingReason: "removed",
    });
  });

  it("keeps a missing multisig transaction in indexing state when the queue still contains the tracked safeTxHash", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                type: "TRANSACTION",
                transaction: {
                  id: "queued_tx_1",
                  timestamp: 1710000005000,
                },
              },
            ],
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            safeAddress: "0x1234567890123456789012345678901234567890",
            txId: "queued_tx_1",
            detailedExecutionInfo: {
              type: "MULTISIG",
              safeTxHash:
                "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            },
          }),
          { status: 200 }
        )
      );

    const { getSafeMultisigTransactionForClient } = await import(
      "@/lib/safeApi.server"
    );

    await expect(
      getSafeMultisigTransactionForClient(
        1,
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        {
          safeAddress: "0x1234567890123456789012345678901234567890",
          createdAt: Date.now() - 60_000,
        }
      )
    ).resolves.toEqual({
      found: false,
      status: null,
      isSuccessful: null,
      nextPollMs: 5_000,
      missingReason: "indexing",
    });
  });

  it("discovers a queued Safe multisig transaction by exact calldata match", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                type: "TRANSACTION",
                transaction: {
                  id: "multisig_old_candidate",
                  timestamp: 1710000000000,
                  txStatus: "AWAITING_CONFIRMATIONS",
                  txInfo: {
                    to: {
                      value: "0x9999999999999999999999999999999999999999",
                    },
                  },
                },
              },
              {
                type: "TRANSACTION",
                transaction: {
                  id: "multisig_matching_candidate",
                  timestamp: 1710000005000,
                  txStatus: "AWAITING_CONFIRMATIONS",
                  txInfo: {
                    to: {
                      value: "0x9999999999999999999999999999999999999999",
                    },
                  },
                },
              },
            ],
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            safeAddress: "0x1234567890123456789012345678901234567890",
            txId: "multisig_matching_candidate",
            txData: {
              hexData: "0xdeadbeef",
              to: {
                value: "0x9999999999999999999999999999999999999999",
              },
            },
            detailedExecutionInfo: {
              type: "MULTISIG",
              safeTxHash:
                "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            },
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            safeAddress: "0x1234567890123456789012345678901234567890",
            txId: "multisig_old_candidate",
            txData: {
              hexData: "0x11111111",
              to: {
                value: "0x9999999999999999999999999999999999999999",
              },
            },
            detailedExecutionInfo: {
              type: "MULTISIG",
              safeTxHash:
                "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            },
          }),
          { status: 200 }
        )
      );

    const { findQueuedSafeMultisigTransactionForClient } = await import(
      "@/lib/safeApi.server"
    );

    await expect(
      findQueuedSafeMultisigTransactionForClient({
        chainId: 1,
        safeAddress: "0x1234567890123456789012345678901234567890",
        to: "0x9999999999999999999999999999999999999999",
        data: "0xdeadbeef",
        createdAfter: 1710000000000,
      })
    ).resolves.toEqual({
      safeTxHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      txId: "multisig_matching_candidate",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://safe-client.safe.global/v1/chains/1/safes/0x1234567890123456789012345678901234567890/transactions/queued?trusted=true",
      expect.objectContaining({
        cache: "no-store",
      })
    );
  });
});
