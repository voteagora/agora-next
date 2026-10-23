"use client";

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useEnsureSiweSession } from "@/hooks/useEnsureSiweSession";

const {
  clearStoredSafeOffchainSigningStateMock,
  clearStoredSiweSessionMock,
  getStoredSiweJwtMock,
  isSafeOffchainMessageTrackingEnabledMock,
  isSafeWalletMock,
  openDialogMock,
  createMessageMock,
  verifyMessageMock,
  shouldTrackMiradorSiweLoginMock,
  signMessageAsyncMock,
  signOutMock,
  useAccountMock,
  waitForStoredSiweJwtMock,
} = vi.hoisted(() => ({
  clearStoredSafeOffchainSigningStateMock: vi.fn(),
  clearStoredSiweSessionMock: vi.fn(),
  getStoredSiweJwtMock: vi.fn(),
  isSafeOffchainMessageTrackingEnabledMock: vi.fn(() => false),
  isSafeWalletMock: vi.fn(),
  openDialogMock: vi.fn(),
  createMessageMock: vi.fn(),
  verifyMessageMock: vi.fn(),
  shouldTrackMiradorSiweLoginMock: vi.fn(() => false),
  signMessageAsyncMock: vi.fn(),
  signOutMock: vi.fn(),
  useAccountMock: vi.fn(),
  waitForStoredSiweJwtMock: vi.fn(),
}));

vi.mock("wagmi", () => ({
  useAccount: useAccountMock,
  useSignMessage: () => ({ signMessageAsync: signMessageAsyncMock }),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/components/shared/SiweProviderConfig", () => ({
  siweProviderConfig: {
    getNonce: vi.fn().mockResolvedValue("testnonce"),
    createMessage: createMessageMock,
    verifyMessage: verifyMessageMock,
  },
}));

vi.mock("connectkit", () => ({
  SIWE_NONCE_QUERY_KEY: "siwe-nonce",
  useSIWE: () => ({
    signOut: signOutMock,
  }),
}));

vi.mock("@/components/Dialogs/DialogProvider/DialogProvider", () => ({
  useOpenDialog: () => openDialogMock,
}));

vi.mock("@/lib/mirador/siweLoginTrace", () => ({
  closeStoredSiweLoginTrace: vi.fn(),
  prepareFreshSiweLoginTrace: vi.fn(),
  shouldTrackMiradorSiweLogin: shouldTrackMiradorSiweLoginMock,
}));

vi.mock("@/lib/safeOffchainFlow", () => ({
  clearStoredSafeOffchainSigningState: clearStoredSafeOffchainSigningStateMock,
  getStoredSafeOffchainSigningState: vi.fn(() => null),
  isSafeOffchainSigningFlowExpired: vi.fn(() => false),
  isSafeOffchainSigningFlowTerminal: vi.fn(() => false),
}));

vi.mock("@/lib/siweSession", () => ({
  SIWE_SESSION_CHANGE_EVENT: "agora:siwe-session-change",
  clearStoredSiweSession: clearStoredSiweSessionMock,
  getStoredSiweJwt: getStoredSiweJwtMock,
  waitForStoredSiweJwt: waitForStoredSiweJwtMock,
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOffchainMessageTrackingEnabled:
    isSafeOffchainMessageTrackingEnabledMock,
}));

vi.mock("@/lib/utils", () => ({
  isSafeWallet: isSafeWalletMock,
}));

describe("useEnsureSiweSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredSiweJwtMock.mockReturnValue(null);
    isSafeOffchainMessageTrackingEnabledMock.mockReturnValue(false);
    isSafeWalletMock.mockResolvedValue(true);
    createMessageMock.mockImplementation(({ chainId }) =>
      Promise.resolve(`test siwe message ${chainId}`)
    );
    verifyMessageMock.mockResolvedValue(true);
    signMessageAsyncMock.mockResolvedValue("0xsignature");
    signOutMock.mockResolvedValue(undefined);
    useAccountMock.mockReturnValue({ connector: undefined });
    waitForStoredSiweJwtMock.mockResolvedValue("safe-jwt");
    shouldTrackMiradorSiweLoginMock.mockReturnValue(false);
  });

  it("falls back to direct Safe SIWE sign-in when offchain tracking is disabled", async () => {
    const { result } = renderHook(() =>
      useEnsureSiweSession({
        address: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        purpose: "notification_preferences",
      })
    );

    let jwt: string | null = null;
    await act(async () => {
      jwt = await result.current.ensureSiweSession();
    });

    expect(jwt).toBe("safe-jwt");
    expect(clearStoredSafeOffchainSigningStateMock).toHaveBeenCalledTimes(1);
    expect(clearStoredSiweSessionMock).toHaveBeenCalledTimes(1);
    expect(signMessageAsyncMock).toHaveBeenCalledWith({
      message: "test siwe message 1",
    });
    expect(waitForStoredSiweJwtMock).toHaveBeenCalledWith({
      expectedAddress: "0x1234567890123456789012345678901234567890",
    });
    expect(openDialogMock).not.toHaveBeenCalled();
  });

  it("retries a connector chain mismatch once using the live connector chain", async () => {
    const connector = { getChainId: vi.fn().mockResolvedValue(10) };
    const mismatch = Object.assign(new Error("chain mismatch"), {
      name: "ConnectorChainMismatchError",
    });
    useAccountMock.mockReturnValue({ connector });
    signMessageAsyncMock
      .mockRejectedValueOnce(mismatch)
      .mockResolvedValueOnce("0xsignature");

    const { result } = renderHook(() =>
      useEnsureSiweSession({
        address: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        purpose: "notification_preferences",
      })
    );

    await act(async () => {
      await result.current.ensureSiweSession();
    });

    expect(createMessageMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ chainId: 1, nonce: "testnonce" })
    );
    expect(createMessageMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ chainId: 10, nonce: "testnonce" })
    );
    expect(signMessageAsyncMock).toHaveBeenNthCalledWith(1, {
      message: "test siwe message 1",
    });
    expect(signMessageAsyncMock).toHaveBeenNthCalledWith(2, {
      message: "test siwe message 10",
      connector,
    });
    expect(verifyMessageMock).toHaveBeenCalledWith({
      message: "test siwe message 10",
      signature: "0xsignature",
    });
  });

  it("does not retry other signing errors", async () => {
    const connector = { getChainId: vi.fn().mockResolvedValue(10) };
    useAccountMock.mockReturnValue({ connector });
    signMessageAsyncMock.mockRejectedValueOnce(new Error("wallet failed"));

    const { result } = renderHook(() =>
      useEnsureSiweSession({
        address: "0x1234567890123456789012345678901234567890",
        chainId: 1,
        purpose: "notification_preferences",
      })
    );

    await act(async () => {
      await expect(result.current.ensureSiweSession()).rejects.toThrow(
        "wallet failed"
      );
    });
    expect(signMessageAsyncMock).toHaveBeenCalledTimes(1);
    expect(connector.getChainId).not.toHaveBeenCalled();
  });
});
