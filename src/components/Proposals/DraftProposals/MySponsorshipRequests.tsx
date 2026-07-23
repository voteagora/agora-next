"use client";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { ProposalDraft } from "@prisma/client";
import DraftProposalCard from "./DraftProposalCard";
import Tenant from "@/lib/tenant/tenant";

const MySponsorshipRequests = ({
  fetchDraftProposals,
  onCountChange,
}: {
  fetchDraftProposals: (address: `0x${string}`) => Promise<ProposalDraft[]>;
  onCountChange?: (count: number) => void;
}) => {
  const { ui } = Tenant.current();
  const copy = ui.copy;
  const { address } = useAccount();
  const [draftProposals, setDraftProposals] = useState<ProposalDraft[]>([]);

  const getDraftProposalsAndSet = useCallback(
    async (address: `0x${string}`) => {
      try {
        const proposals = await fetchDraftProposals(address);
        setDraftProposals(proposals);
        onCountChange?.(proposals.length);
      } catch (error) {
        console.error("Error fetching sponsorship requests:", error);
        setDraftProposals([]);
        onCountChange?.(0);
      }
    },
    [fetchDraftProposals, onCountChange]
  );

  useEffect(() => {
    if (!address) {
      setDraftProposals([]);
      onCountChange?.(0);
      return;
    }
    getDraftProposalsAndSet(address);
  }, [address, getDraftProposalsAndSet, onCountChange]);

  if (!draftProposals.length) {
    return null;
  }

  return (
    <div className="mb-16">
      <h1 className="text-2xl font-black mb-6">
        {copy.proposals.sponsorshipRequestsTitle}
      </h1>
      <div className="space-y-6">
        {draftProposals.map((proposal) => (
          <Link
            key={proposal.id}
            href={`/proposals/sponsor/${proposal.uuid || proposal.id}`}
            className="block"
          >
            <DraftProposalCard proposal={proposal} showDelete={false} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MySponsorshipRequests;
