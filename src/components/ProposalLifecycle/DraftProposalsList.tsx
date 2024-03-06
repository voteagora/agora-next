"use client";
import { useState, useEffect } from "react";

import PageHeader from "@/components/Layout/PageHeader/PageHeader";

import { useAccount } from "wagmi";
import { ProposalDraft } from "@prisma/client";
import DraftProposalsListRow from "./DraftProposalsListRow";
import Link from "next/link";

interface DraftProposalsListProps {
  fetchDraftProposals: (address: string) => Promise<ProposalDraft[]>;
}

export default function DraftProposalsList(props: DraftProposalsListProps) {
  const [proposals, setProposals] = useState<ProposalDraft[]>([]);
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);

  const { fetchDraftProposals } = props;

  const getProposals = async (authorAddress: string) => {
    if (!!authorAddress && !loading) {
      setLoading(true);
      const proposals = await fetchDraftProposals(authorAddress);

      setProposals(proposals);
      setLoading(false);
    }
  };

  useEffect(() => {
    // reset when changing wallets
    // setProposals([]);
    if (!!address) {
      getProposals(address);
    }
  }, [address]);

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
