"use client";
import { useState, useEffect } from "react";

import PageHeader from "@/components/Layout/PageHeader/PageHeader";

import { useAccount } from "wagmi";
import { ProposalDraft } from "@prisma/client";
import DraftProposalsListRow from "./DraftProposalsListRow";

interface DraftProposalsListProps {
  fetchDraftProposals: (address: string) => Promise<ProposalDraft[]>;
}

export default function DraftProposalsList(props: DraftProposalsListProps) {
  const [proposals, setProposals] = useState<ProposalDraft[]>([]);
  const { address, isConnected } = useAccount();

  const { fetchDraftProposals } = props;

  const getProposals = async () => {
    if (!!address) {
      const proposals = await fetchDraftProposals(address);

      setProposals(proposals);
    }
  };

  useEffect(() => {
    // reset when changing wallets
    // setProposals([]);

    console.log("address", address);

    getProposals();
  }, [address]);

  return (
    <>
      {isConnected && proposals.length > 0 && (
        <div className={""}>
          <h1 className="text-2xl font-black mt-12 sm:mt-6 mb-4">
            My proposals
          </h1>
          <div className={"flex flex-col gap-y-4"}>
            {proposals.map((proposal) => (
              <DraftProposalsListRow key={proposal.id} proposal={proposal} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
