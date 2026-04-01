import { beforeEach, describe, expect, it, vi } from "vitest";

const queryRawMock = vi.fn();
const executeRawMock = vi.fn();
const getSafeMultisigTransactionForClientMock = vi.fn();
const appendServerTraceEventMock = vi.fn();

vi.mock("@/app/lib/prisma", () => ({
  prismaWeb2Client: {
    $queryRaw: queryRawMock,
    $executeRaw: executeRawMock,
  },
}));

vi.mock("@/lib/safeApi.server", () => ({
  getSafeMultisigTransactionForClient: getSafeMultisigTransactionForClientMock,
}));

vi.mock("@/lib/mirador/serverTrace", () => ({
  appendServerTraceEvent: appendServerTraceEventMock,
}));

describe("safeTrackedTransactions.server", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    queryRawMock.mockReset();
    executeRawMock.mockReset();
    getSafeMultisigTransactionForClientMock.mockReset();
    appendServerTraceEventMock.mockReset();
  });

  it("upserts a pending tracked Safe transaction and appends a Safe tx hint", async () => {
    getSafeMultisigTransactionForClientMock.mockResolvedValue({
      found: true,
      status: {
        safeAddress: "0x1234567890123456789012345678901234567890",
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        confirmations: [],
        signedOwners: [],
        threshold: 2,
        isExecuted: false,
        isSuccessful: null,
      },
      isSuccessful: null,
      transactionHash: undefined,
      nextPollMs: 5000,
    });
    queryRawMock.mockResolvedValueOnce([
      {
        dao_slug: "ENS",
        kind: "publish_proposal",
        safe_address: "0x1234567890123456789012345678901234567890",
        chain_id: 1,
        safe_tx_hash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        created_at: new Date("2026-03-11T00:00:00Z"),
      },
    ]);

    const { upsertSafeTrackedTransaction } = await import(
      "@/lib/safeTrackedTransactions.server"
    );

    await expect(
      upsertSafeTrackedTransaction({
        daoSlug: "ENS",
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        traceContext: {
          traceId: "trace-123",
          flow: "proposal_creation",
        },
      })
    ).resolves.toMatchObject({
      kind: "publish_proposal",
      safeAddress: "0x1234567890123456789012345678901234567890",
      safeTxHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });

    expect(appendServerTraceEventMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "safe_tracked_transaction_recorded",
        safeTxHints: [
          expect.objectContaining({
            safeTxHash:
              "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            chain: "ethereum",
          }),
        ],
      })
    );
  });

  it("can record the tracked Safe transaction without appending a duplicate Safe tx hint", async () => {
    getSafeMultisigTransactionForClientMock.mockResolvedValue({
      found: true,
      status: {
        safeAddress: "0x1234567890123456789012345678901234567890",
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        confirmations: [],
        signedOwners: [],
        threshold: 2,
        isExecuted: false,
        isSuccessful: null,
      },
      isSuccessful: null,
      transactionHash: undefined,
      nextPollMs: 5000,
    });
    queryRawMock.mockResolvedValueOnce([
      {
        dao_slug: "ENS",
        kind: "publish_proposal",
        safe_address: "0x1234567890123456789012345678901234567890",
        chain_id: 1,
        safe_tx_hash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        created_at: new Date("2026-03-11T00:00:00Z"),
      },
    ]);

    const { upsertSafeTrackedTransaction } = await import(
      "@/lib/safeTrackedTransactions.server"
    );

    await upsertSafeTrackedTransaction({
      daoSlug: "ENS",
      kind: "publish_proposal",
      safeAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      safeTxHash:
        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      traceContext: {
        traceId: "trace-123",
        flow: "proposal_creation",
      },
      includeTraceSafeTxHint: false,
    });

    const traceEvent = appendServerTraceEventMock.mock.calls[0]?.[0];
    expect(traceEvent).toMatchObject({
      eventName: "safe_tracked_transaction_recorded",
    });
    expect(traceEvent).not.toHaveProperty("safeTxHints");
  });

  it("fails closed when the initial Safe lookup throws", async () => {
    getSafeMultisigTransactionForClientMock.mockRejectedValue(
      new Error("Safe API unavailable")
    );

    const { upsertSafeTrackedTransaction } = await import(
      "@/lib/safeTrackedTransactions.server"
    );

    await expect(
      upsertSafeTrackedTransaction({
        daoSlug: "ENS",
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        traceContext: {
          traceId: "trace-123",
          flow: "proposal_creation",
        },
      })
    ).rejects.toThrow(
      "Unable to validate the Safe transaction right now. Please retry."
    );

    expect(queryRawMock).not.toHaveBeenCalled();
    expect(appendServerTraceEventMock).not.toHaveBeenCalled();
  });

  it("filters out rows that become terminal while refreshing the active list", async () => {
    queryRawMock.mockResolvedValueOnce([
      {
        dao_slug: "ENS",
        kind: "publish_proposal",
        safe_address: "0x1234567890123456789012345678901234567890",
        chain_id: 1,
        safe_tx_hash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        created_at: new Date("2026-03-11T00:00:00Z"),
      },
    ]);
    executeRawMock.mockResolvedValue(1);
    getSafeMultisigTransactionForClientMock.mockResolvedValue({
      found: true,
      status: {
        safeAddress: "0x1234567890123456789012345678901234567890",
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        confirmations: [],
        signedOwners: [],
        threshold: 2,
        isExecuted: true,
        isSuccessful: true,
        transactionHash:
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      },
      isSuccessful: true,
      transactionHash:
        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      nextPollMs: 5000,
    });

    const { listActiveSafeTrackedTransactions } = await import(
      "@/lib/safeTrackedTransactions.server"
    );

    await expect(
      listActiveSafeTrackedTransactions({
        daoSlug: "ENS",
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
      })
    ).resolves.toEqual([]);

    expect(executeRawMock).toHaveBeenCalledTimes(1);
  });

  it("deletes tracked rows when the Safe transaction is removed from the queue", async () => {
    queryRawMock.mockResolvedValueOnce([
      {
        dao_slug: "ENS",
        kind: "publish_proposal",
        safe_address: "0x1234567890123456789012345678901234567890",
        chain_id: 1,
        safe_tx_hash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        created_at: new Date("2026-03-11T00:00:00Z"),
      },
    ]);
    executeRawMock.mockResolvedValue(1);
    getSafeMultisigTransactionForClientMock.mockResolvedValue({
      found: false,
      status: null,
      isSuccessful: null,
      nextPollMs: 30_000,
      missingReason: "removed",
    });

    const { listActiveSafeTrackedTransactions } = await import(
      "@/lib/safeTrackedTransactions.server"
    );

    await expect(
      listActiveSafeTrackedTransactions({
        daoSlug: "ENS",
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
      })
    ).resolves.toEqual([]);

    expect(executeRawMock).toHaveBeenCalledTimes(1);
  });

  it("keeps other tracked rows available when one refresh lookup fails", async () => {
    queryRawMock.mockResolvedValueOnce([
      {
        dao_slug: "ENS",
        kind: "publish_proposal",
        safe_address: "0x1234567890123456789012345678901234567890",
        chain_id: 1,
        safe_tx_hash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        created_at: new Date("2026-03-11T00:00:00Z"),
      },
      {
        dao_slug: "ENS",
        kind: "publish_proposal",
        safe_address: "0x1234567890123456789012345678901234567890",
        chain_id: 1,
        safe_tx_hash:
          "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        created_at: new Date("2026-03-11T00:01:00Z"),
      },
    ]);
    executeRawMock.mockResolvedValue(1);
    getSafeMultisigTransactionForClientMock
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce({
        found: true,
        status: {
          safeAddress: "0x1234567890123456789012345678901234567890",
          safeTxHash:
            "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          confirmations: [],
          signedOwners: [],
          threshold: 2,
          isExecuted: true,
          isSuccessful: true,
          transactionHash:
            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        },
        isSuccessful: true,
        transactionHash:
          "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        nextPollMs: 5000,
      });

    const { listActiveSafeTrackedTransactions } = await import(
      "@/lib/safeTrackedTransactions.server"
    );

    await expect(
      listActiveSafeTrackedTransactions({
        daoSlug: "ENS",
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
      })
    ).resolves.toEqual([
      {
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        createdAt: "2026-03-11T00:00:00.000Z",
      },
    ]);

    expect(executeRawMock).toHaveBeenCalledTimes(1);
  });

  it("skips Safe refresh lookups for rows checked within the freshness window", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-11T00:00:00Z"));

    queryRawMock.mockResolvedValue([
      {
        dao_slug: "ENS",
        kind: "publish_proposal",
        safe_address: "0x1234567890123456789012345678901234567890",
        chain_id: 1,
        safe_tx_hash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        created_at: new Date("2026-03-11T00:00:00Z"),
      },
    ]);
    getSafeMultisigTransactionForClientMock.mockResolvedValue({
      found: true,
      status: {
        safeAddress: "0x1234567890123456789012345678901234567890",
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        confirmations: [],
        signedOwners: [],
        threshold: 2,
        isExecuted: false,
        isSuccessful: null,
      },
      isSuccessful: null,
      transactionHash: undefined,
      nextPollMs: 5000,
    });

    const { listActiveSafeTrackedTransactions } = await import(
      "@/lib/safeTrackedTransactions.server"
    );

    await listActiveSafeTrackedTransactions({
      daoSlug: "ENS",
      kind: "publish_proposal",
      safeAddress: "0x1234567890123456789012345678901234567890",
    });
    vi.setSystemTime(new Date("2026-03-11T00:00:10Z"));
    await listActiveSafeTrackedTransactions({
      daoSlug: "ENS",
      kind: "publish_proposal",
      safeAddress: "0x1234567890123456789012345678901234567890",
    });

    expect(getSafeMultisigTransactionForClientMock).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-03-11T00:00:16Z"));
    await listActiveSafeTrackedTransactions({
      daoSlug: "ENS",
      kind: "publish_proposal",
      safeAddress: "0x1234567890123456789012345678901234567890",
    });

    expect(getSafeMultisigTransactionForClientMock).toHaveBeenCalledTimes(2);
  });

  it("deletes tracked transactions older than the TTL cutoff", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-12T00:00:00Z"));
    executeRawMock.mockResolvedValue(3);

    const { deleteExpiredSafeTrackedTransactions } = await import(
      "@/lib/safeTrackedTransactions.server"
    );

    await expect(deleteExpiredSafeTrackedTransactions()).resolves.toEqual({
      deletedCount: 3,
      cutoff: new Date("2026-02-10T00:00:00Z"),
    });

    expect(executeRawMock).toHaveBeenCalledTimes(1);
  });
});
