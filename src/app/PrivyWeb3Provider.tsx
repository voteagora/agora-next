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
import { type Chain } from "viem";
import { mainnet } from "wagmi/chains";
import {
  PrivyProvider,
  usePrivy,
  useLogin,
  useLogout,
  useModalStatus,
  useWallets,
  type PrivyClientConfig,
} from "@privy-io/react-auth";
import {
  WagmiProvider,
  createConfig,
  useSetActiveWallet,
} from "@privy-io/wagmi";
import { useAccount, useDisconnect } from "wagmi";
import { SIWEProvider } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { hashFn } from "@wagmi/core/query";
import toast, { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { inter } from "@/styles/fonts";
import Footer from "@/components/Footer";
import { PageContainer } from "@/components/Layout/PageContainer";
import AgoraProvider from "@/contexts/AgoraContext";
import ConnectButtonProvider from "@/contexts/ConnectButtonContext";
import { MiradorProvider } from "@/components/providers/MiradorProvider";
import { ConnectModalContext } from "@/components/providers/ConnectModalContext";
import { siweProviderConfig } from "@/components/shared/SiweProviderConfig";
import { shouldEnableMiradorWebClient } from "@/lib/mirador/config";
import Tenant from "@/lib/tenant/tenant";
import { getTransportForChain, toNumericChainId } from "@/lib/utils";
import type { UIPrivyConfig } from "@/lib/tenant/tenantUI";

const queryClient = new QueryClient({
  defaultOptions: { queries: { queryKeyHashFn: hashFn } },
});

const { contracts, ui } = Tenant.current();
const shouldHideAgoraBranding = ui.hideAgoraBranding;
const tokenChainId = toNumericChainId(contracts.token.chain.id);
const normalizedTokenChain = {
  ...contracts.token.chain,
  id: tokenChainId,
} as Chain;

const wagmiConfig = createConfig({
  chains: [normalizedTokenChain, mainnet],
  transports: {
    [mainnet.id]: getTransportForChain(mainnet.id)!,
    [tokenChainId]: getTransportForChain(tokenChainId)!,
  },
  ssr: true,
  // don't auto-discover injected wallets (e.g. Rabby) so Privy leads with the
  // email/social flow instead of jumping straight into the extension
  multiInjectedProviderDiscovery: false,
});

function PrivyConnectModalBridge({ children }: PropsWithChildren) {
  const { authenticated, ready } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { isOpen } = useModalStatus();
  const [authing, setAuthing] = useState(false);
  const [syncTimedOut, setSyncTimedOut] = useState(false);
  const activatedAddressRef = useRef<string | null>(null);

  const { login } = useLogin({
    onComplete: () => setAuthing(false),
    onError: (error) => {
      setAuthing(false);
      // Privy fires onError when the user closes the modal — not a real failure
      if (!String(error).includes("exited")) {
        toast.error("Couldn't sign in. Please try again.");
      }
    },
  });
  const { logout } = useLogout({
    onSuccess: () => toast.success("Signed out"),
  });

  const connectActiveWallet = useCallback(() => {
    const wallet =
      wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
    if (!wallet) return;
    void setActiveWallet(wallet).catch(() => {});
  }, [wallets, setActiveWallet]);

  // Privy auth state and the wagmi connector are separate: once the user is
  // authenticated, connect their wallet to wagmi so useAccount() reports it.
  useEffect(() => {
    if (!ready || !authenticated) {
      activatedAddressRef.current = null;
      return;
    }
    const wallet =
      wallets.find((w) => w.walletClientType === "privy") ?? wallets[0];
    if (wallet && activatedAddressRef.current !== wallet.address) {
      activatedAddressRef.current = wallet.address;
      void setActiveWallet(wallet).catch(() => {});
    }
  }, [ready, authenticated, wallets, setActiveWallet]);

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
      if (authing) return;
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
      setOpen: (shouldOpen: boolean) => {
        if (shouldOpen) open();
      },
      open: isOpen,
      // logout() ends the Privy session; disconnect() drops the wagmi connector
      // so it doesn't linger as "connected" until a page reload
      disconnect: () => {
        wagmiDisconnect();
        void logout();
      },
      isConnecting: authing || (authenticated && !isConnected && !syncTimedOut),
    };
  }, [
    authing,
    authenticated,
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
                  <ConnectButtonProvider>
                    <PageContainer>
                      <Toaster />
                      <AgoraProvider>{children}</AgoraProvider>
                    </PageContainer>
                  </ConnectButtonProvider>
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
