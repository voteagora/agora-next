"use client";
import { useState, useEffect, useCallback } from "react";

import PageHeader from "@/components/Layout/PageHeader/PageHeader";

import { useAccount } from "wagmi";
import { ProposalDraft } from "@prisma/client";
import DraftProposalsListRow from "./DraftProposalsListRow";
import Link from "next/link";
import { useAgoraContext } from "@/contexts/AgoraContext";

interface DraftProposalsListProps {
  fetchDraftProposals: (address: string) => Promise<ProposalDraft[]>;
}

export default function DraftProposalsList(props: DraftProposalsListProps) {
  const [proposals, setProposals] = useState<ProposalDraft[]>([]);
  const { isConnected } = useAgoraContext();
  const { address } = useAccount();

  const { fetchDraftProposals } = props;

  const getProposalsAndSet = useCallback(async (authorAddress: string) => {
    const proposals = await fetchDraftProposals(authorAddress);
    setProposals(proposals);
  }, []);

  useEffect(() => {
    if (!address) return;
    getProposalsAndSet(address);
  }, [fetchDraftProposals, address]);

  return (
    <>
      {proposals.length > 0 && (
        <div className={""}>
          <h1 className="text-2xl font-black mt-12 sm:mt-6 mb-4">
            My proposals
          </h1>
          <div className={"flex flex-col gap-y-4"}>
            {proposals.map((proposal) => (
              <Link key={proposal.id} href={`/proposals/draft/${proposal.id}`}>
                <DraftProposalsListRow proposal={proposal} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
