"use client";

import { useState, useEffect, useCallback } from "react";

import styles from "./needsMyVoteProposalLists.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
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

  console.log(proposals);

  return (
    <>
      {isConnected && proposals.length > 0 && (
        <VStack className={styles.proposals_list_container}>
          <PageHeader headerText="Needs my vote" />

          <VStack className={styles.proposals_table_container}>
            <div className={styles.proposals_table}>
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
