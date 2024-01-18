"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalPage.module.scss";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import { Proposal } from "@/app/api/proposals/proposal";
import OpManagerDeleteProposal from "./OpManagerDeleteProposal";
import { useAccount } from "wagmi";
import {
  fetchProposalVotes,
  fetchVotingPower,
  fetchBalanceForDirectDelegation,
  fetchAuthorityChains,
  fetchDelegate,
  fetchDelegateStatement,
  fetchVotesForProposalAndDelegate,
  fetchVotingPowerForSubdelegation,
  checkIfDelegatingToProxy,
  fetchCurrentDelegatees,
  fetchDirectDelegatee,
  getProxyAddress,
  getDelegators,
  fetchAll,
} from "@/app/proposals/actions";
import { useCallback, useEffect, useState } from "react";
import { fetchAndSetAll } from "@/lib/utils";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";

export default async function OPProposalPage({
  id,
  snapshotBlockNumber,
  proposal,
  proposalVotes,
}: {
  id: string;
  snapshotBlockNumber: number;
  proposal: any;
  proposalVotes: any;
}) {
  const { address } = useAccount();
  const [reason, setReason] = useState("");
  // TODO: frh -> typings
  const [votingPower, setVotingPower] = useState<any>({
    directVP: "0",
    advancedVP: "0",
    totalVP: "0",
  });
  const [delegate, setDelegate] = useState({});
  const [chains, setChains] = useState<any[][]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false);
  console.log("address: ", address);

  const fetchData = useCallback(async () => {
    try {
      console.log("6 proposal", Date.now() / 1000);
      [setVotingPower, setDelegate, setChains, setVotes];
      const eo = await fetchAll(address!, id, snapshotBlockNumber);
      setVotingPower(eo[0]);
      setDelegate(eo[1]);
      // @ts-ignore
      setChains(eo[2]);
      // @ts-ignore
      setVotes(eo[3]);

      console.log("eo: ", eo);

      setIsReady(true);
      console.log("7 proposal", Date.now() / 1000);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [id, address, snapshotBlockNumber]);

  useEffect(() => {
    if (address && snapshotBlockNumber) {
      console.log(
        "5 proposal",
        Date.now() / 1000,
        "address",
        address,
        "snapshotBlockNumber",
        snapshotBlockNumber
      );
      fetchData();
    }
  }, [fetchData, address, snapshotBlockNumber]);

  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <HStack
      gap={16}
      justifyContent="justify-between"
      alignItems="items-start"
      className={styles.proposal_container}
    >
      <ProposalDescription proposal={proposal} />
      <div>
        <OpManagerDeleteProposal proposal={proposal} />

        <VStack
          gap={4}
          justifyContent="justify-between"
          className={styles.proposal_votes_container}
        >
          <VStack gap={4} className={styles.proposal_actions_panel}>
            <div>
              <div className={styles.proposal_header}>Proposal votes</div>
              <ProposalVotesSummary proposal={proposal} />
            </div>
            <ProposalVotesList
              initialProposalVotes={proposalVotes}
              proposal_id={id}
            />
            <CastVoteInput
              proposal={proposal}
              votingPower={votingPower}
              delegate={delegate}
              chains={chains}
              votes={votes}
              isReady={isReady}
            />
          </VStack>
        </VStack>
      </div>
    </HStack>
  );
}
