import type { EIP1193Provider } from "viem";

type ConnectorWithProvider = {
  getProvider?: () => unknown | Promise<unknown>;
};

type WindowEthereumProvider = EIP1193Provider & {
  providers?: unknown[];
};

function isEip1193Provider(value: unknown): value is EIP1193Provider {
  return (
    !!value &&
    typeof value === "object" &&
    "request" in value &&
    typeof (value as { request?: unknown }).request === "function"
  );
}

export async function getActiveWindowEthereumProvider(
  connector?: ConnectorWithProvider | null
): Promise<EIP1193Provider | null> {
  if (typeof window === "undefined" || !connector?.getProvider) {
    return null;
  }

  const ethereum = (
    window as typeof window & {
      ethereum?: WindowEthereumProvider;
    }
  ).ethereum;
  if (!isEip1193Provider(ethereum)) {
    return null;
  }

  let activeProvider: unknown;
  try {
    activeProvider = await connector.getProvider();
  } catch {
    return null;
  }

  if (activeProvider === ethereum) {
    return ethereum;
  }

  const providers = Array.isArray(ethereum.providers) ? ethereum.providers : [];
  return (
    providers.find(
      (provider): provider is EIP1193Provider =>
        provider === activeProvider && isEip1193Provider(provider)
    ) ?? null
  );
}
