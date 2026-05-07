import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useActiveSafeTrackedTransactions } from "@/hooks/useActiveSafeTrackedTransactions";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));
const { isSafeOnchainTransactionTrackingEnabledMock } = vi.hoisted(() => ({
  isSafeOnchainTransactionTrackingEnabledMock: vi.fn(() => true),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOnchainTransactionTrackingEnabled:
    isSafeOnchainTransactionTrackingEnabledMock,
}));

describe("useActiveSafeTrackedTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSafeOnchainTransactionTrackingEnabledMock.mockReturnValue(true);
    useQueryMock.mockImplementation((options) => options);
  });

  it("uses a 30 second poll and disables background and focus refetches", () => {
    const { result } = renderHook(() =>
      useActiveSafeTrackedTransactions({
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
      })
    );

    expect(result.current).toEqual(
      expect.objectContaining({
        enabled: true,
        queryKey: [
          "activeSafeTrackedTransactions",
          "0x1234567890123456789012345678901234567890",
          "publish_proposal",
        ],
        refetchInterval: 30_000,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: false,
        retry: false,
      })
    );
  });

  it("disables the query when Safe onchain tracking is turned off", () => {
    isSafeOnchainTransactionTrackingEnabledMock.mockReturnValue(false);

    const { result } = renderHook(() =>
      useActiveSafeTrackedTransactions({
        kind: "publish_proposal",
        safeAddress: "0x1234567890123456789012345678901234567890",
      })
    );

    expect(result.current).toEqual(
      expect.objectContaining({
        enabled: false,
      })
    );
  });
});
