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
import { useAccount, useDisconnect } from "wagmi";
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

function shouldSuppressPrivyError(error: unknown) {
  return String(error).includes("exited");
}

function isEmbeddedPrivyWalletClient(walletClientType?: string) {
  return walletClientType === "privy" || walletClientType === "privy-v2";
}

function hasEmbeddedPrivyWallet(user: User | null) {
  return (
    user?.linkedAccounts.some(
      (account) =>
        account.type === "wallet" &&
        isEmbeddedPrivyWalletClient(account.walletClientType)
    ) ?? false
  );
}

function PrivyConnectModalBridge({ children }: PropsWithChildren) {
  const { authenticated, ready, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { isOpen } = useModalStatus();
  const [authing, setAuthing] = useState(false);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [syncTimedOut, setSyncTimedOut] = useState(false);
  const activatedAddressRef = useRef<string | null>(null);

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
  const embeddedPrivyWalletExists = hasEmbeddedPrivyWallet(user);

  const getPreferredWallet = useCallback(
    () =>
      wallets.find((w) => isEmbeddedPrivyWalletClient(w.walletClientType)) ??
      wallets[0],
    [wallets]
  );

  const activateWallet = useCallback(
    async (wallet: (typeof wallets)[number]) => {
      try {
        await setActiveWallet(wallet);
      } catch (error) {
        activatedAddressRef.current = null;
        console.error("Failed to connect Privy wallet", error);
        toast.error("Couldn't connect your wallet. Please try again.");
      }
    },
    [setActiveWallet]
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
      if (embeddedPrivyWalletExists) {
        toast.error(
          "Your wallet is still syncing. Please refresh and try again."
        );
        return;
      }
      createMissingWallet();
      return;
    }
    void activateWallet(wallet);
  }, [
    activateWallet,
    createMissingWallet,
    embeddedPrivyWalletExists,
    getPreferredWallet,
    walletsReady,
  ]);

  // Privy auth state and the wagmi connector are separate: once the user is
  // authenticated, connect their wallet to wagmi so useAccount() reports it.
  useEffect(() => {
    if (!ready || !authenticated) {
      activatedAddressRef.current = null;
      return;
    }
    const wallet = getPreferredWallet();
    if (wallet && activatedAddressRef.current !== wallet.address) {
      activatedAddressRef.current = wallet.address;
      void activateWallet(wallet);
    }
  }, [ready, authenticated, getPreferredWallet, activateWallet]);

  // Fallback: if the embedded wallet never syncs to wagmi (authenticated but
  // isConnected stays false), stop the connecting spinner after a generous
  // window so the user isn't trapped — the Connect button then retries the sync.
  useEffect(() => {
    if (!authenticated || isConnected) {
      setSyncTimedOut(false);
      return;
    }
    // ponytail: 30s is deliberately generous; a normal sync is sub-second
    const timer = setTimeout(() => setSyncTimedOut(true), 30_000);
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
