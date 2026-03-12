"use client";

import { ShieldCheck } from "lucide-react";
import { useAccount } from "wagmi";

import { UpdatedButton } from "@/components/Button";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useActiveSafeTrackedTransactions } from "@/hooks/useActiveSafeTrackedTransactions";
import type { SafeTrackedTransactionKind } from "@/lib/safeTrackedTransactions";

function getPublishLabel(kind: SafeTrackedTransactionKind) {
  if (kind === "publish_proposal") {
    return "Pending Safe proposal publish";
  }

  return "Pending Safe transaction";
}

export function SafeProposalPublishBanner() {
  const { address } = useAccount();
  const openDialog = useOpenDialog();
  const publishesQuery = useActiveSafeTrackedTransactions({
    kind: "publish_proposal",
    safeAddress: address,
    enabled: Boolean(address),
  });

  if (!address || publishesQuery.isError || !publishesQuery.data?.length) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-col gap-3">
      {publishesQuery.data.map((publish) => (
        <div
          key={publish.safeTxHash}
          className="flex flex-col gap-4 rounded-2xl border border-line bg-neutral px-4 py-4 shadow-newDefault sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-primary">
                {getPublishLabel(publish.kind)}
              </p>
              <p className="text-sm text-secondary">
                This Safe transaction is still waiting for approvals or
                execution. You can reopen the live signer status at any time.
              </p>
            </div>
          </div>

          <UpdatedButton
            type="primary"
            className="h-11 px-5 sm:w-auto"
            onClick={() =>
              openDialog({
                type: "SAFE_PROPOSAL_PUBLISH_STATUS",
                className: "sm:w-[44rem]",
                params: {
                  publish,
                },
              })
            }
          >
            Open Status
          </UpdatedButton>
        </div>
      ))}
    </div>
  );
}

export default SafeProposalPublishBanner;
