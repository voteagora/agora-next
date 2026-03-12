"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";

import { UpdatedButton } from "@/components/Button";
import {
  discoverSafeTrackedTransaction,
  getSafeAppQueueUrl,
  type SafeTrackedTransactionSummary,
} from "@/lib/safeTrackedTransactions";

const SAFE_DISCOVERY_FAST_POLL_MS = 3_000;
const SAFE_DISCOVERY_DEFAULT_POLL_MS = 5_000;
const SAFE_DISCOVERY_SLOW_POLL_MS = 8_000;
const SAFE_DISCOVERY_FAST_WINDOW_MS = 15_000;
const SAFE_DISCOVERY_DEFAULT_WINDOW_MS = 60_000;

function getDiscoveryRefetchInterval(createdAfter?: number) {
  if (!createdAfter) {
    return SAFE_DISCOVERY_DEFAULT_POLL_MS;
  }

  const elapsedMs = Math.max(0, Date.now() - createdAfter);

  if (elapsedMs < SAFE_DISCOVERY_FAST_WINDOW_MS) {
    return SAFE_DISCOVERY_FAST_POLL_MS;
  }

  if (elapsedMs < SAFE_DISCOVERY_DEFAULT_WINDOW_MS) {
    return SAFE_DISCOVERY_DEFAULT_POLL_MS;
  }

  return SAFE_DISCOVERY_SLOW_POLL_MS;
}

export function SafeOnchainPendingDialog({
  closeDialog,
  safeAddress,
  chainId,
  expectedTo,
  expectedData,
  createdAfter,
  onTrackedTransactionDiscovered,
}: {
  closeDialog: () => void;
  safeAddress: `0x${string}`;
  chainId: number;
  expectedTo?: `0x${string}`;
  expectedData?: `0x${string}`;
  createdAfter?: number;
  onTrackedTransactionDiscovered?: (
    publish: SafeTrackedTransactionSummary
  ) => void;
}) {
  const safeQueueUrl = getSafeAppQueueUrl({
    chainId,
    safeAddress,
  });
  const hasDiscoveryTarget = Boolean(
    expectedTo && expectedData && createdAfter
  );
  const discoveryHandledRef = useRef(false);
  const discoveryQuery = useQuery({
    enabled: hasDiscoveryTarget,
    queryKey: [
      "discoverSafeTrackedTransaction",
      chainId,
      safeAddress,
      expectedTo,
      expectedData,
      createdAfter,
    ],
    queryFn: async () =>
      discoverSafeTrackedTransaction({
        kind: "publish_proposal",
        safeAddress,
        chainId,
        to: expectedTo!,
        data: expectedData!,
        createdAfter: createdAfter!,
      }),
    refetchInterval: (query) =>
      query.state.data?.found
        ? false
        : getDiscoveryRefetchInterval(createdAfter),
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  useEffect(() => {
    if (
      discoveryHandledRef.current ||
      !discoveryQuery.data?.found ||
      !discoveryQuery.data.transaction
    ) {
      return;
    }

    discoveryHandledRef.current = true;
    onTrackedTransactionDiscovered?.(discoveryQuery.data.transaction);
  }, [discoveryQuery.data, onTrackedTransactionDiscovered]);

  return (
    <div className="flex w-full max-w-[32rem] flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            Open Safe and confirm transaction
          </h2>
          <p className="text-secondary max-w-[26rem]">
            Agora is waiting for the first Safe owner to confirm this
            transaction. Once Safe submits it to the queue, this dialog will
            switch to the live signer status automatically.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-sm text-secondary">
            {hasDiscoveryTarget && discoveryQuery.isFetching
              ? "Waiting for the first Safe confirmation and queued transaction detection in the Safe app."
              : "Waiting for the first Safe confirmation in the Safe app."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {safeQueueUrl ? (
          <UpdatedButton
            fullWidth
            type="primary"
            href={safeQueueUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 flex-1 items-center justify-center rounded-lg text-center"
          >
            <span className="flex w-full items-center justify-center gap-2 whitespace-nowrap text-center">
              Open Safe <ExternalLink className="h-4 w-4" />
            </span>
          </UpdatedButton>
        ) : null}

        <UpdatedButton
          fullWidth
          type={safeQueueUrl ? "secondary" : "primary"}
          className="flex h-12 flex-1 items-center justify-center rounded-lg text-center"
          onClick={closeDialog}
        >
          Keep In Background
        </UpdatedButton>
      </div>
    </div>
  );
}

export default SafeOnchainPendingDialog;
