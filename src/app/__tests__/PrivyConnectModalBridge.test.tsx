import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useCreateWallet,
  useLogin,
  useLogout,
  useModalStatus,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import {
  ConnectorAlreadyConnectedError,
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
} from "wagmi";
import toast from "react-hot-toast";
import { useConnectModal } from "@/components/providers/ConnectModalContext";
import {
  PRIVY_WALLET_SYNC_RETRY_MS,
  PrivyConnectModalBridge,
} from "../PrivyConnectModalBridge";

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: vi.fn(),
  useWallets: vi.fn(),
  useLogin: vi.fn(),
  useLogout: vi.fn(),
  useCreateWallet: vi.fn(),
  useModalStatus: vi.fn(),
}));

vi.mock("wagmi", () => ({
  ConnectorAlreadyConnectedError: class extends Error {},
  useAccount: vi.fn(),
  useConfig: vi.fn(),
  useConnect: vi.fn(),
  useDisconnect: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const ADDRESS = "0xAbC0000000000000000000000000000000000001";

function makeConnector(accounts: string[], id = `io.privy.wallet.${ADDRESS}`) {
  return {
    id,
    uid: `${id}-uid`,
    getAccounts: vi.fn(async () => accounts),
  };
}

function Probe() {
  const { isConnecting, openConnectModal } = useConnectModal();
  return (
    <button onClick={openConnectModal}>
      {isConnecting ? "connecting" : "idle"}
    </button>
  );
}

describe("PrivyConnectModalBridge", () => {
  const connectAsync = vi.fn();
  const removeItem = vi.fn(async () => {});
  const wagmiConfig: { connectors: unknown[]; storage: unknown } = {
    connectors: [],
    storage: { removeItem },
  };

  beforeEach(() => {
    vi.useFakeTimers();
    wagmiConfig.connectors = [];
    connectAsync.mockReset();
    removeItem.mockClear();
    vi.mocked(toast.error).mockClear();

    vi.mocked(usePrivy).mockReturnValue({
      authenticated: true,
      ready: true,
      user: { linkedAccounts: [{ type: "wallet" }] },
    } as never);
    vi.mocked(useWallets).mockReturnValue({
      ready: true,
      wallets: [
        {
          address: ADDRESS,
          walletClientType: "privy",
          meta: { id: "io.privy.wallet", name: "Privy" },
        },
      ],
    } as never);
    vi.mocked(useLogin).mockReturnValue({ login: vi.fn() } as never);
    vi.mocked(useLogout).mockReturnValue({ logout: vi.fn() } as never);
    vi.mocked(useCreateWallet).mockReturnValue({
      createWallet: vi.fn(),
    } as never);
    vi.mocked(useModalStatus).mockReturnValue({ isOpen: false } as never);
    vi.mocked(useAccount).mockReturnValue({ isConnected: false } as never);
    vi.mocked(useConfig).mockReturnValue(wagmiConfig as never);
    vi.mocked(useConnect).mockReturnValue({ connectAsync } as never);
    vi.mocked(useDisconnect).mockReturnValue({ disconnect: vi.fn() } as never);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("keeps retrying until @privy-io/wagmi registers the wallet's connector", async () => {
    connectAsync.mockResolvedValue({ accounts: [ADDRESS], chainId: 1 });

    render(
      <PrivyConnectModalBridge>
        <Probe />
      </PrivyConnectModalBridge>
    );

    // authenticated but not yet connected: spinner, and nothing to connect to
    expect(screen.getByRole("button")).toHaveTextContent("connecting");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRIVY_WALLET_SYNC_RETRY_MS);
    });
    expect(connectAsync).not.toHaveBeenCalled();

    // Privy registers the connector some time later (in a parent effect,
    // after awaiting the embedded wallet provider)
    const connector = makeConnector([ADDRESS]);
    wagmiConfig.connectors = [
      makeConnector(["0x" + "9".repeat(40)]),
      connector,
    ];
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRIVY_WALLET_SYNC_RETRY_MS);
    });

    expect(removeItem).toHaveBeenCalledWith(`${connector.id}.disconnected`);
    expect(connectAsync).toHaveBeenCalledTimes(1);
    expect(connectAsync).toHaveBeenCalledWith({ connector });

    // once wagmi reports the connection the spinner clears and retries stop
    vi.mocked(useAccount).mockReturnValue({ isConnected: true } as never);
    render(
      <PrivyConnectModalBridge>
        <Probe />
      </PrivyConnectModalBridge>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRIVY_WALLET_SYNC_RETRY_MS * 3);
    });
    expect(screen.getAllByRole("button").at(-1)).toHaveTextContent("idle");
    expect(connectAsync).toHaveBeenCalledTimes(1);
  });

  it("matches the connector case-insensitively and treats already-connected as success", async () => {
    const connector = makeConnector([ADDRESS.toLowerCase()]);
    wagmiConfig.connectors = [connector];
    connectAsync.mockRejectedValue(new ConnectorAlreadyConnectedError());

    render(
      <PrivyConnectModalBridge>
        <Probe />
      </PrivyConnectModalBridge>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRIVY_WALLET_SYNC_RETRY_MS * 3);
    });

    expect(connectAsync).toHaveBeenCalledTimes(1);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("retries after a failed connect attempt", async () => {
    const connector = makeConnector([ADDRESS]);
    wagmiConfig.connectors = [connector];
    connectAsync
      .mockRejectedValueOnce(new Error("provider not ready"))
      .mockResolvedValue({ accounts: [ADDRESS], chainId: 1 });
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <PrivyConnectModalBridge>
        <Probe />
      </PrivyConnectModalBridge>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRIVY_WALLET_SYNC_RETRY_MS * 2);
    });

    expect(connectAsync).toHaveBeenCalledTimes(2);
    // background retries never toast; only a manual click does
    expect(toast.error).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("does not try to connect before Privy is authenticated", async () => {
    vi.mocked(usePrivy).mockReturnValue({
      authenticated: false,
      ready: true,
      user: null,
    } as never);
    wagmiConfig.connectors = [makeConnector([ADDRESS])];

    render(
      <PrivyConnectModalBridge>
        <Probe />
      </PrivyConnectModalBridge>
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(PRIVY_WALLET_SYNC_RETRY_MS * 2);
    });

    expect(screen.getByRole("button")).toHaveTextContent("idle");
    expect(connectAsync).not.toHaveBeenCalled();
  });
});
