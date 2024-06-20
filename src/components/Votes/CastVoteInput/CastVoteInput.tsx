"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
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
    <VStack className="bg-neutral border border-line rounded-lg flex-shrink mx-4">
      <textarea
        placeholder="I believe..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="text-sm p-4 resize-none rounded-lg border-0 focus:outline-none focus:inset-0 focus:shadow-none focus:outline-offset-0"
      />
      <VStack
        justifyContent="justify-between"
        alignItems="items-stretch"
        className="px-3 pb-3 pt-1"
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
  const actionString = action.toLowerCase();

  return (
    <button
      className={`${actionString === "for" ? "text-positive" : actionString === "against" ? "text-negative" : "text-secondary"} bg-neutral rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1`}
      onClick={onClick}
    >
      {action.toLowerCase()}
    </button>
  );
}

function DisabledVoteButton({ reason }: { reason: string }) {
  return (
    <button
      disabled
      className="bg-neutral rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1"
    >
      {reason}
    </button>
  );
}
