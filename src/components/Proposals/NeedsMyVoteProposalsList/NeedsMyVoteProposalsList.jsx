"use client";

import { useState, useEffect, useCallback } from "react";
import { VStack } from "@/components/Layout/Stack";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import Proposal from "../Proposal/Proposal";
import { useAccount } from "wagmi";

export default function NeedsMyVoteProposalsList({
  fetchNeedsMyVoteProposals,
  votableSupply,
}) {
  const [proposals, setProposals] = useState([]);
  const { address, isConnected } = useAccount();

  const getProposals = useCallback(async () => {
    if (address) {
      const proposals = await fetchNeedsMyVoteProposals(address);

      setProposals(proposals.proposals);
    }
  }, [address, fetchNeedsMyVoteProposals]);

  useEffect(() => {
    // reset when changing wallets
    setProposals([]);

    getProposals();
  }, [getProposals, address]);

  return (
    <>
      {isConnected && proposals.length > 0 && (
        <VStack className="max-w-[76rem]">
          <PageHeader headerText="Needs my vote" />

          <VStack className="border border-line rounded-xl shadow-newDefault overflow-hidden mb-6">
            <div>
              {proposals.map((proposal) => (
                <Proposal
                  key={`${proposal.id}_${proposal.status}`}
                  proposal={proposal}
                  votableSupply={votableSupply}
                />
              ))}
            </div>
          </VStack>
        </VStack>
      )}
    </>
  );
}
