type WalletConnectionStatus =
  | "connected"
  | "connecting"
  | "disconnected"
  | "reconnecting";

type WalletConnectorLike = {
  getAccounts?: unknown;
  getChainId?: unknown;
};

export function getWalletTransactionReadinessError({
  connector,
  status,
}: {
  connector?: WalletConnectorLike;
  status: WalletConnectionStatus;
}) {
  if (status === "reconnecting") {
    return new Error(
      "Wallet connection is still reconnecting. Please try again in a moment."
    );
  }

  if (status !== "connected" || !connector) {
    return new Error("Connect your wallet before submitting this transaction.");
  }

  if (
    typeof connector.getAccounts !== "function" ||
    typeof connector.getChainId !== "function"
  ) {
    return new Error(
      "Wallet connection is still initializing. Please try again in a moment."
    );
  }

  return null;
}
