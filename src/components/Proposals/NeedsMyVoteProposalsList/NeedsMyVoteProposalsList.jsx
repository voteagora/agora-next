"use client";

import { useState, useEffect } from "react";

import styles from "./needsMyVoteProposalLists.module.scss";
import { HStack, VStack } from "@/components/Layout/Stack";
import PageHeader from "@/components/Layout/PageHeader/PageHeader";
import Proposal from "../Proposal/Proposal";

import { useAccount } from "wagmi";

export default function ProposalsList({
  fetchNeedsMyVoteProposals,
  votableSupply,
}) {
  const [proposals, setProposals] = useState([]);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const getProposals = async () => {
      if (address) {
        const proposals = await fetchNeedsMyVoteProposals(address);

        console.log(proposals.proposals);
        setProposals(proposals.proposals);
      }
    };
    getProposals();
  }, [address]);

  return (
    <>
      {isConnected && (
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
