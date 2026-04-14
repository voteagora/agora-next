import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSafeMessageStatus } from "@/hooks/useSafeMessageStatus";

const { useQueryMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
}));
const { isSafeOffchainMessageTrackingEnabledMock } = vi.hoisted(() => ({
  isSafeOffchainMessageTrackingEnabledMock: vi.fn(() => true),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (options: unknown) => useQueryMock(options),
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOffchainMessageTrackingEnabled:
    isSafeOffchainMessageTrackingEnabledMock,
}));

describe("useSafeMessageStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isSafeOffchainMessageTrackingEnabledMock.mockReturnValue(true);
    useQueryMock.mockImplementation((options) => options);
  });

  it("disables the query when Safe offchain tracking is turned off", () => {
    isSafeOffchainMessageTrackingEnabledMock.mockReturnValue(false);

    const { result } = renderHook(() =>
      useSafeMessageStatus({
        chainId: 1,
        messageHash:
          "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
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
