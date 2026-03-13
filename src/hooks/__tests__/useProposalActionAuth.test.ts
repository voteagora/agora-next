import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";

const { ensureSiweSessionMock } = vi.hoisted(() => ({
  ensureSiweSessionMock: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: () => ({
    address: "0x1234567890123456789012345678901234567890",
    chain: { id: 1 },
  }),
}));

vi.mock("@/hooks/useEnsureSiweSession", () => ({
  useEnsureSiweSession: () => ({
    ensureSiweSession: ensureSiweSessionMock,
  }),
}));

describe("useProposalActionAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ensureSiweSessionMock.mockResolvedValue(null);
  });

  it("returns the ensured SIWE jwt", async () => {
    ensureSiweSessionMock.mockResolvedValue("jwt-token");

    const { result } = renderHook(() => useProposalActionAuth());

    await expect(
      result.current.getAuthenticationData({ action: "publishDraft" })
    ).resolves.toEqual({
      jwt: "jwt-token",
    });
  });

  it("returns null while the SIWE flow is waiting on Safe auth", async () => {
    ensureSiweSessionMock.mockResolvedValue(null);

    const { result } = renderHook(() => useProposalActionAuth());

    await expect(
      result.current.getAuthenticationData({ action: "publishDraft" })
    ).resolves.toBeNull();
  });

  it("rethrows unexpected authentication failures", async () => {
    const error = new Error("wallet transport disconnected");
    ensureSiweSessionMock.mockRejectedValue(error);

    const { result } = renderHook(() => useProposalActionAuth());

    await act(async () => {
      await expect(
        result.current.getAuthenticationData({ action: "publishDraft" })
      ).rejects.toThrow("wallet transport disconnected");
    });
  });
});
