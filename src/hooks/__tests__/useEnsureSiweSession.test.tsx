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
  shouldTrackMiradorSiweLoginMock,
  signInMock,
  signOutMock,
  waitForStoredSiweJwtMock,
} = vi.hoisted(() => ({
  clearStoredSafeOffchainSigningStateMock: vi.fn(),
  clearStoredSiweSessionMock: vi.fn(),
  getStoredSiweJwtMock: vi.fn(),
  isSafeOffchainMessageTrackingEnabledMock: vi.fn(() => false),
  isSafeWalletMock: vi.fn(),
  openDialogMock: vi.fn(),
  shouldTrackMiradorSiweLoginMock: vi.fn(() => false),
  signInMock: vi.fn(),
  signOutMock: vi.fn(),
  waitForStoredSiweJwtMock: vi.fn(),
}));

vi.mock("connectkit", () => ({
  useSIWE: () => ({
    signIn: signInMock,
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
    signInMock.mockResolvedValue(true);
    signOutMock.mockResolvedValue(undefined);
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
    expect(signInMock).toHaveBeenCalledTimes(1);
    expect(waitForStoredSiweJwtMock).toHaveBeenCalledWith({
      expectedAddress: "0x1234567890123456789012345678901234567890",
    });
    expect(openDialogMock).not.toHaveBeenCalled();
  });
});
