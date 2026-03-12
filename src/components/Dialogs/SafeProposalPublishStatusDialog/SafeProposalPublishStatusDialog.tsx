"use client";

import { useMemo } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";

import { UpdatedButton } from "@/components/Button";
import {
  SafeOwnerStatusRow,
  SafeSignerProgress,
} from "@/components/Safe/SafeSignerStatus";
import { useSafeMultisigTransactionStatus } from "@/hooks/useSafeMultisigTransactionStatus";
import { useSafeOwnersAndThreshold } from "@/hooks/useSafeOwnersAndThreshold";
import {
  getSafeAppQueueUrl,
  type SafeTrackedTransactionSummary,
} from "@/lib/safeTrackedTransactions";
import { getBlockScanUrl } from "@/lib/utils";

function getPendingCopy() {
  return {
    title: "Safe transaction pending signatures",
    description:
      "Agora has proposed the onchain publish transaction. Additional Safe owners can approve and execute it later, even if this tab is closed.",
  };
}

function getRemovedCopy() {
  return {
    title: "Safe transaction removed",
    description:
      "This Safe transaction was removed from the queue before execution. It will not collect more signatures or execute.",
  };
}

export function SafeProposalPublishStatusDialog({
  closeDialog,
  publish,
}: {
  closeDialog: () => void;
  publish: SafeTrackedTransactionSummary;
}) {
  const statusQuery = useSafeMultisigTransactionStatus({
    chainId: publish.chainId,
    safeTxHash: publish.safeTxHash,
    safeAddress: publish.safeAddress,
    createdAt: publish.createdAt,
  });
  const ownersAndThresholdQuery = useSafeOwnersAndThreshold({
    safeAddress: publish.safeAddress,
    chainId: publish.chainId,
  });

  const status = statusQuery.data?.status;
  const signedOwnerSet = useMemo(
    () => new Set(status?.signedOwners ?? []),
    [status?.signedOwners]
  );
  const ownerRows = useMemo(() => {
    const owners = ownersAndThresholdQuery.data?.owners ?? status?.signedOwners ?? [];
    return owners.map((owner) => ({
      owner,
      signed: signedOwnerSet.has(owner),
    }));
  }, [ownersAndThresholdQuery.data?.owners, signedOwnerSet, status?.signedOwners]);
  const threshold =
    ownersAndThresholdQuery.data?.threshold ?? status?.threshold ?? 1;
  const signedCount = status?.signedOwners.length ?? 0;
  const safeQueueUrl = getSafeAppQueueUrl({
    chainId: publish.chainId,
    safeAddress: publish.safeAddress,
  });
  const executionTxHash = status?.transactionHash ?? null;
  const isSuccessful = statusQuery.data?.isSuccessful ?? null;
  const pendingCopy = getPendingCopy();
  const removedCopy = getRemovedCopy();
  const isRemoved = statusQuery.data?.missingReason === "removed";
  const isStillIndexing =
    statusQuery.data?.found === false && statusQuery.data?.missingReason !== "removed";

  return (
    <div className="flex w-full max-w-[42rem] flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10">
          {isSuccessful === true ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          ) : isSuccessful === false ? (
            <XCircle className="h-8 w-8 text-negative" />
          ) : isRemoved ? (
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          ) : (
            <ShieldCheck className="h-8 w-8 text-primary" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {isSuccessful === true
              ? "Safe transaction executed"
              : isSuccessful === false
                ? "Safe transaction failed"
                : isRemoved
                  ? removedCopy.title
                : pendingCopy.title}
          </h2>
          <p className="text-secondary max-w-[30rem]">
            {isSuccessful === true
              ? "The Safe executed the proposal publish transaction. Agora will reflect the change once indexing catches up."
              : isSuccessful === false
                ? "The Safe transaction finished unsuccessfully. Review the Safe transaction details before retrying."
                : isRemoved
                  ? removedCopy.description
                : pendingCopy.description}
          </p>
        </div>
      </div>

      {isSuccessful === null && !isRemoved ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-neutral ring-1 ring-line shadow-xl p-6 flex flex-col items-center justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-5">
                Signatures
              </p>
              <SafeSignerProgress signed={signedCount} threshold={threshold} />
            </div>

            <div className="rounded-3xl bg-neutral ring-1 ring-line shadow-xl p-6 flex flex-col items-center justify-center">
              <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Status
              </p>
              <div className="flex flex-col items-center gap-3 text-center">
                {statusQuery.isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                ) : isStillIndexing ? (
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                ) : (
                  <Wallet className="h-8 w-8 text-primary" />
                )}
                <p className="text-sm text-secondary max-w-[14rem]">
                  {statusQuery.isLoading
                    ? "Loading Safe transaction status."
                    : isStillIndexing
                      ? "Waiting for the Safe transaction service to index the transaction."
                      : "Signer approvals are reflected here live as they arrive."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-neutral ring-1 ring-line shadow-xl overflow-hidden">
            <div className="bg-muted/30 px-6 py-4 border-b border-line flex items-center justify-between">
              <p className="text-sm font-bold text-primary tracking-tight">
                Safe Owners
              </p>
              {statusQuery.isFetching ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full">
                  <Loader2 className="h-3 w-3 animate-spin" /> Refreshing
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Status
                </span>
              )}
            </div>
            <div className="flex max-h-[16rem] flex-col gap-1 overflow-y-auto custom-scrollbar p-2">
              {ownerRows.length > 0 ? (
                ownerRows.map(({ owner, signed }) => (
                  <SafeOwnerStatusRow key={owner} owner={owner} signed={signed} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Wallet className="h-10 w-10 text-secondary/20 mb-3" />
                  <p className="text-sm font-medium text-secondary">
                    {ownersAndThresholdQuery.isError
                      ? "Error loading Safe owner details."
                      : "Fetching Safe owner details..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      <div className="rounded-2xl border border-line bg-muted/30 p-4 text-sm text-secondary">
        {executionTxHash ? (
          <span className="break-all">
            Execution tx: <span className="font-mono">{executionTxHash}</span>
          </span>
        ) : (
          <span className="break-all">
            Safe tx: <span className="font-mono">{publish.safeTxHash}</span>
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {executionTxHash ? (
          <UpdatedButton
            fullWidth
            type="primary"
            href={getBlockScanUrl(executionTxHash)}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-full flex-1 items-center justify-center rounded-lg text-center"
          >
            <span className="flex w-full items-center justify-center gap-2 whitespace-nowrap text-center">
              View Execution Tx <ExternalLink className="h-4 w-4" />
            </span>
          </UpdatedButton>
        ) : safeQueueUrl && !isRemoved ? (
          <UpdatedButton
            fullWidth
            type="primary"
            href={safeQueueUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 w-full flex-1 items-center justify-center rounded-lg text-center"
          >
            <span className="flex w-full items-center justify-center gap-2 whitespace-nowrap text-center">
              Open Safe <ExternalLink className="h-4 w-4" />
            </span>
          </UpdatedButton>
        ) : null}

        <UpdatedButton
          fullWidth
          type={executionTxHash || isRemoved ? "secondary" : "primary"}
          className="flex h-12 w-full flex-1 items-center justify-center rounded-lg text-center"
          onClick={closeDialog}
        >
          {executionTxHash || isRemoved ? "Close" : "Keep In Background"}
        </UpdatedButton>
      </div>
    </div>
  );
}

export default SafeProposalPublishStatusDialog;
