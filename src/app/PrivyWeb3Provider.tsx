"use client";

import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { mainnet } from "wagmi/chains";
import {
  PrivyProvider,
  useConnectWallet,
  useCreateWallet,
  usePrivy,
  useLogin,
  useLogout,
  useModalStatus,
  useWallets,
  type PrivyClientConfig,
  type User,
} from "@privy-io/react-auth";
import {
  WagmiProvider,
  createConfig,
  useSetActiveWallet,
} from "@privy-io/wagmi";
import { useAccount, useConfig, useDisconnect } from "wagmi";
import { SIWEProvider } from "connectkit";
import { QueryClientProvider } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { inter } from "@/styles/fonts";
import Footer from "@/components/Footer";
import { MiradorProvider } from "@/components/providers/MiradorProvider";
import { ConnectModalContext } from "@/components/providers/ConnectModalContext";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import { shouldEnableMiradorWebClient } from "@/lib/mirador/config";
import {
  flushPrivyDebugLog,
  privyDebugLog,
  probeWagmiConnectorsForAddress,
  redactHref,
  serializeError,
  snapshotPrivyStorage,
  summarizePrivyUser,
  summarizePrivyWallet,
  summarizeWagmiConfig,
} from "@/lib/privyDebug";
import type { UIPrivyConfig } from "@/lib/tenant/tenantUI";
import {
  AgoraAppShell,
  normalizedTokenChain,
  queryClient,
  sharedTransports,
  shouldHideAgoraBranding,
} from "./web3ProviderShared";

const wagmiConfig = createConfig({
  chains: [normalizedTokenChain, mainnet],
  transports: sharedTransports,
  ssr: true,
  // don't auto-discover injected wallets (e.g. Rabby) so Privy leads with the
  // email/social flow instead of jumping straight into the extension
  multiInjectedProviderDiscovery: false,
});

// While authenticated-but-not-connected, snapshot everything on an interval so
// the logs show exactly what wagmi/Privy see while the spinner is stuck.
const SYNC_POLL_INTERVAL_MS = 1_000;
const SYNC_POLL_MAX = 45;

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

// Privy's `createOnLogin: "users-without-wallets"` skips embedded-wallet
// creation when the user has *any* Ethereum wallet linked, including an
// external one linked in an earlier session. A user who once signed in with
// Rabby/MetaMask and now signs in with email/Google therefore has no embedded
// wallet and no connected external wallet, so useWallets() stays empty. Only a
// linked *embedded* wallet means "wait for it to sync".
function hasEmbeddedWallet(user: User | null) {
  return (
    user?.linkedAccounts.some(
      (account) =>
        account.type === "wallet" &&
        (account.chainType ?? "ethereum") === "ethereum" &&
        isEmbeddedPrivyWalletClient(account.walletClientType)
    ) ?? false
  );
}

function PrivyConnectModalBridge({ children }: PropsWithChildren) {
  const { authenticated, ready, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const wagmi = useConfig();
  const account = useAccount();
  const { isConnected } = account;
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { isOpen } = useModalStatus();
  const [authing, setAuthing] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [syncTimedOut, setSyncTimedOut] = useState(false);
  const activatedAddressRef = useRef<string | null>(null);
  // Privy user id we've already auto-created an embedded wallet for, so a
  // failure doesn't loop; the Connect button can still retry manually.
  const autoCreatedForUserRef = useRef<string | null>(null);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const { login } = useLogin({
    onComplete: (params) => {
      privyDebugLog("useLogin.onComplete", {
        isNewUser: params.isNewUser,
        wasAlreadyAuthenticated: params.wasAlreadyAuthenticated,
        loginMethod: params.loginMethod,
        loginAccount: params.loginAccount
          ? {
              type: (params.loginAccount as any).type,
              address: (params.loginAccount as any).address,
              walletClientType: (params.loginAccount as any).walletClientType,
            }
          : null,
        user: summarizePrivyUser(params.user),
        wagmi: summarizeWagmiConfig(wagmi),
        wallets: wallets.map(summarizePrivyWallet),
        walletsReady,
        storage: snapshotPrivyStorage(),
      });
      setAuthing(false);
    },
    onError: (error) => {
      privyDebugLog("useLogin.onError", {
        error: serializeError(error),
        suppressed: shouldSuppressPrivyError(error),
      });
      setAuthing(false);
      // Privy fires onError when the user closes the modal — not a real failure
      if (!shouldSuppressPrivyError(error)) {
        toast.error("Couldn't sign in. Please try again.");
      }
    },
  });
  const { logout } = useLogout({
    onSuccess: () => {
      privyDebugLog("useLogout.onSuccess", {
        wagmi: summarizeWagmiConfig(wagmi),
        storage: snapshotPrivyStorage(),
      });
      toast.success("Signed out");
    },
  });
  const { createWallet } = useCreateWallet({
    onSuccess: ({ wallet }) => {
      privyDebugLog("useCreateWallet.onSuccess", {
        wallet: summarizePrivyWallet(wallet),
      });
    },
    onError: (error) => {
      privyDebugLog("useCreateWallet.onError", {
        error: serializeError(error),
      });
    },
  });
  useConnectWallet({
    onSuccess: ({ wallet }) => {
      privyDebugLog("useConnectWallet.onSuccess", {
        wallet: summarizePrivyWallet(wallet),
        wagmi: summarizeWagmiConfig(wagmi),
      });
    },
    onError: (error) => {
      privyDebugLog("useConnectWallet.onError", {
        error: serializeError(error),
      });
    },
  });
  const linkedWalletExists = hasLinkedWallet(user);
  const embeddedWalletExists = hasEmbeddedWallet(user);

  // ---- diagnostics: mount / environment -------------------------------------
  useEffect(() => {
    privyDebugLog("bridge_mount", {
      href: redactHref(window.location.href),
      referrer: document.referrer ? redactHref(document.referrer) : "",
      userAgent: navigator.userAgent,
      visibility: document.visibilityState,
      inIframe: window.parent !== window,
      storage: snapshotPrivyStorage(),
      wagmi: summarizeWagmiConfig(wagmi),
      privy: { ready, authenticated, user: summarizePrivyUser(user) },
      wallets: { ready: walletsReady, list: wallets.map(summarizePrivyWallet) },
    });
    return () => {
      privyDebugLog("bridge_unmount");
      flushPrivyDebugLog(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- diagnostics: Privy auth state ----------------------------------------
  useEffect(() => {
    privyDebugLog("privy_auth_state", {
      ready,
      authenticated,
      user: summarizePrivyUser(user),
      linkedWalletExists,
      render: renderCountRef.current,
    });
  }, [ready, authenticated, user, linkedWalletExists]);

  // ---- diagnostics: Privy wallets -------------------------------------------
  useEffect(() => {
    privyDebugLog("privy_wallets", {
      walletsReady,
      count: wallets.length,
      wallets: wallets.map(summarizePrivyWallet),
      wagmiConnectors: summarizeWagmiConfig(wagmi)?.connectors,
    });
  }, [wallets, walletsReady, wagmi]);

  // ---- diagnostics: wagmi account -------------------------------------------
  useEffect(() => {
    privyDebugLog("wagmi_account", {
      status: account.status,
      isConnected: account.isConnected,
      isConnecting: account.isConnecting,
      isReconnecting: account.isReconnecting,
      isDisconnected: account.isDisconnected,
      address: account.address,
      addresses: account.addresses,
      chainId: account.chainId,
      connector: account.connector
        ? { id: account.connector.id, name: account.connector.name }
        : null,
    });
  }, [
    account.status,
    account.isConnected,
    account.isConnecting,
    account.isReconnecting,
    account.isDisconnected,
    account.address,
    account.addresses,
    account.chainId,
    account.connector,
  ]);

  // ---- diagnostics: wagmi store + connector registry changes ----------------
  useEffect(() => {
    const unsubscribeState = wagmi.subscribe(
      (state) => ({
        status: state.status,
        current: state.current,
        chainId: state.chainId,
        connections: state.connections.size,
      }),
      (next, prev) => {
        privyDebugLog("wagmi_state_change", {
          prev,
          next,
          wagmi: summarizeWagmiConfig(wagmi),
        });
      },
      { equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b) }
    );
    let unsubscribeConnectors: (() => void) | undefined;
    try {
      unsubscribeConnectors = (wagmi as any)._internal?.connectors?.subscribe?.(
        (connectors: any[]) => {
          privyDebugLog("wagmi_connectors_change", {
            connectors: connectors.map((c) => ({
              id: c.id,
              uid: c.uid,
              name: c.name,
              type: c.type,
            })),
          });
        }
      );
    } catch (error) {
      privyDebugLog("wagmi_connectors_subscribe_failed", {
        error: serializeError(error),
      });
    }
    return () => {
      unsubscribeState();
      unsubscribeConnectors?.();
    };
  }, [wagmi]);

  // ---- diagnostics: Privy modal ---------------------------------------------
  useEffect(() => {
    privyDebugLog("privy_modal", { isOpen, authing, creatingWallet });
  }, [isOpen, authing, creatingWallet]);

  const getPreferredWallet = useCallback(
    () =>
      wallets.find((w) => isEmbeddedPrivyWalletClient(w.walletClientType)) ??
      wallets[0],
    [wallets]
  );

  const activateWallet = useCallback(
    async (wallet: (typeof wallets)[number], reason: string) => {
      const started = performance.now();
      const before = summarizeWagmiConfig(wagmi);
      privyDebugLog("activateWallet.start", {
        reason,
        wallet: summarizePrivyWallet(wallet),
        wagmi: before,
        expectedConnectorId: isEmbeddedPrivyWalletClient(
          wallet.walletClientType
        )
          ? `${wallet.meta?.id}.${wallet.address}`
          : wallet.meta?.id,
        connectorProbe: await probeWagmiConnectorsForAddress(
          wagmi,
          wallet.address
        ),
      });
      try {
        await setActiveWallet(wallet);
        privyDebugLog("activateWallet.resolved", {
          reason,
          ms: Math.round(performance.now() - started),
          wagmi: summarizeWagmiConfig(wagmi),
          storage: snapshotPrivyStorage(),
        });
      } catch (error) {
        activatedAddressRef.current = null;
        privyDebugLog("activateWallet.error", {
          reason,
          ms: Math.round(performance.now() - started),
          error: serializeError(error),
          wagmi: summarizeWagmiConfig(wagmi),
        });
        console.error("Failed to connect Privy wallet", error);
        toast.error("Couldn't connect your wallet. Please try again.");
      }
    },
    [setActiveWallet, wagmi]
  );

  const createMissingWallet = useCallback(() => {
    privyDebugLog("createMissingWallet", { creatingWallet });
    if (creatingWallet) return;
    setCreatingWallet(true);
    void createWallet()
      .then((wallet) => {
        privyDebugLog("createMissingWallet.resolved", {
          wallet: summarizePrivyWallet(wallet),
        });
      })
      .catch((error) => {
        privyDebugLog("createMissingWallet.error", {
          error: serializeError(error),
        });
        console.error("Failed to create Privy wallet", error);
        if (!shouldSuppressPrivyError(error)) {
          toast.error("Couldn't create your wallet. Please try again.");
        }
      })
      .finally(() => setCreatingWallet(false));
  }, [createWallet, creatingWallet]);

  const connectActiveWallet = useCallback(() => {
    const wallet = getPreferredWallet();
    privyDebugLog("connectActiveWallet", {
      wallet: summarizePrivyWallet(wallet),
      walletsReady,
      linkedWalletExists,
      embeddedWalletExists,
      wallets: wallets.map(summarizePrivyWallet),
    });
    if (!wallet) {
      if (!walletsReady) {
        privyDebugLog("connectActiveWallet.branch", {
          branch: "wallets_not_ready",
        });
        toast.error("Your wallet is still loading. Please try again shortly.");
        return;
      }
      if (embeddedWalletExists) {
        // the embedded wallet exists but its iframe/provider hasn't surfaced it
        privyDebugLog("connectActiveWallet.branch", {
          branch: "embedded_wallet_missing_from_useWallets",
        });
        toast.error(
          "Your wallet connection is still syncing. Please refresh and try again."
        );
        return;
      }
      // no embedded wallet (Privy skipped creation because an external wallet
      // is linked) and no external wallet connected: create the embedded one
      privyDebugLog("connectActiveWallet.branch", {
        branch: "create_wallet",
        linkedWalletExists,
      });
      createMissingWallet();
      return;
    }
    privyDebugLog("connectActiveWallet.branch", { branch: "activate" });
    void activateWallet(wallet, "manual_click");
  }, [
    activateWallet,
    createMissingWallet,
    getPreferredWallet,
    linkedWalletExists,
    embeddedWalletExists,
    walletsReady,
    wallets,
  ]);

  // Privy auth state and the wagmi connector are separate: once the user is
  // authenticated, connect their wallet to wagmi so useAccount() reports it.
  useEffect(() => {
    if (!ready || !authenticated) {
      privyDebugLog("sync_effect", {
        branch: "not_ready_or_not_authenticated",
        ready,
        authenticated,
        previouslyActivated: activatedAddressRef.current,
      });
      activatedAddressRef.current = null;
      return;
    }
    const wallet = getPreferredWallet();
    privyDebugLog("sync_effect", {
      branch: wallet
        ? activatedAddressRef.current !== wallet.address
          ? "activate"
          : "already_activated_same_address"
        : "no_wallet_yet",
      walletsReady,
      wallet: summarizePrivyWallet(wallet),
      previouslyActivated: activatedAddressRef.current,
      isConnected,
      wagmi: summarizeWagmiConfig(wagmi),
    });
    if (wallet && activatedAddressRef.current !== wallet.address) {
      activatedAddressRef.current = wallet.address;
      void activateWallet(wallet, "sync_effect");
    }
  }, [
    ready,
    authenticated,
    getPreferredWallet,
    activateWallet,
    walletsReady,
    isConnected,
    wagmi,
  ]);

  // Email/social users whose account has an external wallet linked from an
  // earlier session get no embedded wallet from Privy (see hasEmbeddedWallet)
  // and have nothing for wagmi to connect. Create the embedded wallet once so
  // the sync effect above can attach it.
  useEffect(() => {
    if (!ready || !authenticated || !walletsReady || !user) return;
    if (wallets.length > 0 || embeddedWalletExists || creatingWallet) return;
    if (autoCreatedForUserRef.current === user.id) return;
    autoCreatedForUserRef.current = user.id;
    privyDebugLog("auto_create_wallet", {
      userId: user.id,
      linkedWalletExists,
      user: summarizePrivyUser(user),
    });
    createMissingWallet();
  }, [
    ready,
    authenticated,
    walletsReady,
    user,
    wallets.length,
    embeddedWalletExists,
    creatingWallet,
    linkedWalletExists,
    createMissingWallet,
  ]);

  // ---- diagnostics: poll while stuck ----------------------------------------
  useEffect(() => {
    if (!authenticated || isConnected) return;
    let tick = 0;
    const wallet = getPreferredWallet();
    const timer = setInterval(() => {
      tick += 1;
      if (tick > SYNC_POLL_MAX) {
        clearInterval(timer);
        return;
      }
      void (async () => {
        privyDebugLog("sync_poll", {
          tick,
          ready,
          walletsReady,
          walletCount: wallets.length,
          wallet: summarizePrivyWallet(wallet),
          wagmi: summarizeWagmiConfig(wagmi),
          connectorProbe: wallet
            ? await probeWagmiConnectorsForAddress(wagmi, wallet.address)
            : null,
          storage: snapshotPrivyStorage(),
          walletIsConnected: wallet
            ? await wallet.isConnected().catch((e) => serializeError(e))
            : null,
          authing,
          creatingWallet,
          syncTimedOut,
        });
      })();
    }, SYNC_POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [
    authenticated,
    isConnected,
    ready,
    walletsReady,
    wallets,
    getPreferredWallet,
    wagmi,
    authing,
    creatingWallet,
    syncTimedOut,
  ]);

  // Fallback: if the embedded wallet never syncs to wagmi (authenticated but
  // isConnected stays false), stop the connecting spinner after a generous
  // window so the user isn't trapped — the Connect button then retries the sync.
  useEffect(() => {
    if (!authenticated || isConnected) {
      setSyncTimedOut(false);
      return;
    }
    privyDebugLog("sync_timeout.scheduled", { ms: 30_000 });
    // 30s is deliberately generous; a normal sync is sub-second
    const timer = setTimeout(() => {
      privyDebugLog("sync_timeout.fired", {
        wagmi: summarizeWagmiConfig(wagmi),
        storage: snapshotPrivyStorage(),
      });
      setSyncTimedOut(true);
    }, 30_000);
    return () => clearTimeout(timer);
  }, [authenticated, isConnected, wagmi]);

  const isConnecting =
    authing ||
    creatingWallet ||
    (authenticated && !isConnected && !syncTimedOut);

  useEffect(() => {
    privyDebugLog("isConnecting_change", {
      isConnecting,
      authing,
      creatingWallet,
      authenticated,
      isConnected,
      syncTimedOut,
    });
  }, [
    isConnecting,
    authing,
    creatingWallet,
    authenticated,
    isConnected,
    syncTimedOut,
  ]);

  const value = useMemo(() => {
    const open = () => {
      privyDebugLog("openConnectModal.click", {
        authing,
        creatingWallet,
        authenticated,
        isConnected,
        ready,
        walletsReady,
        walletCount: wallets.length,
        wagmi: summarizeWagmiConfig(wagmi),
        storage: snapshotPrivyStorage(),
      });
      if (authing || creatingWallet) return;
      if (!authenticated) {
        setAuthing(true);
        privyDebugLog("login.call");
        flushPrivyDebugLog(true);
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
        privyDebugLog("disconnect.click", {
          wagmi: summarizeWagmiConfig(wagmi),
          storage: snapshotPrivyStorage(),
        });
        wagmiDisconnect();
        void logout();
      },
      isConnecting,
    };
  }, [
    authing,
    authenticated,
    creatingWallet,
    isConnected,
    isConnecting,
    login,
    logout,
    wagmiDisconnect,
    connectActiveWallet,
    isOpen,
    ready,
    walletsReady,
    wallets.length,
    wagmi,
  ]);

  return (
    <ConnectModalContext.Provider value={value}>
      {children}
    </ConnectModalContext.Provider>
  );
}

const PrivyWeb3Provider: FC<
  PropsWithChildren<{
    privyConfig: UIPrivyConfig;
    miradorWebApiKey?: string;
  }>
> = ({ children, privyConfig, miradorWebApiKey }) => {
  const config: PrivyClientConfig = {
    loginMethods:
      (privyConfig.loginMethods as PrivyClientConfig["loginMethods"]) ?? [
        "email",
        "wallet",
      ],
    appearance: {
      theme: "light",
      accentColor: "#FF0D05",
      showWalletLoginFirst: false,
    },
    embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
    defaultChain: normalizedTokenChain,
    supportedChains: [normalizedTokenChain, mainnet],
  };

  useEffect(() => {
    privyDebugLog("provider_mount", {
      appIdPrefix: privyConfig.appId?.slice(0, 8),
      appIdLength: privyConfig.appId?.length ?? 0,
      loginMethods: config.loginMethods,
      embeddedWallets: config.embeddedWallets,
      defaultChainId: normalizedTokenChain.id,
      supportedChainIds: [normalizedTokenChain.id, mainnet.id],
      wagmiChainIds: wagmiConfig.chains.map((chain) => chain.id),
      wagmiConnectorsAtMount: wagmiConfig.connectors.map((c) => c.id),
      siweEnabled: siweProviderConfig.enabled,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // body must wrap PrivyProvider: Privy injects a hidden auth <iframe>/<img> at
  // the provider root, which is invalid HTML as a direct child of <html>.
  return (
    <body className={inter.variable}>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <PrivyProvider appId={privyConfig.appId} config={config}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <MiradorProvider
              apiKey={miradorWebApiKey}
              enabled={shouldEnableMiradorWebClient()}
            >
              <SIWEProvider
                {...siweProviderConfig}
                enabled={siweProviderConfig.enabled}
              >
                <PrivyConnectModalBridge>
                  <AgoraAppShell>{children}</AgoraAppShell>
                  {!shouldHideAgoraBranding && <Footer />}
                  <SpeedInsights />
                </PrivyConnectModalBridge>
              </SIWEProvider>
            </MiradorProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </body>
  );
};

export default PrivyWeb3Provider;
