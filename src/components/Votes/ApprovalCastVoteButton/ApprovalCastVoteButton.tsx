"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./approvalCastVoteButton.module.scss";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Proposal } from "@/app/api/proposals/proposal";
import { Delegate } from "@/app/api/delegates/delegate";
import { Vote } from "@/app/api/votes/vote";
import { VotingPowerData } from "@/app/api/voting-power/votingPower";
import { fetchAndSetAll } from "@/lib/utils";
import { MissingVote, checkMissingVoteForDelegate } from "@/lib/voteUtils";

type Props = {
  proposal: Proposal;
  fetchVotingPower: (
    addressOrENSName: string | `0x${string}`,
    blockNumber: number
  ) => Promise<VotingPowerData>;
  fetchAuthorityChains: (
    address: string | `0x${string}`,
    blockNumber: number
  ) => Promise<{ chains: string[][] }>;
  fetchDelegate: (
    addressOrENSName: string | `0x${string}`
  ) => Promise<Delegate>;
  fetchVotesForProposalAndDelegate: (
    proposal_id: string,
    address: string | `0x${string}`
  ) => Promise<Vote[]>;
};

export default function ApprovalCastVoteButton({
  proposal,
  fetchVotingPower,
  fetchAuthorityChains,
  fetchDelegate,
  fetchVotesForProposalAndDelegate,
}: Props) {
  const [votingPower, setVotingPower] = useState<VotingPowerData>({
    directVP: "0",
    advancedVP: "0",
    totalVP: "0",
  });
  const [delegate, setDelegate] = useState<Delegate>();
  const [chains, setChains] = useState<string[][]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isReady, setIsReady] = useState(false);
  const openDialog = useOpenDialog();

  const { address } = useAccount();

  const fetchData = useCallback(async () => {
    try {
      await fetchAndSetAll(
        [
          () => fetchVotingPower(address!, proposal.snapshotBlockNumber),
          () => fetchDelegate(address!),
          async () =>
            (
              await fetchAuthorityChains(address!, proposal.snapshotBlockNumber)
            ).chains,
          () => fetchVotesForProposalAndDelegate(proposal.id, address!),
        ],
        [setVotingPower, setDelegate, setChains, setVotes]
      );

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
    fetchVotesForProposalAndDelegate,
  ]);

  useEffect(() => {
    if (address && proposal.snapshotBlockNumber) {
      fetchData();
    }
  }, [fetchData, address, proposal.snapshotBlockNumber]);

  return (
    <VStack className={styles.cast_vote_container}>
      <VStack alignItems="items-stretch" className={styles.vote_actions}>
        <VoteButton
          onClick={(missingVote: MissingVote) =>
            openDialog({
              type: "APPROVAL_CAST_VOTE",
              params: {
                proposal: proposal,
                hasStatement: !!delegate?.statement,
                votingPower,
                authorityChains: chains,
                missingVote,
              },
            })
          }
          proposalStatus={proposal.status}
          delegateVotes={votes}
          isReady={isReady}
          votingPower={votingPower}
        />
      </VStack>
    </VStack>
  );
}

function VoteButton({
  onClick,
  proposalStatus,
  delegateVotes,
  isReady,
  votingPower,
}: {
  onClick: (missingVote: MissingVote) => void;
  proposalStatus: Proposal["status"];
  delegateVotes: Vote[];
  isReady: boolean;
  votingPower: VotingPowerData;
}) {
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

  const missingVote = checkMissingVoteForDelegate(delegateVotes, votingPower);

  if (missingVote === "NONE") {
    return <DisabledVoteButton reason="Already voted" />;
  }

  return (
    <HStack gap={2} className="pt-1">
      <CastButton
        onClick={() => {
          onClick(missingVote);
        }}
      />
    </HStack>
  );
}

function CastButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.vote_button} onClick={onClick}>
      Cast Vote
    </button>
  );
}

function DisabledVoteButton({ reason }: { reason: string }) {
  return (
    <button disabled className={styles.vote_button_disabled}>
      {reason}
    </button>
  );
}
