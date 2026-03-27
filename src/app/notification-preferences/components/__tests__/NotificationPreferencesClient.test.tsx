import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import NotificationPreferencesClient from "../NotificationPreferencesClient";
import { useAccount } from "wagmi";
import { useModal, useSIWE } from "connectkit";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import {
  clearStoredSiweSession,
  getStoredSiweJwt,
  waitForStoredSiweJwt,
} from "@/lib/siweSession";
import { isSafeWallet } from "@/lib/utils";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useHasPermission } from "@/hooks/useRbacPermissions";

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
}));

vi.mock("connectkit", () => ({
  useModal: vi.fn(),
  useSIWE: vi.fn(),
}));

vi.mock("@/components/Dialogs/DialogProvider/DialogProvider", () => ({
  useOpenDialog: vi.fn(),
}));

vi.mock("@/lib/siweSession", () => ({
  SIWE_SESSION_CHANGE_EVENT: "agora:siwe-session-change",
  clearStoredSiweSession: vi.fn(),
  getStoredSiweJwt: vi.fn(),
  waitForStoredSiweJwt: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
  isSafeWallet: vi.fn(),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/lib/safeOffchainFlow", () => ({
  clearStoredSafeOffchainSigningState: vi.fn(),
  getStoredSafeOffchainSigningState: vi.fn(),
  isSafeOffchainSigningFlowExpired: vi.fn(() => false),
  isSafeOffchainSigningFlowTerminal: vi.fn(() => false),
}));

const { isSafeOffchainMessageTrackingEnabledMock } = vi.hoisted(() => ({
  isSafeOffchainMessageTrackingEnabledMock: vi.fn(() => true),
}));

vi.mock("@/lib/safeFeatures", () => ({
  isSafeOffchainMessageTrackingEnabled:
    isSafeOffchainMessageTrackingEnabledMock,
  SAFE_OFFCHAIN_MESSAGE_TRACKING_DISABLED_MESSAGE:
    "Safe offchain message tracking is disabled for this tenant.",
}));

vi.mock("@/hooks/usePushNotifications", () => ({
  usePushNotifications: vi.fn(),
}));

vi.mock("@/hooks/useRbacPermissions", () => ({
  useHasPermission: vi.fn(),
}));

vi.mock("../ContactInformationSection", () => ({
  __esModule: true,
  default: () => <div>Contact Information</div>,
  renderStatusIcon: () => <span>icon</span>,
}));

vi.mock("../PreferencesMatrix", () => ({
  __esModule: true,
  default: () => <div>Preferences Matrix</div>,
}));

const openDialogMock = vi.fn();
const signInMock = vi.fn();
const signOutMock = vi.fn();
const setOpenMock = vi.fn();
const fetchMock = vi.fn();
const address = "0x1234567890123456789012345678901234567890" as const;

function createNotificationSettings() {
  return {
    recipient: {
      client_id: "",
      recipient_id: address.toLowerCase(),
      recipient_type: "wallet_address",
      channels: {},
      attributes: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    preferences: {
      client_id: "",
      recipient_id: address.toLowerCase(),
      preferences: {},
      created_at: null,
      updated_at: null,
    },
    eventTypes: [],
  };
}

function renderClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationPreferencesClient />
    </QueryClientProvider>
  );
}

describe("NotificationPreferencesClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", fetchMock);
    isSafeOffchainMessageTrackingEnabledMock.mockReturnValue(true);

    vi.mocked(useAccount).mockReturnValue({
      address,
      addresses: [address],
      chain: { id: 1 },
      chainId: 1,
      connector: undefined,
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
      isReconnecting: false,
      status: "connected",
    } as unknown as ReturnType<typeof useAccount>);
    vi.mocked(useModal).mockReturnValue({
      open: false,
      setOpen: setOpenMock,
      openAbout: vi.fn(),
      openOnboarding: vi.fn(),
      openProfile: vi.fn(),
      openSwitchNetworks: vi.fn(),
      openSIWE: vi.fn(),
    } as unknown as ReturnType<typeof useModal>);
    vi.mocked(useSIWE).mockReturnValue({
      signIn: signInMock,
      signOut: signOutMock,
    } as ReturnType<typeof useSIWE>);
    vi.mocked(useOpenDialog).mockReturnValue(openDialogMock);
    vi.mocked(usePushNotifications).mockReturnValue({
      isSubscribed: false,
      isSupported: true,
      permission: "default",
      subscription: null,
      loading: false,
      error: null,
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    });
    vi.mocked(useHasPermission).mockReturnValue({
      hasPermission: false,
      isLoading: false,
      permissions: [],
    });
    vi.mocked(getStoredSiweJwt).mockReturnValue(null);
    vi.mocked(waitForStoredSiweJwt).mockResolvedValue(null);
    vi.mocked(clearStoredSiweSession).mockImplementation(() => {});
    vi.mocked(isSafeWallet).mockResolvedValue(false);
    signInMock.mockResolvedValue(undefined);
    signOutMock.mockResolvedValue(true);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => createNotificationSettings(),
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("opens the Safe auth dialog for Safe wallets instead of direct SIWE sign-in", async () => {
    vi.mocked(isSafeWallet).mockResolvedValue(true);

    renderClient();

    await waitFor(() =>
      expect(openDialogMock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "SAFE_OFFCHAIN_SIGNING",
          params: expect.objectContaining({
            safeAddress: address,
            purpose: "notification_preferences",
            signingKind: "siwe",
          }),
        })
      )
    );

    expect(signInMock).not.toHaveBeenCalled();
  });

  it("keeps the direct SIWE flow for EOAs", async () => {
    renderClient();

    await waitFor(() => expect(signInMock).toHaveBeenCalledTimes(1));
    expect(openDialogMock).not.toHaveBeenCalled();
  });

  it("skips auth prompts when a valid SIWE JWT already exists", async () => {
    vi.mocked(getStoredSiweJwt).mockReturnValue("jwt-token");

    renderClient();

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/v1/notification-preferences",
        expect.objectContaining({
          headers: expect.any(Headers),
        })
      )
    );

    expect(signInMock).not.toHaveBeenCalled();
    expect(openDialogMock).not.toHaveBeenCalled();
  });

  it("shows a retry action after the Safe flow is dismissed", async () => {
    vi.mocked(isSafeWallet).mockResolvedValue(true);

    renderClient();

    await waitFor(() => expect(openDialogMock).toHaveBeenCalledTimes(1));

    const dialogConfig = openDialogMock.mock.calls[0][0];
    await act(async () => {
      dialogConfig.params.onClosed("failed");
    });

    expect(
      screen.getByText("Safe sign-in was cancelled or failed.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry sign-in" }));

    await waitFor(() => expect(openDialogMock).toHaveBeenCalledTimes(2));
  });
});
