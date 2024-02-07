"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./castVoteInput.module.scss";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { SupportTextProps } from "@/components/Proposals/ProposalPage/CastVoteDialog/CastVoteDialog";
import { VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import { MissingVote, checkMissingVoteForDelegate } from "@/lib/voteUtils";
import { Delegate } from "@/app/api/common/delegates/delegate";

type Props = {
  proposal: Proposal;
  isOptimistic?: boolean;
  fetchAllForVoting: (
    address: string | `0x${string}`,
    blockNumber: number,
    proposal_id: string
  ) => Promise<{
    votingPower: VotingPowerData;
    authorityChains: string[][];
    delegate: Delegate;
    votesForProposalAndDelegate: Vote[];
  }>;
};

export default function CastVoteInput({
  proposal,
  isOptimistic = false,
  fetchAllForVoting,
}: Props) {
  const [reason, setReason] = useState("");
  const [votingPower, setVotingPower] = useState<VotingPowerData>({
    directVP: "0",
    advancedVP: "0",
    totalVP: "0",
  });
  const [delegate, setDelegate] = useState({});
  const [chains, setChains] = useState<string[][]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isReady, setIsReady] = useState(false);
  const openDialog = useOpenDialog();

  const { address } = useAccount();

  const fetchData = useCallback(async () => {
    setIsReady(false);
    try {
      const {
        votingPower,
        authorityChains,
        delegate,
        votesForProposalAndDelegate,
      } = await fetchAllForVoting(
        address!,
        proposal.snapshotBlockNumber,
        proposal.id
      );

      setVotingPower(votingPower);
      setDelegate(delegate);
      setChains(authorityChains);
      setVotes(votesForProposalAndDelegate);
      setIsReady(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [address, proposal, fetchAllForVoting]);

  useEffect(() => {
    if (address && proposal.snapshotBlockNumber) {
      fetchData();
    }
  }, [fetchData, address, proposal.snapshotBlockNumber]);

  return (
    <VStack className={styles.cast_vote_container}>
      <textarea
        placeholder="I believe..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="text-sm"
      />
      <VStack
        justifyContent="justify-between"
        alignItems="items-stretch"
        className={styles.vote_actions}
      >
        <VoteButtons
          onClick={(
            supportType: SupportTextProps["supportType"],
            missingVote: MissingVote
          ) =>
            openDialog({
              type: "CAST_VOTE",
              params: {
                reason,
                supportType,
                proposalId: proposal.id,
                delegate,
                votingPower,
                authorityChains: chains,
                missingVote,
              },
            })
          }
          proposalStatus={proposal.status}
          delegateVotes={votes}
          isReady={isReady}
          isOptimistic={isOptimistic}
          votingPower={votingPower}
        />
      </VStack>
    </VStack>
  );
}

function VoteButtons({
  onClick,
  proposalStatus,
  delegateVotes,
  isReady,
  isOptimistic,
  votingPower,
}: {
  onClick: (
    supportType: SupportTextProps["supportType"],
    missingVote: MissingVote
  ) => void;
  proposalStatus: Proposal["status"];
  delegateVotes: Vote[];
  isReady: boolean;
  isOptimistic: boolean;
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
      {(isOptimistic ? ["AGAINST"] : ["FOR", "AGAINST", "ABSTAIN"]).map(
        (supportType) => (
          <VoteButton
            key={supportType}
            action={supportType as SupportTextProps["supportType"]}
            onClick={() => {
              onClick(
                supportType as SupportTextProps["supportType"],
                missingVote
              );
            }}
          />
        )
      )}
    </HStack>
  );
}

function VoteButton({
  action,
  onClick,
}: {
  action: SupportTextProps["supportType"];
  onClick: () => void;
}) {
  const className = `${styles["vote_button_" + action.toLowerCase()]}`;

  return (
    <button className={className} onClick={onClick}>
      {action.toLowerCase()}
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
