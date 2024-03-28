"use client";
import { useState, useEffect, useCallback } from "react";

import { useAccount } from "wagmi";
import { ProposalDraft } from "@prisma/client";
import DraftProposalsListRow from "./DraftProposalsListRow";
import Link from "next/link";

interface SponsorshipRequestListProps {
  fetchSponsorshipRequests: (address: string) => Promise<ProposalDraft[]>;
}

export default function SponsorshipRequestList(
  props: SponsorshipRequestListProps
) {
  const [proposals, setProposals] = useState<ProposalDraft[]>([]);
  const { address } = useAccount();

  const { fetchSponsorshipRequests } = props;

  const getProposalsAndSet = useCallback(async (authorAddress: string) => {
    const proposals = await fetchSponsorshipRequests(authorAddress);
    setProposals(proposals);
  }, []);

  useEffect(() => {
    if (!address) return;
    getProposalsAndSet(address);
  }, [fetchSponsorshipRequests, address]);

  return (
    <>
      {proposals.length > 0 && (
        <div className={""}>
          <h1 className="text-2xl font-black mt-12 sm:mt-6 mb-4">
            Requests for Sponsorship
          </h1>
          <div className={"flex flex-col gap-y-4"}>
            {proposals.map((proposal) => (
              <Link
                key={proposal.id}
                href={`/proposals/sponsor/${proposal.id}`}
              >
                <DraftProposalsListRow key={proposal.id} proposal={proposal} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
