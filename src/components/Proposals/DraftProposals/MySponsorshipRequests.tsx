"use client";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { ProposalDraft } from "@prisma/client";
import DraftProposalCard from "./DraftProposalCard";

const MySponsorshipRequests = ({
  fetchDraftProposals,
}: {
  fetchDraftProposals: (address: `0x${string}`) => Promise<ProposalDraft[]>;
}) => {
  const { address } = useAccount();
  const [draftProposals, setDraftProposals] = useState<ProposalDraft[]>([]);

  const getDraftProposalsAndSet = useCallback(
    async (address: `0x${string}`) => {
      const proposals = await fetchDraftProposals(address);
      setDraftProposals(proposals);
    },
    []
  );

  useEffect(() => {
    if (!address) return;
    getDraftProposalsAndSet(address);
  }, [fetchDraftProposals, address]);

  if (!draftProposals.length) {
    return null;
  }

  return (
    <div className="mb-16">
      <h1 className="text-2xl font-black mb-6">Requests for sponsorship</h1>
      <div className="space-y-6">
        {draftProposals.map((proposal) => (
          <Link
            key={proposal.id}
            href={`/proposals/sponsor/${proposal.uuid || proposal.id}`}
            className="block"
          >
            <DraftProposalCard proposal={proposal} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MySponsorshipRequests;
