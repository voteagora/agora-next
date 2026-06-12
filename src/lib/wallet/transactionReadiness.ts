import type { MutableRefObject } from "react";

import {
  closeFrontendMiradorFlowTrace,
  FrontendMiradorTrace,
} from "@/lib/mirador/frontendFlowTrace";

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

export function checkWalletReadinessOrCloseTrace({
  connector,
  status,
  trace,
  traceRef,
  proposalId,
  voteKind,
}: {
  connector?: WalletConnectorLike;
  status: WalletConnectionStatus;
  trace: FrontendMiradorTrace;
  traceRef: MutableRefObject<FrontendMiradorTrace | null>;
  proposalId: string;
  voteKind: string;
}): Error | null {
  const error = getWalletTransactionReadinessError({ connector, status });
  if (!error) return null;

  void closeFrontendMiradorFlowTrace(trace, {
    reason: "governance_vote_failed",
    eventName: "governance_vote_failed",
    details: { proposalId, voteKind, error: error.message },
  });
  if (traceRef.current === trace) {
    traceRef.current = null;
  }

  return error;
}
