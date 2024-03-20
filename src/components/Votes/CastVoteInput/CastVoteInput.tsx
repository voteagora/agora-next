"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import styles from "./castVoteInput.module.scss";
import { useState } from "react";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { SupportTextProps } from "@/components/Proposals/ProposalPage/CastVoteDialog/CastVoteDialog";
import { type VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import { MissingVote, checkMissingVoteForDelegate } from "@/lib/voteUtils";
import useFetchAllForVoting from "@/hooks/useFetchAllForVoting";

type Props = {
  proposal: Proposal;
  isOptimistic?: boolean;
};

export default function CastVoteInput({
  proposal,
  isOptimistic = false,
}: Props) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();
  const [reason, setReason] = useState("");
  const openDialog = useOpenDialog();
  const { chains, delegate, isSuccess, votes, votingPower } =
    useFetchAllForVoting({
      proposal,
    });

  if (!isConnected) {
    return (
      <div className="flex flex-col justify-between pt-1 pb-3 px-3 mx-4">
        <Button variant={"outline"} onClick={() => setOpen(true)}>
          Connect wallet to vote
        </Button>
      </div>
    );
  }

  if (!isSuccess || !chains || !delegate || !votes || !votingPower) {
    return (
      <div className="flex flex-col justify-between pt-1 pb-3 px-3 mx-4">
        <DisabledVoteButton reason="Loading..." />
      </div>
    );
  }

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
  isOptimistic,
  votingPower,
}: {
  onClick: (
    supportType: SupportTextProps["supportType"],
    missingVote: MissingVote
  ) => void;
  proposalStatus: Proposal["status"];
  delegateVotes: Vote[];
  isOptimistic: boolean;
  votingPower: VotingPowerData;
}) {
  if (proposalStatus !== "ACTIVE") {
    return <DisabledVoteButton reason="Not open to voting" />;
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
