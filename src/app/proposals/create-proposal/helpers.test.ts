import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildLocalSafePublishSummary,
  resolveSafePublishSummary,
} from "./helpers";
import type { SafeTrackedTransactionSummary } from "@/lib/safeTrackedTransactions";

const { createSafeTrackedTransactionMock } = vi.hoisted(() => ({
  createSafeTrackedTransactionMock: vi.fn(),
}));

vi.mock("@/lib/safeTrackedTransactions", () => ({
  createSafeTrackedTransaction: createSafeTrackedTransactionMock,
}));

describe("create-proposal helpers", () => {
  const safeAddress = "0x1234567890123456789012345678901234567890" as const;
  const safeTxHash =
    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds a local Safe publish summary when persisted tracking is unavailable", () => {
    const publish = buildLocalSafePublishSummary({
      safeAddress,
      chainId: 1,
      safeTxHash,
      createdAt: "2026-03-13T21:00:00.000Z",
    });

    expect(publish).toEqual<SafeTrackedTransactionSummary>({
      kind: "publish_proposal",
      safeAddress,
      chainId: 1,
      safeTxHash,
      createdAt: "2026-03-13T21:00:00.000Z",
    });
  });

  it("persists the tracked publish when the server accepts unauthenticated tracking", async () => {
    const persistedPublish: SafeTrackedTransactionSummary = {
      kind: "publish_proposal",
      safeAddress,
      chainId: 1,
      safeTxHash,
      createdAt: "2026-03-13T21:01:00.000Z",
    };
    createSafeTrackedTransactionMock.mockResolvedValue(persistedPublish);

    const result = await resolveSafePublishSummary({
      safeAddress,
      chainId: 1,
      safeTxHash,
    });

    expect(result).toEqual({
      persisted: true,
      publish: persistedPublish,
    });
    expect(createSafeTrackedTransactionMock).toHaveBeenCalledWith(
      {
        kind: "publish_proposal",
        safeAddress,
        chainId: 1,
        safeTxHash,
      },
      undefined
    );
  });

  it("reuses a previously discovered tracked publish when available", async () => {
    const discoveredPublish: SafeTrackedTransactionSummary = {
      kind: "publish_proposal",
      safeAddress,
      chainId: 1,
      safeTxHash,
      createdAt: "2026-03-13T21:05:00.000Z",
    };

    const result = await resolveSafePublishSummary({
      discoveredPublish,
      safeAddress,
      chainId: 1,
      safeTxHash,
    });

    expect(result).toEqual({
      persisted: true,
      publish: discoveredPublish,
    });
    expect(createSafeTrackedTransactionMock).not.toHaveBeenCalled();
  });

  it("passes trace headers through when persisting the tracked publish", async () => {
    const persistedPublish: SafeTrackedTransactionSummary = {
      kind: "publish_proposal",
      safeAddress,
      chainId: 1,
      safeTxHash,
      createdAt: "2026-03-13T21:10:00.000Z",
    };
    createSafeTrackedTransactionMock.mockResolvedValue(persistedPublish);

    const result = await resolveSafePublishSummary({
      safeAddress,
      chainId: 1,
      safeTxHash,
      extraHeaders: { "x-trace-id": "trace-id" },
    });

    expect(result).toEqual({
      persisted: true,
      publish: persistedPublish,
    });
    expect(createSafeTrackedTransactionMock).toHaveBeenCalledWith(
      {
        kind: "publish_proposal",
        safeAddress,
        chainId: 1,
        safeTxHash,
      },
      { "x-trace-id": "trace-id" }
    );
  });

  it("falls back to a local summary when persisted tracking fails", async () => {
    createSafeTrackedTransactionMock.mockRejectedValue(
      new Error("Authentication required.")
    );

    const result = await resolveSafePublishSummary({
      safeAddress,
      chainId: 1,
      safeTxHash,
    });

    expect(result.persisted).toBe(false);
    expect(result.publish).toMatchObject({
      kind: "publish_proposal",
      safeAddress,
      chainId: 1,
      safeTxHash,
    });
  });
});
