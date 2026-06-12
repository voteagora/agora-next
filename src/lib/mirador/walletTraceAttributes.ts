import type { MiradorAttributeMap, MiradorAttributeValue } from "./types";

type WalletAccountStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "reconnecting";

type WalletTraceConnector = {
  id?: unknown;
  name?: unknown;
  type?: unknown;
  uid?: unknown;
  rdns?: unknown;
  connect?: unknown;
  disconnect?: unknown;
  getAccounts?: unknown;
  getChainId?: unknown;
  getClient?: unknown;
  getProvider?: unknown;
  isAuthorized?: unknown;
  switchChain?: unknown;
};

function isMethod(value: unknown) {
  return typeof value === "function";
}

function toAttributeValue(value: unknown): MiradorAttributeValue {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null ||
    value === undefined ||
    Array.isArray(value)
  ) {
    return value;
  }

  return String(value);
}

function getProviderFlag(providers: unknown[], flag: string) {
  return providers.some(
    (provider) => provider && typeof provider === "object" && flag in provider
  );
}

function getInjectedProviderAttributes(): MiradorAttributeMap {
  if (typeof window === "undefined") {
    return {};
  }

  const ethereum = (window as typeof window & { ethereum?: unknown }).ethereum;
  if (!ethereum || typeof ethereum !== "object") {
    return { "wallet.injected.exists": false };
  }

  const maybeProviders = (ethereum as { providers?: unknown }).providers;
  const providers = Array.isArray(maybeProviders) ? maybeProviders : [ethereum];

  return {
    "wallet.injected.exists": true,
    "wallet.injected.providerCount": providers.length,
    "wallet.injected.hasMetaMask": getProviderFlag(providers, "isMetaMask"),
    "wallet.injected.hasCoinbaseWallet": getProviderFlag(
      providers,
      "isCoinbaseWallet"
    ),
    "wallet.injected.hasRabby": getProviderFlag(providers, "isRabby"),
    "wallet.injected.hasTrust": getProviderFlag(providers, "isTrust"),
    "wallet.injected.hasFrame": getProviderFlag(providers, "isFrame"),
    "wallet.injected.hasPhantom": getProviderFlag(providers, "isPhantom"),
    "wallet.injected.hasOKXWallet": getProviderFlag(providers, "isOKXWallet"),
    "wallet.injected.hasBraveWallet": getProviderFlag(
      providers,
      "isBraveWallet"
    ),
  };
}

export function getWalletTraceAttributes({
  accountChainId,
  accountStatus,
  connector,
  targetChainId,
}: {
  accountChainId?: number;
  accountStatus?: WalletAccountStatus;
  connector?: WalletTraceConnector;
  targetChainId?: number | string;
}): MiradorAttributeMap {
  const hasGetAccounts = isMethod(connector?.getAccounts);
  const hasGetChainId = isMethod(connector?.getChainId);
  const hasGetProvider = isMethod(connector?.getProvider);

  return {
    "wallet.accountStatus": accountStatus,
    "wallet.connectedChainId": accountChainId,
    "wallet.targetChainId": targetChainId,
    "wallet.connector.id": toAttributeValue(connector?.id),
    "wallet.connector.name": toAttributeValue(connector?.name),
    "wallet.connector.type": toAttributeValue(connector?.type),
    "wallet.connector.uid": toAttributeValue(connector?.uid),
    "wallet.connector.rdns": toAttributeValue(connector?.rdns),
    "wallet.connector.hasConnect": isMethod(connector?.connect),
    "wallet.connector.hasDisconnect": isMethod(connector?.disconnect),
    "wallet.connector.hasGetAccounts": hasGetAccounts,
    "wallet.connector.hasGetChainId": hasGetChainId,
    "wallet.connector.hasGetClient": isMethod(connector?.getClient),
    "wallet.connector.hasGetProvider": hasGetProvider,
    "wallet.connector.hasIsAuthorized": isMethod(connector?.isAuthorized),
    "wallet.connector.hasSwitchChain": isMethod(connector?.switchChain),
    "wallet.connector.hasLiveMethods":
      hasGetAccounts && hasGetChainId && hasGetProvider,
    ...getInjectedProviderAttributes(),
  };
}
