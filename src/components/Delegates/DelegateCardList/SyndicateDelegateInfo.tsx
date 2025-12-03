"use client";

import { useAccount } from "wagmi";
import { UserCheck, UserPlus } from "lucide-react";
import { useProfileData } from "@/hooks/useProfileData";
import { DelegateToSelf } from "../Delegations/DelegateToSelf";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { QuickReferenceCard } from "@/components/shared/QuickReferenceCard";
import Tenant from "@/lib/tenant/tenant";

export function SyndicateDelegateInfo() {
  const { address } = useAccount();
  const { delegate } = useProfileData();
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

  const isDelegated = delegate?.address === address;

  return (
    <div className="flex flex-col space-y-4 mb-8">
      <QuickReferenceCard
        icon={UserCheck}
        title="Self-Delegation Action Card"
        learnMoreHref="/help#self-delegation"
        learnMoreText="Learn about self-delegation"
        variant={useNeutral ? "neutral" : "default"}
      >
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <p>Activate your voting power</p>
            {isDelegated ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                Not activated
              </span>
            )}
          </div>
          {selfDelegate && (
            <div>
              <DelegateToSelf delegate={selfDelegate} />
            </div>
          )}
        </div>
      </QuickReferenceCard>

      <QuickReferenceCard
        icon={UserPlus}
        title="Delegation Info Card"
        learnMoreHref="/help#delegate-to-others"
        learnMoreText="About delegation & WY DUNA"
        variant={useNeutral ? "neutral" : "default"}
      >
        <p>
          Delegate to active members below. You keep token ownership, delegate
          votes on your behalf.
        </p>
      </QuickReferenceCard>
    </div>
  );
}
