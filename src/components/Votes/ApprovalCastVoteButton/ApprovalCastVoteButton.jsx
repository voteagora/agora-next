"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./approvalCastVoteButton.module.scss";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useAgoraContext } from "@/contexts/AgoraContext";

export default function ApprovalCastVoteButton({
  proposal,
  fetchVotingPower,
  fetchAuthorityChains,
  fetchDelegate,
  fetchVoteForProposalAndDelegate,
}) {
  const [votingPower, setVotingPower] = useState("0");
  const [delegate, setDelegate] = useState({});
  const [chains, setChains] = useState([]);
  const [vote, setVote] = useState({});
  const [isReady, setIsReady] = useState(false);
  const openDialog = useOpenDialog();

  const { address } = useAccount();

  const fetchData = useCallback(async () => {
    try {
      const promises = [
        fetchVotingPower(address, proposal.snapshotBlockNumber),
        fetchDelegate(address),
        fetchAuthorityChains(address, proposal.snapshotBlockNumber),
        fetchVoteForProposalAndDelegate(proposal.id, address),
      ];

      const [votingPowerResult, delegateResult, chainsResult, voteResult] =
        await Promise.all(promises);

      setVotingPower(votingPowerResult.votingPower);
      setDelegate(delegateResult);
      setChains(chainsResult.chains);
      setVote(voteResult.vote);
      setIsReady(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [
    fetchVotingPower,
    fetchDelegate,
    fetchAuthorityChains,
    address,
    proposal,
    fetchVoteForProposalAndDelegate,
  ]);

  useEffect(() => {
    if (address && proposal.snapshotBlockNumber) {
      fetchData();
    }
  }, [fetchData, address, proposal.snapshotBlockNumber]);

  return (
    <VStack className={styles.cast_vote_container}>
      <VStack
        justifyContent="stretch"
        alignItems="stretch"
        className={styles.vote_actions}
      >
        <VoteButton
          onClick={() =>
            openDialog({
              type: "APPROVAL_CAST_VOTE",
              params: {
                proposal: proposal,
                hasStatement: !!delegate.statement,
              },
            })
          }
          proposalStatus={proposal.status}
          delegateVote={vote}
          isReady={isReady}
        />
      </VStack>
    </VStack>
  );
}

function VoteButton({ onClick, proposalStatus, delegateVote, isReady }) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();

  if (proposalStatus !== "ACTIVE") {
    return <DisabledVoteButton reason="Not open to voting" />;
  }

  if (!isConnected) {
    return (
      <Button variant={"outline"} onClick={() => setOpen(true)}>
        Connect wallet to vote
      </Button>
    );
  }

  if (!isReady) {
    return <DisabledVoteButton reason="Loading..." />;
  }

  const hasVoted = !!delegateVote?.transactionHash;

  if (hasVoted) {
    return <DisabledVoteButton reason="Already voted" />;
  }

  return (
    <HStack gap={2} className="pt-1">
      <CastButton
        onClick={() => {
          onClick();
        }}
      />
    </HStack>
  );
}

function CastButton({ onClick }) {
  const className = styles.vote_button;

  return (
    <button className={className} onClick={onClick}>
      Cast Vote
    </button>
  );
}

function DisabledVoteButton({ reason }) {
  return (
    <button disabled className={styles.vote_button_disabled}>
      {reason}
    </button>
  );
}
