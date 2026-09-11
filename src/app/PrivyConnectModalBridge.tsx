"use client";

import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useCreateWallet,
  usePrivy,
  useLogin,
  useLogout,
  useModalStatus,
  useWallets,
  type User,
} from "@privy-io/react-auth";
import {
  ConnectorAlreadyConnectedError,
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
  type Config,
  type Connector,
} from "wagmi";
import toast from "react-hot-toast";
import { ConnectModalContext } from "@/components/providers/ConnectModalContext";

function shouldSuppressPrivyError(error: unknown) {
  return String(error).includes("exited");
}

function isEmbeddedPrivyWalletClient(walletClientType?: string) {
  return walletClientType === "privy" || walletClientType === "privy-v2";
}

function hasLinkedWallet(user: User | null) {
  return (
    user?.linkedAccounts.some((account) => account.type === "wallet") ?? false
  );
}

type PrivyWallet = ReturnType<typeof useWallets>["wallets"][number];

// How long we keep trying to attach the Privy wallet to wagmi before giving
// the user back a Connect button. Deliberately generous; a normal sync is
// sub-second.
export const PRIVY_WALLET_SYNC_TIMEOUT_MS = 30_000;
// Interval between sync attempts while waiting for @privy-io/wagmi to
// register the wallet's connector.
export const PRIVY_WALLET_SYNC_RETRY_MS = 500;

/**
 * @privy-io/wagmi registers one wagmi connector per Privy wallet, but it does
 * so asynchronously (it has to await the wallet's EIP-1193 provider first).
 * Look the connector up by the accounts it reports rather than by id so we
 * don't depend on Privy's private connector-id scheme.
 */
export async function findWagmiConnectorForWallet(
  config: Pick<Config, "connectors">,
  address: string
): Promise<Connector | null> {
  const target = address.toLowerCase();
  for (const connector of config.connectors) {
    const accounts = await connector.getAccounts().catch(() => []);
    if (accounts.some((account) => account.toLowerCase() === target)) {
      return connector;
    }
  }
  return null;
}

export function PrivyConnectModalBridge({ children }: PropsWithChildren) {
  const { authenticated, ready, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const wagmi = useConfig();
  const { connectAsync } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { isOpen } = useModalStatus();
  const [authing, setAuthing] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [syncTimedOut, setSyncTimedOut] = useState(false);
  const connectInFlightRef = useRef(false);

  const { login } = useLogin({
    onComplete: () => setAuthing(false),
    onError: (error) => {
      setAuthing(false);
      // Privy fires onError when the user closes the modal — not a real failure
      if (!shouldSuppressPrivyError(error)) {
        toast.error("Couldn't sign in. Please try again.");
      }
    },
  });
  const { logout } = useLogout({
    onSuccess: () => toast.success("Signed out"),
  });
  const { createWallet } = useCreateWallet();
  const linkedWalletExists = hasLinkedWallet(user);

  const getPreferredWallet = useCallback(
    () =>
      wallets.find((w) => isEmbeddedPrivyWalletClient(w.walletClientType)) ??
      wallets[0],
    [wallets]
  );

  /**
   * Attach a Privy wallet to wagmi. Resolves to:
   *  - "connected": wagmi now reports the wallet
   *  - "pending": @privy-io/wagmi hasn't registered a connector for it yet
   *  - "error": the connector exists but connecting failed
   */
  const activateWallet = useCallback(
    async (wallet: PrivyWallet): Promise<"connected" | "pending" | "error"> => {
      if (connectInFlightRef.current) return "pending";
      connectInFlightRef.current = true;
      try {
        const connector = await findWagmiConnectorForWallet(
          wagmi,
          wallet.address
        );
        if (!connector) return "pending";
        // wagmi's injected connector refuses to auto-reconnect after an explicit
        // disconnect (shimDisconnect); clear that flag since the user asked for
        // this connection.
        await wagmi.storage?.removeItem(`${connector.id}.disconnected`);
        try {
          await connectAsync({ connector });
        } catch (error) {
          if (!(error instanceof ConnectorAlreadyConnectedError)) throw error;
        }
        return "connected";
      } catch (error) {
        console.error("Failed to connect Privy wallet", error);
        return "error";
      } finally {
        connectInFlightRef.current = false;
      }
    },
    [wagmi, connectAsync]
  );

  const createMissingWallet = useCallback(() => {
    if (creatingWallet) return;
    setCreatingWallet(true);
    void createWallet()
      .catch((error) => {
        console.error("Failed to create Privy wallet", error);
        if (!shouldSuppressPrivyError(error)) {
          toast.error("Couldn't create your wallet. Please try again.");
        }
      })
      .finally(() => setCreatingWallet(false));
  }, [createWallet, creatingWallet]);

  const connectActiveWallet = useCallback(() => {
    const wallet = getPreferredWallet();
    if (!wallet) {
      if (!walletsReady) {
        toast.error("Your wallet is still loading. Please try again shortly.");
        return;
      }
      if (linkedWalletExists) {
        toast.error(
          "Your wallet connection is still syncing. Please refresh and try again."
        );
        return;
      }
      createMissingWallet();
      return;
    }
    setSyncTimedOut(false);
    void activateWallet(wallet).then((result) => {
      if (result === "pending") {
        toast.error(
          "Your wallet connection is still syncing. Please refresh and try again."
        );
      } else if (result === "error") {
        toast.error("Couldn't connect your wallet. Please try again.");
      }
    });
  }, [
    activateWallet,
    createMissingWallet,
    getPreferredWallet,
    linkedWalletExists,
    walletsReady,
  ]);

  // Privy auth state and the wagmi connector are separate: once the user is
  // authenticated, connect their wallet to wagmi so useAccount() reports it.
  //
  // This has to retry. @privy-io/wagmi registers the wallet's connector from an
  // effect in a parent component (so it runs *after* ours) and only after
  // awaiting the wallet's provider, and its own auto-reconnect is best-effort
  // (it bails if a previously used connector was explicitly disconnected, and
  // wagmi's reconnect() drops calls that overlap an in-flight one). Email and
  // social logins hit that gap on every fresh login; external wallets usually
  // don't because their connector already exists before login completes.
  useEffect(() => {
    if (!ready || !authenticated || !walletsReady || isConnected) return;
    if (syncTimedOut) return;
    const wallet = getPreferredWallet();
    if (!wallet) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const attempt = async () => {
      const result = await activateWallet(wallet);
      if (cancelled || result === "connected") return;
      timer = setTimeout(attempt, PRIVY_WALLET_SYNC_RETRY_MS);
    };
    void attempt();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [
    ready,
    authenticated,
    walletsReady,
    isConnected,
    syncTimedOut,
    getPreferredWallet,
    activateWallet,
  ]);

  // Fallback: if the wallet never syncs to wagmi (authenticated but
  // isConnected stays false), stop the connecting spinner after a generous
  // window so the user isn't trapped — the Connect button then retries the sync.
  useEffect(() => {
    if (!authenticated || isConnected) {
      setSyncTimedOut(false);
      return;
    }
    const timer = setTimeout(
      () => setSyncTimedOut(true),
      PRIVY_WALLET_SYNC_TIMEOUT_MS
    );
    return () => clearTimeout(timer);
  }, [authenticated, isConnected]);

  const value = useMemo(() => {
    const open = () => {
      if (authing || creatingWallet) return;
      if (!authenticated) {
        setAuthing(true);
        login();
        return;
      }
      // authenticated but wagmi shows disconnected: connect the Privy wallet
      connectActiveWallet();
    };
    return {
      openConnectModal: open,
      isOpen,
      // logout() ends the Privy session; disconnect() drops the wagmi connector
      // so it doesn't linger as "connected" until a page reload
      disconnect: () => {
        wagmiDisconnect();
        void logout();
      },
      isConnecting:
        authing ||
        creatingWallet ||
        (authenticated && !isConnected && !syncTimedOut),
    };
  }, [
    authing,
    authenticated,
    creatingWallet,
    isConnected,
    syncTimedOut,
    login,
    logout,
    wagmiDisconnect,
    connectActiveWallet,
    isOpen,
  ]);

  return (
    <ConnectModalContext.Provider value={value}>
      {children}
    </ConnectModalContext.Provider>
  );
}
