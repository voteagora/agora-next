import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSafeMultisigTransactionStatus } from "@/hooks/useSafeMultisigTransactionStatus";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

describe("useSafeMultisigTransactionStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryMock.mockImplementation((options) => options);
  });

  it("disables background and focus refetches while polling active Safe tx status", () => {
    const { result } = renderHook(() =>
      useSafeMultisigTransactionStatus({
        chainId: 1,
        safeTxHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        safeAddress: "0x1234567890123456789012345678901234567890",
        createdAt: "2026-03-12T00:00:00.000Z",
      })
    );

    const queryOptions = result.current as {
      enabled: boolean;
      refetchInterval: (query: {
        state: {
          data?: {
            isSuccessful?: boolean | null;
            missingReason?: "indexing" | "removed";
            nextPollMs?: number;
          };
        };
      }) => false | number;
      refetchIntervalInBackground: boolean;
      refetchOnWindowFocus: boolean;
      retry: boolean;
    };

    expect(queryOptions.enabled).toBe(true);
    expect(
      queryOptions.refetchInterval({
        state: {
          data: {
            isSuccessful: null,
            missingReason: "indexing",
            nextPollMs: 7_000,
          },
        },
      })
    ).toBe(7_000);
    expect(
      queryOptions.refetchInterval({
        state: {
          data: {
            isSuccessful: null,
            missingReason: "removed",
            nextPollMs: 30_000,
          },
        },
      })
    ).toBe(false);
    expect(queryOptions.refetchIntervalInBackground).toBe(false);
    expect(queryOptions.refetchOnWindowFocus).toBe(false);
    expect(queryOptions.retry).toBe(false);
  });
});
