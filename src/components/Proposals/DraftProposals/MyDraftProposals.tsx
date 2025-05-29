"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { ProposalDraft } from "@prisma/client";
import { getStageIndexForTenant } from "@/app/proposals/draft/utils/stages";
import DraftProposalCard from "./DraftProposalCard";
import Tenant from "@/lib/tenant/tenant";
import { useSelectedWallet } from "@/contexts/SelectedWalletContext";
import { useSafePendingTransactions } from "@/hooks/useSafePendingTransactions";
import { SafePendingProposalCard } from "./SafePendingProposalCard";

const MyDraftProposals = ({
  fetchDraftProposals,
}: {
  fetchDraftProposals: (address: `0x${string}`) => Promise<ProposalDraft[]>;
}) => {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const { selectedWalletAddress: address } = useSelectedWallet();
  const [draftProposals, setDraftProposals] = useState<ProposalDraft[]>([]);
  const { pendingProposals } =
    useSafePendingTransactions();
  const getDraftProposalsAndSet = useCallback(
    async (authorAddress: `0x${string}`) => {
      const proposals = await fetchDraftProposals(authorAddress);
      setDraftProposals(proposals);
    },
    [fetchDraftProposals]
  );

  useEffect(() => {
    if (!address) return;
    getDraftProposalsAndSet(address);
  }, [fetchDraftProposals, address, getDraftProposalsAndSet]);

  if (!draftProposals.length && Object.entries(pendingProposals).length === 0) {
    return null;
  }

  if (!plmToggle || !plmToggle.enabled) {
    return null;
  }

  return (
    <div className="mb-16">
      <h1 className="text-2xl font-black mb-6 mt-4 sm:mt-0 text-primary">
        My proposals
      </h1>
      <div className="space-y-6">
        {Object.entries(pendingProposals).length > 0 && (
          <>
            {Object.entries(pendingProposals).map(([txHash, proposal]) => (
              <SafePendingProposalCard
                key={txHash}
                proposal={proposal}
                txHash={txHash}
              />
            ))}
          </>
        )}
        {draftProposals.map((proposal) => {
          return (
            <Link
              key={proposal.id}
              href={`/proposals/draft/${proposal.id}?stage=${getStageIndexForTenant(proposal.stage)}`}
              className="block"
            >
              <DraftProposalCard proposal={proposal} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MyDraftProposals;
