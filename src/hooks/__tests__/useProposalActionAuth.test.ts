import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useProposalActionAuth } from "@/hooks/useProposalActionAuth";

const { signMessageAsyncMock, getStoredSiweJwtMock } = vi.hoisted(() => ({
  signMessageAsyncMock: vi.fn(),
  getStoredSiweJwtMock: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useSignMessage: () => ({
    signMessageAsync: signMessageAsyncMock,
  }),
}));

vi.mock("@/lib/siweSession", () => ({
  getStoredSiweJwt: getStoredSiweJwtMock,
}));

describe("useProposalActionAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredSiweJwtMock.mockReturnValue(null);
  });

  it("returns the stored SIWE jwt when present", async () => {
    getStoredSiweJwtMock.mockReturnValue("jwt-token");

    const { result } = renderHook(() => useProposalActionAuth());

    await expect(
      result.current.getAuthenticationData({ action: "publishDraft" })
    ).resolves.toEqual({
      jwt: "jwt-token",
    });

    expect(signMessageAsyncMock).not.toHaveBeenCalled();
  });

  it("treats explicit user rejection as a normal cancel path", async () => {
    signMessageAsyncMock.mockRejectedValue({
      code: 4001,
      message: "User rejected the request.",
    });

    const { result } = renderHook(() => useProposalActionAuth());

    await expect(
      result.current.getAuthenticationData({ action: "publishDraft" })
    ).resolves.toBeNull();
  });

  it("rethrows unexpected signing failures", async () => {
    const error = new Error("wallet transport disconnected");
    signMessageAsyncMock.mockRejectedValue(error);

    const { result } = renderHook(() => useProposalActionAuth());

    await act(async () => {
      await expect(
        result.current.getAuthenticationData({ action: "publishDraft" })
      ).rejects.toThrow("wallet transport disconnected");
    });
  });
});
