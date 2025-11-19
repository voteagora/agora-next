"use client";

import { useAccount } from "wagmi";
import { useProfileData } from "@/hooks/useProfileData";
import { DelegateToSelf } from "../Delegations/DelegateToSelf";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import Tenant from "@/lib/tenant/tenant";
import Link from "next/link";
import { useMemo } from "react";
import { ZERO_ADDRESS } from "@/lib/constants";

export function SyndicateDelegateInfo() {
  const { address } = useAccount();
  const { delegate, delegatees, tokenBalance } = useProfileData();
  const { ui } = Tenant.current();
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  const selfDelegate: DelegateChunk | null = delegate
    ? {
        address: delegate.address,
        votingPower: delegate.votingPower,
        statement: delegate.statement,
        participation: delegate.participation,
      }
    : address
      ? {
          address: address,
          votingPower: { total: "0", direct: "0", advanced: "0" },
          statement: null,
          participation: 0,
        }
      : null;

  // Check delegation status
  const filteredDelegations = useMemo(() => {
    return delegatees?.filter((delegation) => delegation.to !== ZERO_ADDRESS);
  }, [delegatees]);
  const hasDelegated =
    Array.isArray(filteredDelegations) && filteredDelegations.length > 0;
  const isSelfDelegated =
    hasDelegated &&
    filteredDelegations?.some(
      (delegation) =>
        delegation.to.toLowerCase() === address?.toLowerCase()
    );

  // Determine status message
  let statusMessage = "You haven't set your voting power yet";
  if (isSelfDelegated) {
    statusMessage = "You are self-delegated";
  } else if (hasDelegated) {
    statusMessage = "You have delegated to another member";
  }

  // Only show if user has connected wallet
  if (!address) {
    return null;
  }

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3 mb-3 ${useNeutral ? "bg-neutral/30" : "bg-wash/30"} border-b border-line`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-primary">
            Your voting setup:
          </span>
          <span className="text-sm text-secondary">{statusMessage}</span>
        </div>
        <p className="text-xs text-tertiary">
          Delegating never moves your tokens; it only points your voting power.{" "}
          <Link
            href="/info#delegation"
            className="text-link hover:underline"
          >
            Learn about delegation
          </Link>
        </p>
      </div>
      {selfDelegate && !isSelfDelegated && (
        <div className="flex-shrink-0">
          <DelegateToSelf delegate={selfDelegate} />
        </div>
      )}
    </div>
  );
}
